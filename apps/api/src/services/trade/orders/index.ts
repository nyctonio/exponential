import { GetOrders } from '../../../controllers/trade/orders/validation';
import Trade from 'entity/trade';
import { redisClient } from '../../../lib/redis';
// import CreateOrderService from './create';
import ConversionService from './conversion';
import { queue } from '../../../lib/queue';
import { env } from 'env';
import {
  EditWorkflow,
  DeleteWorkflow,
  SquareOffWorkflow,
  CreateWorkflow,
  TradeValidation,
  MarginHandler,
  BrokerageHandler,
  ConversionWorkflow,
} from 'order';
import { AppDataSource } from 'database/sql';

import Logger from '../../../utils/logger';

export type Order = {
  orderType: string; //limit || market
  type: string; // buy || sell
  quantity: number;
  price: number;
  script: string;
  isIntraday?: boolean;
};

export type LiveScriptData = {
  tradeable: boolean;
  instrumentToken: number;
  change: string;
  ltp: string;
  buyQty: number;
  buyPrice: string;
  sellPrice: string;
  sellQty: number;
  exchangeTimestamp: string;
  exchange: string;
  symbol: string;
  expiry: string;
  lotSize: number;
};

export type OrderPublishMsg = {
  userId: number;
  type: string;
  script: string;
  orderType: string;
  quantity: number;
  price: number;
  isIntraday: boolean;
  orderCreationDate: Date;
  margin: number;
  brokerage: number;
  transactionType: '' | 'bid' | 'sl';
  marginChargedType: 'crore' | 'lot' | string;
  marginChargedRate: number;
  brokerageChargedType: 'crore' | 'lot' | string;
  brokerageChargedRate: number;
  squareoff: 'user squareoff' | 'trade squareoff' | 'system squareoff';
  liveScriptData: LiveScriptData;
};

type liveData = {
  tradeable: boolean;
  instrumentToken: number;
  change: string;
  ltp: string;
  buyQty: number;
  buyPrice: number;
  sellPrice: number;
  sellQty: number;
  exchangeTimestamp: string;
  exchange: string;
  symbol: string;
  expiry: string;
  lotSize: number;
};

type msgType = {
  userId: number;
  type: string; // B or S
  script: string;
  orderType: string; // market or limit
  quantity: number;
  price: number;
  isIntraday: boolean;
  orderCreationDate: Date;
  margin: number;
  brokerage: number;
  transactionType: '' | 'bid' | 'sl';
  marginChargedType: 'crore' | 'lot' | string;
  marginChargedRate: number;
  brokerageChargedType: 'crore' | 'lot' | string;
  brokerageChargedRate: number;
  squareoff: '' | 'user squareoff' | 'trade squareoff' | 'system squareoff';
  execData: liveData;
};

class OrdersService {
  public static async publishOrderMsg(msg: OrderPublishMsg) {
    console.log('=>>>>>>>>>>>>publishing to order queue', msg);
    await queue.publish(env.ORDER_QUEUE, JSON.stringify(msg));
    return;
  }

