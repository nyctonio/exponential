import { AppDataSource } from 'database/sql';
import Ledger from 'entity/ledger';
import Trade from 'entity/trade';
import redisClient from 'lib/redis';
import Instruments from 'entity/instruments';
import ProjectSetting from 'entity/project-settings';
import MarginHandler from '../methods/margin';

class DeleteOrder {
  orderId: number;
  userId: number | null;
  constructor(orderId: number, userId?: number | null) {
    this.orderId = orderId;
    this.userId = userId;
  }

  public async deleteOrder() {
    let trade = new Trade({ userId: -1, redisClient });
    let ledger = new Ledger({ userId: -1, redisClient });
    await AppDataSource.transaction(async (tmanager) => {
      trade.setTransactionManager(tmanager);
      ledger.setTransactionManager(tmanager);
      let allChildOrders = await trade.getAllChildOrders(this.orderId);
      let allOrdersToUpdate = [
        ...allChildOrders.map((a) => a.id),
        this.orderId,
      ];
      await trade.deleteMultipleOrders(allOrdersToUpdate);
      await ledger.deleteLedgerByOrderIds(allOrdersToUpdate);
      return;
    });
    return;
  }

  public async cancelPendingOrder() {
    let trade = new Trade({ userId: this.userId, redisClient });
    let order = await trade.getOrderById(this.orderId);
    let ledger = new Ledger({ userId: this.userId, redisClient });
    let instrument = new Instruments();
    let scriptData = await instrument.getInstrumentByTradingSymbol(
      order.scriptName
    );

    const margin_hold = await ledger.getLedgerByOrderIdAndParticular({
      orderId: this.orderId,
      particularName: 'Margin Hold',
    });

    console.log('margin hold is ', margin_hold);

    if (order.transactionStatus == 'pending') {
      await AppDataSource.transaction(async (tmanager) => {
        ledger.setTransactionManager(tmanager);
        trade.setTransactionManager(tmanager);
        if (margin_hold) {
          await MarginHandler.releaseMargin({
            marginAmount: margin_hold.transactionAmount,
            orderId: this.orderId,
            tmanager: tmanager,
            userId: this.userId,
          });
        }
        await trade.updateOrder({
          id: order.id,
          quantityLeft: 0,
          transactionStatus: 'cancelled',
        });
        await redisClient.hDel(
          `limit-${scriptData.instrument_token}-${order.tradeType}`,
          `${this.userId}-${order.id}`
        );
      });
    } else {
      throw new Error('Order has been executed');
    }
  }
}

export default DeleteOrder;
