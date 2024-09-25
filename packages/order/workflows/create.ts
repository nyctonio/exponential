import moment from 'moment';
import { m_projectsetting, m_instruments } from 'database/sql/schema';
import { redisClient } from '../lib/redis';
import Trade from 'entity/trade';
import Ledger from 'entity/ledger';
import ProjectSetting from 'entity/project-settings';

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
  exchange: string; // exchange name (NFO, NSE ,MCX)
  symbol: string; // (AXISBANK24JANFUT)
  expiry: string;
  lotSize: number;
};

export type msgType = {
  userId: number;
  type: string; // B or S
  script: string; // NFO:AXISBANK24JANFUT
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

class CreateOrder {
  trade: Trade = null;
  ledger: Ledger = null;
  projectSetting: ProjectSetting = null;
  // cache this into redis (TODO)

  marginHoldTxnKey: m_projectsetting = null;
  marginReleasedTxnKey: m_projectsetting = null;
  brokerageCollectedTxnKey: m_projectsetting = null;
  tradeProfitTxnKey: m_projectsetting = null;
  tradeLossTxnKey: m_projectsetting = null;

  constructor() {
    console.log('workflow initiated');
  }

  public async init({ userId, exchange, scriptName, orderType, tmanager }) {
    this.ledger = new Ledger({
      userId,
      redisClient: redisClient,
    });
    this.trade = new Trade({
      redisClient,
      userId,
      exchange,
      scriptName,
      orderType,
    });
    this.projectSetting = new ProjectSetting(['TRXNPRT']);
    this.trade.setTransactionManager(tmanager);
    this.ledger.setTransactionManager(tmanager);
    let trxnKeys = await this.projectSetting.getProjectSettingByKeys();
    this.marginHoldTxnKey = trxnKeys.find(
      (key) => key.prjSettConstant == 'Margin Hold'
    );
    this.marginReleasedTxnKey = trxnKeys.find(
      (key) => key.prjSettConstant == 'Margin Released'
    );
    this.brokerageCollectedTxnKey = trxnKeys.find(
      (key) => key.prjSettConstant == 'Brokerage Collected'
    );
    this.tradeProfitTxnKey = trxnKeys.find(
      (key) => key.prjSettConstant == 'Trade Profit'
    );
    this.tradeLossTxnKey = trxnKeys.find(
      (key) => key.prjSettConstant == 'Trade Loss'
    );
  }

  public async updateredis(msg: msgType) {
    const script_name = msg.script.split(':')[1];
    const exchnage_name =
      msg.script.split(':')[0] == 'NFO' ? 'NSE' : msg.script.split(':')[0];

    const openOrders = await this.trade.getOpenOrdersByScriptName({
      scriptName: script_name,
    });
    // replace this with in memory data or redis data (TODO)
    let instrumentData = await m_instruments.findOne({
      where: {
        exchange: exchnage_name == 'NSE' ? 'NFO' : exchnage_name,
        tradingsymbol: script_name,
        isDeleted: false,
      },
      select: { instrument_token: true },
    });
    console.log(
      'exchange name ',
      exchnage_name,
      'script name ',
      script_name,
      'instrument data ',
      instrumentData
    );
    if (openOrders.length > 0) {
      let objToSave = {};
      console.log('-->>>', instrumentData);
      openOrders.forEach((order) => {
        if (order.isIntraday) {
          objToSave = {
            ...objToSave,
            [`${instrumentData.instrument_token}-I-T`]:
              order.tradeType == 'B' ? 'B' : 'S',
            [`${instrumentData.instrument_token}-I-P`]:
              order.tradeType == 'B'
                ? parseFloat(order.buyPriceAvg) / parseFloat(order.quantityLeft)
                : parseFloat(order.sellPriceAvg) /
                  parseFloat(order.quantityLeft),
            [`${instrumentData.instrument_token}-I-Q`]: order.quantityLeft,
            [`${instrumentData.instrument_token}-I-PL`]: 0,
          };
        } else {
          objToSave = {
            ...objToSave,
            [`${instrumentData.instrument_token}-N-T`]:
              order.tradeType == 'B' ? 'B' : 'S',
            [`${instrumentData.instrument_token}-N-P`]:
              order.tradeType == 'B'
                ? parseFloat(order.buyPriceAvg) / parseFloat(order.quantityLeft)
                : parseFloat(order.sellPriceAvg) /
                  parseFloat(order.quantityLeft),
            [`${instrumentData.instrument_token}-N-Q`]: order.quantityLeft,
            [`${instrumentData.instrument_token}-N-PL`]: 0,
          };
        }
      });
      await redisClient
        .multi()
        .sAdd(`margin-${instrumentData.instrument_token}`, `user-${msg.userId}`)
        .hSet(`margin-user-${msg.userId}`, objToSave)
        .exec();
    } else {
      // remove from redis
      await redisClient
        .multi()
        .sRem(`margin-${instrumentData.instrument_token}`, `user-${msg.userId}`)
        .hDel(
          `margin-user-${msg.userId}`,
          `${instrumentData.instrument_token}-I-T`
        )
        .hDel(
          `margin-user-${msg.userId}`,
          `${instrumentData.instrument_token}-N-T`
        )
        .hDel(
          `margin-user-${msg.userId}`,
          `${instrumentData.instrument_token}-I-P`
        )
        .hDel(
          `margin-user-${msg.userId}`,
          `${instrumentData.instrument_token}-N-P`
        )
        .hDel(
          `margin-user-${msg.userId}`,
          `${instrumentData.instrument_token}-I-Q`
        )
        .hDel(
          `margin-user-${msg.userId}`,
          `${instrumentData.instrument_token}-N-Q`
        )
        .hDel(
          `margin-user-${msg.userId}`,
          `${instrumentData.instrument_token}-I-PL`
        )
        .hDel(
          `margin-user-${msg.userId}`,
          `${instrumentData.instrument_token}-N-PL`
        )
        .exec();
    }
  }

  public async market(msg: msgType, userId: number, tmanager) {
    console.log('market order', msg);
    const script_name = msg.script.split(':')[1];
    const exchnage_name =
      msg.script.split(':')[0] == 'NFO' ? 'NSE' : msg.script.split(':')[0];
    const order_quantity = msg.quantity;
    await this.init({
      userId,
      exchange: exchnage_name,
      scriptName: script_name,
      orderType: msg.orderType,
      tmanager,
    });

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
                    ? msg.execData.buyPrice
                    : // @ts-ignore
                      (parseFloat(order.sellPrice) * order.quantityLeft +
                        msg.execData.buyPrice *
                          (order.quantity - order.quantityLeft)) /
                      order.quantity;
              } else {
                order.buyPrice =
                  order.buyPrice == null
                    ? msg.execData.sellPrice
                    : // @ts-ignore
                      (parseFloat(order.buyPrice) * order.quantityLeft +
                        msg.execData.sellPrice *
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
                  buyPrice: msg.type == 'B' ? msg.execData.sellPrice : null,
                  sellPrice: msg.type == 'S' ? msg.execData.buyPrice : null,
                  quantity: reducedQuantity,
                  quantityLeft: 0,
                  margin: null,
                  brokerage: msg.brokerage * (reducedQuantity / order.quantity),
                  tradeType: msg.type == 'B' ? 'B' : 'S',
                  transactionStatus: 'closed',
                  lotSize: msg.execData.lotSize,
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

              console.log('new orders are ', newOrders);

              let profitLoss = 0;
              if (order.tradeType == 'B') {
                profitLoss =
                  (msg.execData.buyPrice - order.buyPrice) * reducedQuantity;
              } else {
                profitLoss =
                  (order.sellPrice - msg.execData.sellPrice) * reducedQuantity;
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
                    } lots of ${script_name}`,
                    orderId: newOrders[0].id,
                  },
                  {
                    amount: profitLoss,
                    currUserId: msg.userId,
                    transactionParticularId: this.tradeProfitTxnKey.id,
                    transactionRemarks: `Profit for ${script_name}`,
                    orderId: newOrders[0].id,
                  },
                ]);
                await this.ledger.debitBalance({
                  amount: msg.brokerage * (reducedQuantity / order.quantity),
                  currUserId: msg.userId,
                  transactionParticularId: this.brokerageCollectedTxnKey.id,
                  transactionRemarks: `Brokerage collected for ${script_name}`,
                  orderId: newOrders[0].id,
                });
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
                      } lots of ${script_name}`,
                      orderId: newOrders[0].id,
                    },
                  ]),
                  this.ledger.multipleDebitBalance([
                    {
                      amount: profitLoss * -1,
                      currUserId: msg.userId,
                      transactionParticularId: this.tradeLossTxnKey.id,
                      transactionRemarks: `Loss for ${script_name}`,
                      orderId: newOrders[0].id,
                    },
                    {
                      amount:
                        msg.brokerage * (reducedQuantity / order.quantity),
                      currUserId: msg.userId,
                      transactionParticularId: this.brokerageCollectedTxnKey.id,
                      transactionRemarks: `Brokerage collected for ${script_name}`,
                      orderId: newOrders[0].id,
                    },
                  ]),
                ]);
              }
            } else if (msg.quantity <= order.quantityLeft) {
              const reducedQuantity = msg.quantity;
              order.quantityLeft = order.quantityLeft - msg.quantity;
              if (order.quantityLeft == 0) order.transactionStatus = 'closed';

              if (msg.type == 'S') {
                // @ts-ignore
                order.sellPrice =
                  order.sellPrice == null
                    ? msg.execData.buyPrice
                    : // @ts-ignore
                      (parseFloat(order.sellPrice) * msg.quantity +
                        msg.execData.buyPrice *
                          (order.quantity - order.quantityLeft)) /
                      (msg.quantity + order.quantity - order.quantityLeft);
              } else {
                // @ts-ignore
                order.buyPrice =
                  order.buyPrice == null
                    ? msg.execData.sellPrice
                    : // @ts-ignore
                      (parseFloat(order.buyPrice) * msg.quantity +
                        msg.execData.sellPrice *
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
                  buyPrice: msg.type == 'B' ? msg.execData.sellPrice : null,
                  sellPrice: msg.type == 'S' ? msg.execData.buyPrice : null,
                  quantity: reducedQuantity,
                  quantityLeft: msg.quantity,
                  margin:
                    txnLedger.transactionAmount *
                    (reducedQuantity / order.quantity),
                  brokerage: msg.brokerage * (reducedQuantity / order_quantity),
                  tradeType: msg.type == 'B' ? 'B' : 'S',
                  transactionStatus: 'closed',
                  lotSize: msg.execData.lotSize,
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
                  (msg.execData.buyPrice - order.buyPrice) * reducedQuantity;
              } else {
                profitLoss =
                  (order.sellPrice - msg.execData.sellPrice) * reducedQuantity;
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
                      } lots of ${script_name}`,
                      orderId: newOrders[0].id,
                    },
                    {
                      amount: profitLoss,
                      currUserId: msg.userId,
                      transactionParticularId: this.tradeProfitTxnKey.id,
                      transactionRemarks: `Profit for ${script_name}`,
                      orderId: newOrders[0].id,
                    },
                  ]),
                  this.ledger.debitBalance({
                    amount: msg.brokerage * (reducedQuantity / order_quantity),
                    currUserId: msg.userId,
                    transactionParticularId: this.brokerageCollectedTxnKey.id,
                    transactionRemarks: `Brokerage collected for ${script_name}`,
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
                    } lots of ${script_name}`,
                    orderId: newOrders[0].id,
                  }),
                  this.ledger.multipleDebitBalance([
                    {
                      amount:
                        msg.brokerage * (reducedQuantity / order_quantity),
                      currUserId: msg.userId,
                      transactionParticularId: this.brokerageCollectedTxnKey.id,
                      transactionRemarks: `Brokerage collected for ${script_name}`,
                      orderId: newOrders[0].id,
                    },
                    {
                      amount: profitLoss * -1,
                      currUserId: msg.userId,
                      transactionParticularId: this.tradeLossTxnKey.id,
                      transactionRemarks: `Loss for ${script_name}`,
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
          buyPrice: msg.type == 'B' ? msg.execData.buyPrice : null,
          sellPrice: msg.type == 'S' ? msg.execData.sellPrice : null,
          quantity: msg.quantity,
          margin: msg.margin,
          brokerage: msg.brokerage,
          tradeType: msg.type == 'B' ? 'B' : 'S',
          transactionStatus: 'open',
          lotSize: msg.execData.lotSize,
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
            amount: msg.margin * (msg.quantity / order_quantity),
            currUserId: msg.userId,
            transactionParticularId: this.marginHoldTxnKey.id,
            transactionRemarks: `Hold margin for ${script_name}`,
            orderId: newOrderId,
          },
          {
            amount: msg.brokerage * (msg.quantity / order_quantity),
            currUserId: msg.userId,
            transactionParticularId: this.brokerageCollectedTxnKey.id,
            transactionRemarks: `Brokerage collected for ${script_name}`,
            orderId: newOrderId,
          },
        ]);
      }
    } else {
      // create order (if order is of type buy the buy at sellPrice and vice versa)
      const newMarketOrderId = await this.trade.createOrder({
        buyPrice: msg.type == 'B' ? msg.execData.sellPrice : null,
        sellPrice: msg.type == 'S' ? msg.execData.buyPrice : null,
        quantity: msg.quantity,
        margin: msg.margin,
        brokerage: msg.brokerage,
        tradeType: msg.type == 'B' ? 'B' : 'S',
        transactionStatus: 'open',
        lotSize: msg.execData.lotSize,
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
          transactionRemarks: `Hold margin for ${script_name}`,
          orderId: newMarketOrderId,
        },
        {
          amount: msg.brokerage,
          currUserId: msg.userId,
          transactionParticularId: this.brokerageCollectedTxnKey.id,
          transactionRemarks: `Brokerage collected for ${script_name}`,
          orderId: newMarketOrderId,
        },
      ]);
    }
    // adding open orders to redis to maintain margin
    await this.updateredis(msg);
  }

  public async limit(msg: msgType, userId: number, tmanager) {
    console.log('limit order', msg);
    const script_name = msg.script.split(':')[1];
    const exchange_name =
      msg.script.split(':')[0] == 'NFO' ? 'NSE' : msg.script.split(':')[0];
    const order_quantity = msg.quantity;
    await this.init({
      userId,
      exchange: exchange_name,
      scriptName: script_name,
      orderType: msg.orderType,
      tmanager,
    });
    let orderId = await this.trade.createOrder({
      buyPrice: msg.type == 'B' ? msg.price : null,
      sellPrice: msg.type == 'S' ? msg.price : null,
      quantity: order_quantity,
      margin: msg.margin,
      brokerage: msg.brokerage,
      tradeType: msg.type == 'B' ? 'B' : 'S',
      transactionStatus: 'pending',
      lotSize: msg.execData.lotSize,
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
        exchange: exchange_name == 'NSE' ? 'NFO' : exchange_name,
        tradingsymbol: script_name,
      },
      select: { instrument_token: true },
    });

    // save order in redis
    let key =
      msg.type == 'B'
        ? `limit-${instrumentData.instrument_token}-B`
        : `limit-${instrumentData.instrument_token}-S`;

    await redisClient.hSet(key, {
      [`${msg.userId}-${orderId}`]: JSON.stringify({
        userId: msg.userId,
        tradeType: msg.type,
        quantity: order_quantity,
        price: msg.price,
        instrumentToken: instrumentData.instrument_token,
        exchange: exchange_name,
        tradingsymbol: script_name,
        orderId,
        margin: msg.margin,
        brokerage: msg.brokerage,
        limitType: msg.transactionType,
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

export default CreateOrder;