  public static async createOrder(
    data: Order,
    userId: number,
    squareOff: boolean = false
  ) {
    const market_price = JSON.parse(
      await redisClient.get(`live-${data.script}`)
    );
    const exchange_name =
      data.script.split(':')[0] == 'NFO' ? 'NSE' : data.script.split(':')[0];
    const trading_symbol = data.script.split(':')[1];
    const script_name = trading_symbol.match(/^[A-Za-z]+/)![0];
    if (squareOff) {
      const square_off = new SquareOffWorkflow(queue);
      return await square_off.squareOffTrade(
        script_name,
        userId,
        data.isIntraday,
        false,
        'user squareoff'
      );
    }
    const [margin, brokerage, _trade, _qty, _scenario, _bidsl] =
      await Promise.all([
        MarginHandler.calculateMargin({
          userId,
          scriptData: {
            lotSize: market_price.lotSize,
            sellPrice: market_price.sellPrice,
            buyPrice: market_price.buyPrice,
          },
          orderData: {
            tradeType: data.type,
            price: data.price,
            quantity: data.quantity,
            tradingSymbol: trading_symbol,
            exchangeName: exchange_name,
            isIntraday: data.isIntraday,
          },
        }),
        BrokerageHandler.calculateBrokerage({
          userId,
          exchangeName: exchange_name,
          buyPrice: market_price.buyPrice,
          sellPrice: market_price.sellPrice,
          lotSize: market_price.lotSize,
          quantity: data.quantity,
          tradeType: data.type,
          tradingSymbol: script_name,
        }),
        TradeValidation.tradeValidations(
          userId,
          exchange_name,
          script_name,
          trading_symbol
        ),
        TradeValidation.qtyValidations(userId, null, {
          scriptName: trading_symbol,
          quantity: data.quantity,
          exchange: exchange_name,
          lotSize: market_price.lotSize,
          orderType: data.orderType,
          type: data.type,
        }),
        TradeValidation.scenarioValidations(userId, null, {
          scriptName: trading_symbol,
          exchange: exchange_name,
          orderType: data.orderType,
          type: data.type,
          quantity: data.quantity,
        }),
        TradeValidation.bidSlValidations(
          userId,
          {
            type: data.type,
            orderType: data.orderType,
            price: data.price,
            quantity: data.quantity,
            lotSize: market_price.lotSize,
            scriptName: trading_symbol,
            exchangeName: exchange_name,
          },
          null,
          {
            sellPrice: market_price.sellPrice,
            buyPrice: market_price.buyPrice,
            high: market_price.high,
            low: market_price.low,
          }
        ),
      ]);

    const msg: msgType = {
      userId,
      type: data.type,
      script: data.script,
      orderType: data.orderType,
      quantity: data.quantity,
      price: data.price,
      isIntraday: data.isIntraday,
      orderCreationDate: new Date(),
      margin: margin.marginAmount,
      brokerage: brokerage.brokerageAmount,
      transactionType: _bidsl,
      marginChargedType: margin.marginType,
      marginChargedRate: margin.marginChargedRate,
      brokerageChargedType: brokerage.brokerageType,
      brokerageChargedRate: brokerage.brokerageRate,
      squareoff: '',
      execData: market_price,
    };
    //Log
    const logData = {
      operation: 'create',
      loggedInUser: userId,
      type: 'event',
      targetUsers: [userId],
      actionDoneBy: 'user',
      description: `${userId} place order on ${data.script} with ${data.quantity} quantity with price ${data.price}.`,
      metadata: {
        additionalInfo: msg,
      },
    };
    Logger.logQueue(logData);

    // pushing to order queue
    await queue.publish(env.ORDER_QUEUE, JSON.stringify(msg));
  }

  public static async cancelOrder(data: { orderId: number }, userId: number) {
    let deleteOrder = new DeleteWorkflow(data.orderId, userId);

    //Log
    const logData = {
      operation: 'cancel',
      loggedInUser: userId,
      type: 'event',
      targetUsers: [userId],
      actionDoneBy: 'user',
      description: `${userId} cancel order ${data.orderId}.`,
      metadata: {
        additionalInfo: `${userId} cancel order ${data.orderId}.`,
      },
    };
    Logger.logQueue(logData);

    await deleteOrder.cancelPendingOrder();
    return;
  }

  public static async getOrders(
    data: GetOrders,
    currUser: { id: number; userType: string }
  ) {
    let trade = new Trade({ userId: currUser.id, redisClient });
    let orders = await trade.getOrders(data, currUser);

    //Log
    const logData = {
      operation: 'get',
      loggedInUser: currUser.id,
      type: 'event',
      targetUsers: [currUser.id],
      actionDoneBy: 'user',
      description: `${currUser.id} fetch order list.`,
      metadata: {
        additionalInfo: `${currUser.id} fetch order list.`,
      },
    };
    Logger.logQueue(logData);

    return orders;
  }

