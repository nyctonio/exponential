import Trade from 'entity/trade';
import redisClient from 'lib/redis';
import CreateOrder, { msgType } from './create';
import TradeValidation from '../validations';
import { m_transaction } from 'database/sql/schema';
import moment from 'moment';
import Instruments from 'entity/instruments';
import { env } from 'env';
import { AppDataSource } from 'database/sql';

class SquareOffOrder {
  queue: any;
  constructor(queue: any) {
    console.log('Validations constructor');
    this.queue = queue;
  }

  private async constructOrder(
    order: m_transaction,
    quantity: number,
    isIntraday: boolean,
    userId: number,
    buyPrice: number | null,
    sellPrice: number | null,
    brokerage: number,
    margin: number,
    squareOffType: 'system squareoff' | 'trade squareoff' | 'user squareoff'
  ) {
    let instrument = new Instruments();
    let liveScriptData = await instrument.getLiveScriptDataByTradingSymbol(
      order.scriptName,
      order.exchange == 'NSE' ? 'NFO' : order.exchange,
      redisClient
    );
    console.log('order  ', order);
    console.log('live script data ', liveScriptData);
    let msg: msgType = {
      brokerage,
      brokerageChargedRate: order.brokerageChargedRate,
      brokerageChargedType: order.brokerageChargedType,
      isIntraday,
      margin,
      marginChargedRate: order.marginChargedRate,
      marginChargedType: order.marginChargedType,
      orderCreationDate: moment().toDate(),
      orderType: 'market',
      price: null,
      quantity: quantity,
      script:
        order.exchange == 'NSE'
          ? 'NFO' + ':' + order.scriptName
          : order.exchange + ':' + order.scriptName,
      squareoff: squareOffType,
      transactionType: '',
      type: order.tradeType == 'S' ? 'B' : 'S',
      userId,
      execData: {
        ...liveScriptData,
        buyPrice: buyPrice ? buyPrice : liveScriptData.buyPrice,
        sellPrice: sellPrice ? sellPrice : liveScriptData.sellPrice,
      },
    };
    return msg;
  }

  public async squareOffTrade(
    tradingSymbol: string,
    userId: number,
    isIntraday: boolean,
    processThroughQueue: boolean = false,
    squareOffType: 'system squareoff' | 'trade squareoff' | 'user squareoff'
  ) {
    let trade = new Trade({ userId: userId, redisClient: redisClient });
    let openOrders = await trade.getOpenOrdersByTradingSymbol(
      tradingSymbol,
      isIntraday
    );

    console.log('open orders ', openOrders);

    if (openOrders.length > 0) {
      let quantity = 0;
      let margin = 0;
      let brokerage = 0;
      openOrders.map((order) => {
        quantity += order.quantityLeft;
        margin += (order.margin / order.quantity) * order.quantityLeft;
        brokerage += (order.brokerage / order.quantity) * order.quantityLeft;
      });
      console.log('placing order for quantity ', quantity);
      let order = openOrders[0];

      let msg = await this.constructOrder(
        order,
        quantity,
        isIntraday,
        userId,
        null,
        null,
        brokerage,
        margin,
        squareOffType
      );
      if (processThroughQueue) {
        await this.queue.publish(env.ORDER_QUEUE, JSON.stringify(msg));
      } else {
        let create = new CreateOrder();

        await AppDataSource.transaction((txn) =>
          create.market(msg, userId, txn)
        );
      }

      return;
    } else {
      throw new Error('Cant Square Off Closed Orders');
    }
  }
}

export default SquareOffOrder;
