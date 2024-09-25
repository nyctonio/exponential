import { AppDataSource } from 'database/sql';
import { m_transaction } from 'database/sql/schema';
import Instruments from 'entity/instruments';
import Ledger from 'entity/ledger';
import ProjectSetting from 'entity/project-settings';
import Trade from 'entity/trade';
import redisClient from 'lib/redis';
import { msgType } from 'order/workflows/create';
import moment from 'moment';
import { MarginHandler } from 'order';
import { queue } from '../../lib/queue';
import { env } from 'env';
import SmSquareOff from '../daily-settlement/sm-squareoff';

class TransferOrder {
  private static async constructOrder(
    order: m_transaction,
    quantity: number,
    isIntraday: boolean,
    userId: number,
    brokerage: number,
    liveScriptData: any
  ) {
    let margin = await MarginHandler.calculateMargin({
      userId: order.user.id,
      orderData: {
        exchangeName: order.exchange,
        isIntraday: false,
        price: null,
        quantity: quantity,
        tradeType: order.tradeType,
        tradingSymbol: order.scriptName,
      },
      scriptData: {
        buyPrice: liveScriptData.close,
        sellPrice: liveScriptData.close,
        lotSize: order.lotSize,
      },
    });
    let msg: msgType = {
      brokerage,
      brokerageChargedRate: order.brokerageChargedRate,
      brokerageChargedType: order.brokerageChargedType,
      isIntraday,
      margin: margin.marginAmount,
      marginChargedRate: margin.marginChargedRate,
      marginChargedType: margin.marginType,
      orderCreationDate: moment().toDate(),
      orderType: 'market',
      price: null,
      quantity: quantity,
      script:
        order.exchange == 'NSE'
          ? 'NFO' + ':' + order.scriptName
          : order.exchange + ':' + order.scriptName,

      squareoff: '',
      transactionType: '',
      type: order.tradeType,
      userId,
      execData: {
        ...liveScriptData,
        buyPrice: liveScriptData.close,
        sellPrice: liveScriptData.close,
      },
    };
    return msg;
  }
  public static async transferOrder(exchange: 'NSE' | 'MCX') {
    let trade = new Trade({ redisClient: redisClient, userId: -1 });
    let projectSetting = new ProjectSetting();

    let [marginHoldKey, marginReleasedKey, tradeLossKey, tradeProfitKey] =
      await Promise.all([
        projectSetting.getProjectSettingByKeyAndConstant(
          'TRXNPRT',
          'Margin Hold'
        ),
        projectSetting.getProjectSettingByKeyAndConstant(
          'TRXNPRT',
          'Margin Released'
        ),
        projectSetting.getProjectSettingByKeyAndConstant(
          'TRXNPRT',
          'Trade Loss'
        ),
        projectSetting.getProjectSettingByKeyAndConstant(
          'TRXNPRT',
          'Trade Profit'
        ),
      ]);

    await AppDataSource.transaction(async (tmanager) => {
      trade.setTransactionManager(tmanager);
      let openOrders = await trade.getAllNormalOpenOrders(exchange);
      console.log('all open orders ', openOrders);
      await Promise.all(
        openOrders.map(async (orderData) => {
          let ledger = new Ledger({ userId: orderData.user.id, redisClient });
          ledger.setTransactionManager(tmanager);
          console.log('order data is ', orderData);
          let releaseMargin =
            (orderData.margin / orderData.quantity) * orderData.quantityLeft;
          console.log('release margin is ', releaseMargin);
          await ledger.creditBalance({
            amount: releaseMargin,
            currUserId: null,
            transactionParticularId: marginReleasedKey.id,
            transactionRemarks: `Margin Released for ${orderData.id}`,
            orderId: orderData.id,
          });

          let instrument = new Instruments();
          let liveScriptData =
            await instrument.getLiveScriptDataByTradingSymbol(
              orderData.scriptName,
              orderData.exchange == 'NSE' ? 'NFO' : orderData.exchange,
              redisClient
            );
          let pl = SmSquareOff.profitLossCalculation(
            orderData.buyPrice,
            orderData.sellPrice,
            liveScriptData.close,
            liveScriptData.close,
            orderData.quantityLeft,
            orderData.tradeType
          );

          if (Number(pl) < 0) {
            await ledger.debitBalance({
              amount: Math.abs(Number(pl)),
              currUserId: null,
              transactionParticularId: tradeLossKey.id,
              transactionRemarks: `Loss for ${orderData.id}`,
              orderId: orderData.id,
            });
          } else {
            await ledger.creditBalance({
              amount: Math.abs(Number(pl)),
              currUserId: null,
              transactionParticularId: tradeProfitKey.id,
              transactionRemarks: `Profit for ${orderData.id}`,
              orderId: orderData.id,
            });
          }

          let newOrder = await this.constructOrder(
            orderData,
            orderData.quantityLeft,
            false,
            orderData.user.id,
            0,
            liveScriptData
          );
          console.log('new order is ', newOrder);
          await trade.closeOrder(orderData.id);
          await queue.publish(env.ORDER_QUEUE, JSON.stringify(newOrder));
        })
      );
    });
  }
}

export default TransferOrder;
