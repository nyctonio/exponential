import { redisClient } from '../../lib/redis';
import Trade from 'entity/trade';
import { AppDataSource } from 'database/sql';
import Instruments from 'entity/instruments';
import { m_transaction } from 'database/sql/schema';
import Ledger from 'entity/ledger';
import ProjectSetting from 'entity/project-settings';

// `limit-${instrumentData.instrument_token}-B`
class PendingOrdersHandler {
  private static async redisKeysHandler(pendingOrders: m_transaction[]) {
    let instruments = new Instruments();
    let instrumentsData = await instruments.getAllInstruments();
    let redisKeys = pendingOrders.map((orderData) => {
      let checkInstrument = instrumentsData.find(
        (a) => a.tradingsymbol == orderData.scriptName
      );
      if (checkInstrument) {
        return {
          key: `limit-${checkInstrument.instrument_token}-${orderData.tradeType}`,
          userId: orderData.user.id,
          orderId: orderData.id,
        };
      }
    });

    const delete_multi = redisClient.multi();
    redisKeys.map((a) => {
      delete_multi.hDel(a.key, `${a.userId}-${a.orderId}`);
    });
    await delete_multi.exec();
    return;
  }

  public static async cancelPendingOrders(exchange: 'NSE' | 'MCX') {
    try {
      let trade = new Trade({ redisClient: redisClient, userId: -1 });
      let ledger = new Ledger({ userId: -1, redisClient });
      let projectSetting = new ProjectSetting();

      let [transactionTypeData, transactionParticularData] = await Promise.all([
        projectSetting.getProjectSettingByKeyAndConstant('TRXNTYP', 'Credit'),
        projectSetting.getProjectSettingByKeyAndConstant(
          'TRXNPRT',
          'Margin Released'
        ),
      ]);
      await AppDataSource.transaction(async (tmanager) => {
        ledger.setTransactionManager(tmanager);
        trade.setTransactionManager(tmanager);
        //fetching pending orders
        let pendingOrders = await trade.getAllPendingOrders(exchange);
        //fetching the margin records
        let marginHoldLedgerRecords =
          await ledger.getMultipleLedgerByOrderIdAndParticular(
            pendingOrders.map((a) => a.id),
            'Margin Hold'
          );
        let marginReleasedLedgerRecords = marginHoldLedgerRecords.map((a) => {
          return {
            order: {
              id: a.order.id,
            },
            user: {
              id: a.user.id,
            },
            transactionAmount: a.transactionAmount,
            transactionParticular: transactionParticularData.id,
            transactionRemarks: a.transactionRemarks.replace(
              'hold',
              'released'
            ),
            transactionType: transactionTypeData.id,
            transactionDate: a.transactionDate,
          };
        });
        //crediting Margin
        await ledger.createMultipleUserLedger(marginReleasedLedgerRecords);
        //cancelling orders
        await trade.cancelAllPendingOrders(pendingOrders.map((a) => a.id));
        //removing from redis
        await this.redisKeysHandler(pendingOrders);
        //updating balance in redis

        let userIds = marginReleasedLedgerRecords.map((a) => a.user.id);
        let userSet = new Set(userIds);
        await Promise.all(
          [...userSet].map((a) => {
            let userLedger = new Ledger({ userId: a, redisClient });
            userLedger.updateBalanceRedis();
          })
        );

        return;
      });

      return true;
    } catch (e) {
      //initiating alerts for script fail
      console.log('error in pending orders cancellation ', e);
      return false;
    }
  }
}

export default PendingOrdersHandler;