  public static async getOpenOrders(currUser: {
    id: number;
    userType: string;
  }) {
    let trade = new Trade({ userId: currUser.id, redisClient });
    let orders = await trade.getOpenOrdersByScript();
    //Log
    const logData = {
      operation: 'get',
      loggedInUser: currUser.id,
      type: 'event',
      targetUsers: [currUser.id],
      actionDoneBy: 'user',
      description: `${currUser.id} fetch open order list.`,
      metadata: {
        additionalInfo: `${currUser.id} fetch open order list.`,
      },
    };
    Logger.logQueue(logData);
    return orders;
  }

  public static async getPositions(currUser: { id: number }) {
    let trade = new Trade({ userId: currUser.id, redisClient });
    return await trade.getPositions();
  }

  public static async squareOffTrade(
    tradingSymbol: string,
    userId: number,
    isIntraday: boolean
  ) {
    //Log
    const logData = {
      operation: 'update',
      loggedInUser: userId,
      type: 'event',
      targetUsers: [userId],
      actionDoneBy: 'user',
      description: `${userId} square-off trade ${tradingSymbol}.`,
      metadata: {
        additionalInfo: `${userId} square-off trade ${tradingSymbol}.`,
      },
    };
    Logger.logQueue(logData);

    let squareOff = new SquareOffWorkflow(queue);
    await squareOff.squareOffTrade(
      tradingSymbol,
      userId,
      isIntraday,
      false,
      'user squareoff'
    );
    return;
  }

  public static async deleteOrder(userId: Number, orderId: number) {
    let deleteWorkflow = new DeleteWorkflow(orderId);

    //Log
    const logData = {
      operation: 'delete',
      loggedInUser: userId,
      type: 'event',
      targetUsers: [userId],
      actionDoneBy: 'user',
      description: `${userId} delete order ${orderId}.`,
      metadata: {
        additionalInfo: `${userId} delete order ${orderId}.`,
      },
    };
    Logger.logQueue(logData);

    await deleteWorkflow.deleteOrder();
    return;
  }

  public static async editOrder(
    userId: number,
    orderId: number,
    price: number,
    quantity: number
  ) {
    let edit = new EditWorkflow({ orderId, price, quantity, userId });
    await edit.editOpenOrder();

    //Log
    const logData = {
      operation: 'update',
      loggedInUser: userId,
      type: 'event',
      targetUsers: [userId],
      actionDoneBy: 'user',
      description: `${userId} edit order ${orderId}.`,
      metadata: {
        additionalInfo: `${userId} edit order ${orderId}.`,
      },
    };
    Logger.logQueue(logData);

    return;
  }

  public static async editPendingOrder(
    userId: number,
    orderId: number,
    price: number,
    quantity: number
  ) {
    let edit = new EditWorkflow({ orderId, price, quantity, userId });
    await edit.editUserPendingOrder();

    //Log
    const logData = {
      operation: 'update',
      loggedInUser: userId,
      type: 'event',
      targetUsers: [userId],
      actionDoneBy: 'user',
      description: `${userId} edit pending order -- ${orderId}.`,
      metadata: {
        additionalInfo: `${userId} edit pending order -- ${orderId}.`,
      },
    };
    Logger.logQueue(logData);

    return;
  }

  public static async convertOrder({
    userId,
    orderId,
  }: {
    userId: number;
    orderId: number;
  }) {
    //Log
    const logData = {
      operation: 'update',
      loggedInUser: userId,
      type: 'event',
      targetUsers: [userId],
      actionDoneBy: 'user',
      description: `${userId} convert order -- ${orderId}.`,
      metadata: {
        additionalInfo: `${userId} convert order -- ${orderId}.`,
      },
    };
    Logger.logQueue(logData);

    let conversion = new ConversionWorkflow({
      userId,
      conversionData: { orderId },
      queue,
    });
    await conversion.convertOrder();
    return;
  }
}

export default OrdersService;
