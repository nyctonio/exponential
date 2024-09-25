import { AppDataSource } from 'database/sql';
import { m_instruments, m_projectsetting } from 'database/sql/schema';
import Trade from 'entity/trade';
import Ledger from 'entity/ledger';
import ProjectSetting from 'entity/project-settings';
import { env } from 'env';
import moment from 'moment';

type msg = {
  orderType: string;
  type: string;
  quantity: number;
  price: number;
  script: string;
  userId: number;
  orderCreationDate: Date;
  margin: number;
  brokerage: number;
  //bid & sl will be in the case of limit orders and blank in the case for market
  transactionType: 'bid' | 'sl' | '';
  isIntraday: boolean;
  marginChargedType: string;
  marginChargedRate: number;
  brokerageChargedType: string;
  brokerageChargedRate: number;
  squareoff?: 'trade squareoff' | 'user squareoff' | 'system squareoff';
  liveScriptData: liveScriptDataType;
};

type liveScriptDataType = {
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

class OrderExecution {
  trade: Trade = null;
  ledger: Ledger = null;
  projectSetting: ProjectSetting = null;
  scriptData: liveScriptDataType | any = null;
  exchange: string = null;
  scriptName: string = null;
  orderQuantity: number = null;

  // cache this into redis (TODO)

  marginHoldTxnKey: m_projectsetting = null;
  marginReleasedTxnKey: m_projectsetting = null;
  brokerageCollectedTxnKey: m_projectsetting = null;
  tradeProfitTxnKey: m_projectsetting = null;
  tradeLossTxnKey: m_projectsetting = null;
  redisClient;

  constructor(msg: msg, redisClient) {
    this.orderQuantity = msg.quantity;
    this.exchange = msg.script.split(':')[0];
    this.scriptName = msg.script.split(':')[1];
    this.trade = new Trade({
      userId: msg.userId,
      redisClient,
      scriptName: this.scriptName,
      orderType: msg.orderType,
      exchange: this.exchange == 'NFO' ? 'NSE' : this.exchange,
    });
    this.ledger = new Ledger({ userId: msg.userId, redisClient });
    this.projectSetting = new ProjectSetting(['TRXNPRT']);
    this.redisClient = redisClient;
  }

  async updateOpenOrdersInRedis(msg: msg) {
    const openOrders = await this.trade.getOpenOrdersByScriptName({
      scriptName: this.scriptName,
    });
    if (openOrders.length > 0) {
      let objToSave = {};
      openOrders.forEach((order) => {
        if (order.isIntraday) {
          objToSave = {
            ...objToSave,
            [`${this.scriptData.instrumentToken}-I-T`]:
              order.tradeType == 'B' ? 'B' : 'S',
            [`${this.scriptData.instrumentToken}-I-P`]:
              order.tradeType == 'B'
                ? parseFloat(order.buyPriceAvg) / parseFloat(order.quantityLeft)
                : parseFloat(order.sellPriceAvg) /
                  parseFloat(order.quantityLeft),
            [`${this.scriptData.instrumentToken}-I-Q`]: order.quantityLeft,
            [`${this.scriptData.instrumentToken}-I-PL`]: 0,
          };
        } else {
          objToSave = {
            ...objToSave,
            [`${this.scriptData.instrumentToken}-N-T`]:
              order.tradeType == 'B' ? 'B' : 'S',
            [`${this.scriptData.instrumentToken}-N-P`]:
              order.tradeType == 'B'
                ? parseFloat(order.buyPriceAvg) / parseFloat(order.quantityLeft)
                : parseFloat(order.sellPriceAvg) /
                  parseFloat(order.quantityLeft),
            [`${this.scriptData.instrumentToken}-N-Q`]: order.quantityLeft,
            [`${this.scriptData.instrumentToken}-N-PL`]: 0,
          };
        }
      });
      await this.redisClient
        .multi()
        .sAdd(`margin-${this.scriptData.instrumentToken}`, `user-${msg.userId}`)
        .hSet(`margin-user-${msg.userId}`, objToSave)
        .exec();
    } else {
      // remove from redis
      await this.redisClient
        .multi()
        .sRem(`margin-${this.scriptData.instrumentToken}`, `user-${msg.userId}`)
        .hDel(
          `margin-user-${msg.userId}`,
          `${this.scriptData.instrumentToken}-I-T`
        )
        .hDel(
          `margin-user-${msg.userId}`,
          `${this.scriptData.instrumentToken}-N-T`
        )
        .hDel(
          `margin-user-${msg.userId}`,
          `${this.scriptData.instrumentToken}-I-P`
        )
        .hDel(
          `margin-user-${msg.userId}`,
          `${this.scriptData.instrumentToken}-N-P`
        )
        .hDel(
          `margin-user-${msg.userId}`,
          `${this.scriptData.instrumentToken}-I-Q`
        )
        .hDel(
          `margin-user-${msg.userId}`,
          `${this.scriptData.instrumentToken}-N-Q`
        )
        .hDel(
          `margin-user-${msg.userId}`,
          `${this.scriptData.instrumentToken}-I-PL`
        )
        .hDel(
          `margin-user-${msg.userId}`,
          `${this.scriptData.instrumentToken}-N-PL`
        )
        .exec();
    }
  }

  async executeMarketOrder(msg: msg) {
    // market order
    // creating/updating orders
    const checkOpenOrder = msg.type == 'B' ? 'S' : 'B';
    // GET Open orders based on fifo (first in first out) or lifo (last in first out) audo bid settings
    const openOrders = await this.trade.getOpenOrders({
      type: checkOpenOrder,
      order: msg.isIntraday ? 'intraday' : 'normal',
    });
    // if there are open orders of same script
    if (openOrders.length > 0) {
      // not a fresh order
      await Promise.all(
        openOrders.map(async (order) => {
          // if quantity of order is greater than 0
          if (msg.quantity > 0) {
            // if quantity of placed order is more than quantity of open order
            if (msg.quantity > order.quantityLeft) {
              // it means this open order will be closed (squaredoff) so release the margin
              const reducedQuantity = order.quantityLeft;
              msg.quantity = msg.quantity - order.quantityLeft;
              order.quantityLeft = 0;
              // msg is our new order
              if (msg.type == 'S') {
                // last open order will be of type buy only
                order.sellPrice =
                  order.sellPrice == null
                    ? this.scriptData.buyPrice
                    : // @ts-ignore
                      (parseFloat(order.sellPrice) * order.quantityLeft +
                        parseFloat(this.scriptData.buyPrice) *
                          (order.quantity - order.quantityLeft)) /
                      order.quantity;
              } else {
                order.buyPrice =
                  order.buyPrice == null
                    ? this.scriptData.sellPrice
                    : // @ts-ignore
                      (parseFloat(order.buyPrice) * order.quantityLeft +
                        parseFloat(this.scriptData.sellPrice) *
                          (order.quantity - order.quantityLeft)) /
                      order.quantity;
              }

              order.transactionStatus = 'closed';
              await this.trade.tmanager.save(order);

              // getting prev holded margin
              const txnLedger =
                await this.ledger.getLedgerByOrderIdAndParticular({
                  orderId: order.id,
                  particularName: 'Margin Hold',
                });

              const newOrders = await this.trade.createMultipleOrders([
                {
                  buyPrice: msg.type == 'B' ? this.scriptData.sellPrice : null,
                  sellPrice: msg.type == 'S' ? this.scriptData.buyPrice : null,
                  quantity: reducedQuantity,
                  quantityLeft: 0,
                  margin: null,
                  brokerage: msg.brokerage * (reducedQuantity / order.quantity),
                  tradeType: msg.type == 'B' ? 'B' : 'S',
                  transactionStatus: 'closed',
                  lotSize: this.scriptData.lotSize,
                  parentId: order.id,
                  isIntraday: msg.isIntraday,
                  orderCreationDate: msg.orderCreationDate,
                  orderExecutionDate: moment().utc().toDate(),
                  marginChargedType: msg.marginChargedType,
                  marginChargedRate: msg.marginChargedRate,
                  brokerageChargedType: msg.brokerageChargedType,
                  brokerageChargedRate: msg.brokerageChargedRate,
                  tradeRemarks: msg.squareoff,
                },
              ]);

              let profitLoss = 0;
              if (order.tradeType == 'B') {
                profitLoss =
                  (this.scriptData.buyPrice - order.buyPrice) * reducedQuantity;
              } else {
                profitLoss =
                  (order.sellPrice - this.scriptData.sellPrice) *
                  reducedQuantity;
              }
              if (profitLoss >= 0) {
                await this.ledger.multipleCreditBalance([
                  {
                    amount:
                      txnLedger.transactionAmount *
                      (reducedQuantity / order.quantity),
                    currUserId: msg.userId,
                    transactionParticularId: this.marginReleasedTxnKey.id,
                    transactionRemarks: `Margin Released for ${
                      reducedQuantity / order.lotSize
                    } lots of ${this.scriptName}`,
                    orderId: newOrders[0].id,
                  },
                  {
                    amount: msg.brokerage * (reducedQuantity / order.quantity),
                    currUserId: msg.userId,
                    transactionParticularId: this.brokerageCollectedTxnKey.id,
                    transactionRemarks: `Brokerage collected for ${this.scriptName}`,
                    orderId: newOrders[0].id,
                  },
                  {
                    amount: profitLoss,
                    currUserId: msg.userId,
                    transactionParticularId: this.tradeProfitTxnKey.id,
                    transactionRemarks: `Profit for ${this.scriptName}`,
                    orderId: newOrders[0].id,
                  },
                ]);
              } else {
                await Promise.all([
                  this.ledger.multipleCreditBalance([
                    {
                      amount:
                        txnLedger.transactionAmount *
                        (reducedQuantity / order.quantity),
                      currUserId: msg.userId,
                      transactionParticularId: this.marginReleasedTxnKey.id,
                      transactionRemarks: `Margin Released for ${
                        reducedQuantity / order.lotSize
                      } lots of ${this.scriptName}`,
                      orderId: newOrders[0].id,
                    },
                    {
                      amount:
                        msg.brokerage * (reducedQuantity / order.quantity),
                      currUserId: msg.userId,
                      transactionParticularId: this.brokerageCollectedTxnKey.id,
                      transactionRemarks: `Brokerage collected for ${this.scriptName}`,
                      orderId: newOrders[0].id,
                    },
                  ]),
                  this.ledger.debitBalance({
                    amount: profitLoss * -1,
                    currUserId: msg.userId,
                    transactionParticularId: this.tradeLossTxnKey.id,
                    transactionRemarks: `Loss for ${this.scriptName}`,
                    orderId: newOrders[0].id,
                  }),
                ]);
              }
            } else if (msg.quantity <= order.quantityLeft) {
              console.log('b', msg.quantity, order.quantityLeft);
              const reducedQuantity = msg.quantity;
              order.quantityLeft = order.quantityLeft - msg.quantity;
              if (order.quantityLeft == 0) order.transactionStatus = 'closed';

              if (msg.type == 'S') {
                // @ts-ignore
                order.sellPrice =
                  order.sellPrice == null
                    ? this.scriptData.buyPrice
                    : // @ts-ignore
                      (parseFloat(order.sellPrice) * msg.quantity +
                        parseFloat(this.scriptData.buyPrice) *
                          (order.quantity - order.quantityLeft)) /
                      (msg.quantity + order.quantity - order.quantityLeft);
              } else {
                // @ts-ignore
                order.buyPrice =
                  order.buyPrice == null
                    ? this.scriptData.sellPrice
                    : // @ts-ignore
                      (parseFloat(order.buyPrice) * msg.quantity +
                        parseFloat(this.scriptData.sellPrice) *
                          (order.quantity - order.quantityLeft)) /
                      (msg.quantity + order.quantity - order.quantityLeft);
              }

              msg.quantity = 0;
              await this.trade.tmanager.save(order);

              // getting prev margin holded
              const txnLedger =
                await this.ledger.getLedgerByOrderIdAndParticular({
                  orderId: order.id,
                  particularName: 'Margin Hold',
                });

              // creating only 1 order
              const newOrders = await this.trade.createMultipleOrders([
                {
                  buyPrice: msg.type == 'B' ? this.scriptData.sellPrice : null,
                  sellPrice: msg.type == 'S' ? this.scriptData.buyPrice : null,
                  quantity: reducedQuantity,
                  quantityLeft: msg.quantity,
                  margin:
                    txnLedger.transactionAmount *
                    (reducedQuantity / order.quantity),
                  brokerage:
                    msg.brokerage * (reducedQuantity / this.orderQuantity),
                  tradeType: msg.type == 'B' ? 'B' : 'S',
                  transactionStatus: 'closed',
                  lotSize: this.scriptData.lotSize,
                  parentId: order.id,
                  orderCreationDate: msg.orderCreationDate,
                  isIntraday: msg.isIntraday,
                  orderExecutionDate: moment().utc().toDate(),
                  marginChargedType: msg.marginChargedType,
                  marginChargedRate: msg.marginChargedRate,
                  brokerageChargedType: msg.brokerageChargedType,
                  brokerageChargedRate: msg.brokerageChargedRate,
                  tradeRemarks: msg.squareoff,
                },
              ]);

              let profitLoss = 0;
              if (order.tradeType == 'B') {
                profitLoss =
                  (this.scriptData.buyPrice - order.buyPrice) * reducedQuantity;
              } else {
                profitLoss =
                  (order.sellPrice - this.scriptData.sellPrice) *
                  reducedQuantity;
              }

              if (profitLoss >= 0) {
                await Promise.all([
                  this.ledger.multipleCreditBalance([
                    {
                      amount:
                        txnLedger.transactionAmount *
                        (reducedQuantity / order.quantity),
                      currUserId: msg.userId,
                      transactionParticularId: this.marginReleasedTxnKey.id,
                      transactionRemarks: `Margin Released for ${
                        reducedQuantity / order.lotSize
                      } lots of ${this.scriptName}`,
                      orderId: newOrders[0].id,
                    },
                    {
                      amount: profitLoss,
                      currUserId: msg.userId,
                      transactionParticularId: this.tradeProfitTxnKey.id,
                      transactionRemarks: `Profit for ${this.scriptName}`,
                      orderId: newOrders[0].id,
                    },
                  ]),
                  this.ledger.debitBalance({
                    amount:
                      msg.brokerage * (reducedQuantity / this.orderQuantity),
                    currUserId: msg.userId,
                    transactionParticularId: this.brokerageCollectedTxnKey.id,
                    transactionRemarks: `Brokerage collected for ${this.scriptName}`,
                    orderId: newOrders[0].id,
                  }),
                ]);
              } else {
                await Promise.all([
                  this.ledger.creditBalance({
                    amount:
                      txnLedger.transactionAmount *
                      (reducedQuantity / order.quantity),
                    currUserId: msg.userId,
                    transactionParticularId: this.marginReleasedTxnKey.id,
                    transactionRemarks: `Margin Released for ${
                      reducedQuantity / order.lotSize
                    } lots of ${this.scriptName}`,
                    orderId: newOrders[0].id,
                  }),
                  this.ledger.multipleDebitBalance([
                    {
                      amount:
                        msg.brokerage * (reducedQuantity / this.orderQuantity),
                      currUserId: msg.userId,
                      transactionParticularId: this.brokerageCollectedTxnKey.id,
                      transactionRemarks: `Brokerage collected for ${this.scriptName}`,
                      orderId: newOrders[0].id,
                    },
                    {
                      amount: profitLoss * -1,
                      currUserId: msg.userId,
                      transactionParticularId: this.tradeLossTxnKey.id,
                      transactionRemarks: `Loss for ${this.scriptName}`,
                      orderId: newOrders[0].id,
                    },
                  ]),
                ]);
              }
            }
          }
        })
      );
      if (msg.quantity > 0) {
        // create order
        const newOrderId = await this.trade.createOrder({
          buyPrice: msg.type == 'B' ? this.scriptData.buyPrice : null,
          sellPrice: msg.type == 'S' ? this.scriptData.sellPrice : null,
          quantity: msg.quantity,
          margin: msg.margin,
          brokerage: msg.brokerage,
          tradeType: msg.type == 'B' ? 'B' : 'S',
          transactionStatus: 'open',
          lotSize: this.scriptData.lotSize,
          isIntraday: msg.isIntraday,
          orderCreationDate: msg.orderCreationDate,
          orderExecutionDate: moment().utc().toDate(),
          marginChargedType: msg.marginChargedType,
          marginChargedRate: msg.marginChargedRate,
          brokerageChargedType: msg.brokerageChargedType,
          brokerageChargedRate: msg.brokerageChargedRate,
          tradeRemarks: 'parent order created from extra quantity',
        });
        // hold margin here
        await this.ledger.multipleDebitBalance([
          {
            amount: msg.margin * (msg.quantity / this.orderQuantity),
            currUserId: msg.userId,
            transactionParticularId: this.marginHoldTxnKey.id,
            transactionRemarks: `Hold margin for ${this.scriptName}`,
            orderId: newOrderId,
          },
          {
            amount: msg.brokerage * (msg.quantity / this.orderQuantity),
            currUserId: msg.userId,
            transactionParticularId: this.brokerageCollectedTxnKey.id,
            transactionRemarks: `Brokerage collected for ${this.scriptName}`,
            orderId: newOrderId,
          },
        ]);
      }
    } else {
      // create order (if order is of type buy the buy at sellPrice and vice versa)
      const newMarketOrderId = await this.trade.createOrder({
        buyPrice: msg.type == 'B' ? this.scriptData.sellPrice : null,
        sellPrice: msg.type == 'S' ? this.scriptData.buyPrice : null,
        quantity: msg.quantity,
        margin: msg.margin,
        brokerage: msg.brokerage,
        tradeType: msg.type == 'B' ? 'B' : 'S',
        transactionStatus: 'open',
        lotSize: this.scriptData.lotSize,
        isIntraday: msg.isIntraday,
        orderCreationDate: msg.orderCreationDate,
        orderExecutionDate: moment().utc().toDate(),
        marginChargedType: msg.marginChargedType,
        marginChargedRate: msg.marginChargedRate,
        brokerageChargedType: msg.brokerageChargedType,
        brokerageChargedRate: msg.brokerageChargedRate,
        tradeRemarks: 'fresh parent order',
      });
      // hold margin here
      await this.ledger.multipleDebitBalance([
        {
          amount: msg.margin,
          currUserId: msg.userId,
          transactionParticularId: this.marginHoldTxnKey.id,
          transactionRemarks: `Hold margin for ${this.scriptName}`,
          orderId: newMarketOrderId,
        },
        {
          amount: msg.brokerage,
          currUserId: msg.userId,
          transactionParticularId: this.brokerageCollectedTxnKey.id,
          transactionRemarks: `Brokerage collected for ${this.scriptName}`,
          orderId: newMarketOrderId,
        },
      ]);
    }

    // adding open orders to redis to maintain margin
  }

  async executeLimitOrder(msg: msg) {
    let orderId = await this.trade.createOrder({
      buyPrice: msg.type == 'B' ? msg.price : null,
      sellPrice: msg.type == 'S' ? msg.price : null,
      quantity: msg.quantity,
      margin: msg.margin,
      brokerage: msg.brokerage,
      tradeType: msg.type == 'B' ? 'B' : 'S',
      transactionStatus: 'pending',
      lotSize: this.scriptData.lotSize,
      orderCreationDate: msg.orderCreationDate,
      brokerageChargedRate: msg.brokerageChargedRate,
      brokerageChargedType: msg.brokerageChargedType,
      isIntraday: msg.isIntraday,
      marginChargedRate: msg.marginChargedRate,
      marginChargedType: msg.marginChargedType,
      orderExecutionDate: null,
      tradeRemarks: msg.squareoff,
    });

    // replace this with in memory data or redis data (TODO)
    let instrumentData = await m_instruments.findOne({
      where: {
        isDeleted: false,
        exchange: this.exchange,
        tradingsymbol: this.scriptName,
      },
      select: { instrument_token: true },
    });

    // save order in redis
    let key =
      msg.type == 'B'
        ? `limit-${instrumentData.instrument_token}-B`
        : `limit-${instrumentData.instrument_token}-S`;

    // console.log('keys are ', key);
    await this.redisClient.hSet(key, {
      [`${msg.userId}-${orderId}`]: JSON.stringify({
        userId: msg.userId,
        tradeType: msg.type,
        quantity: msg.quantity,
        price: msg.price,
        instrumentToken: instrumentData.instrument_token,
        exchange: this.exchange,
        tradingsymbol: this.scriptName,
        orderId,
        margin: msg.margin,
        brokerage: msg.brokerage,
      }),
    });

    if (msg.transactionType == 'bid') {
      await this.ledger.debitBalance({
        amount: msg.margin,
        currUserId: null,
        transactionParticularId: this.marginHoldTxnKey.id,
        transactionRemarks: `Hold margin for ${orderId}`,
        orderId: orderId,
      });
    }
  }
}

class Orders {
  public static async createOrderFromQueue(queue, redisClient) {
    await queue.consume(env.ORDER_QUEUE, async (msg: msg) => {
      const execution = new OrderExecution(msg, redisClient);
      execution.scriptData = msg.liveScriptData;
      if (!execution.scriptData) throw new Error('Script is not live');
      // cache this into redis (TODO)
      let trxnKeys = await execution.projectSetting.getProjectSettingByKeys();
      execution.marginHoldTxnKey = trxnKeys.find(
        (key) => key.prjSettConstant == 'Margin Hold'
      );
      execution.marginReleasedTxnKey = trxnKeys.find(
        (key) => key.prjSettConstant == 'Margin Released'
      );
      execution.brokerageCollectedTxnKey = trxnKeys.find(
        (key) => key.prjSettConstant == 'Brokerage Collected'
      );
      execution.tradeProfitTxnKey = trxnKeys.find(
        (key) => key.prjSettConstant == 'Trade Profit'
      );
      execution.tradeLossTxnKey = trxnKeys.find(
        (key) => key.prjSettConstant == 'Trade Loss'
      );
      // post calculations (TODO - order will be processed here)
      await AppDataSource.transaction(async (manager) => {
        execution.trade.setTransactionManager(manager);
        execution.ledger.setTransactionManager(manager);
        if (msg.orderType == 'market') {
          await execution.executeMarketOrder(msg);
          await execution.updateOpenOrdersInRedis(msg);
        } else {
          await execution.executeLimitOrder(msg);
        }
      });
    });
  }

  public static async createOrder(msg: msg, tmanager: any, redisClient) {
    const execution = new OrderExecution(msg, redisClient);
    execution.scriptData = msg.liveScriptData;
    if (!execution.scriptData) throw new Error('Script is not live');
    // cache this into redis (TODO)
    let trxnKeys = await execution.projectSetting.getProjectSettingByKeys();
    execution.marginHoldTxnKey = trxnKeys.find(
      (key) => key.prjSettConstant == 'Margin Hold'
    );
    execution.marginReleasedTxnKey = trxnKeys.find(
      (key) => key.prjSettConstant == 'Margin Released'
    );
    execution.brokerageCollectedTxnKey = trxnKeys.find(
      (key) => key.prjSettConstant == 'Brokerage Collected'
    );
    execution.tradeProfitTxnKey = trxnKeys.find(
      (key) => key.prjSettConstant == 'Trade Profit'
    );
    execution.tradeLossTxnKey = trxnKeys.find(
      (key) => key.prjSettConstant == 'Trade Loss'
    );
    // post calculations (TODO - order will be processed here)
    execution.trade.setTransactionManager(tmanager);
    execution.ledger.setTransactionManager(tmanager);
    if (msg.orderType == 'market') {
      await execution.executeMarketOrder(msg);
      await execution.updateOpenOrdersInRedis(msg);
    } else {
      await execution.executeLimitOrder(msg);
    }
  }
}

export default Orders;
