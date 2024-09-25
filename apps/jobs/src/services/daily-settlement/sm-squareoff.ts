import { redisClient } from '../../lib/redis';
import Trade from 'entity/trade';
import User from 'entity/user';
import { AppDataSource } from 'database/sql';
import Ledger from 'entity/ledger';
import { CreateWorkflow } from 'order';

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

class SmSquareOff {
  public static profitLossCalculation(
    buyPrice: number,
    sellPrice: number,
    currentBuyPrice: number,
    currentSellPrice: number,
    quantity: number,
    tradeType: string
  ) {
    if (tradeType == 'B') {
      return ((currentBuyPrice - buyPrice) * quantity).toFixed(2);
    }
    return ((sellPrice - currentSellPrice) * quantity).toFixed(2);
  }

  public static async freeMargin(
    userId: number,
    marginAmount: number,
    trade,
    exchange: string
  ) {
    let margin_to_be_released = 0;
    let openOrders = await trade.getAllOpenOrders({ exchange });
    const onlyOpenOrders = openOrders.filter(
      (order) => order.transactionStatus === 'open'
    );
    const scriptsToSquareOff: {
      scriptName: string;
      quantity: number;
      tradeType: string;
      brokerage: number;
      margin: number;
    }[] = [];

    const _onlyOpenOrders = await Promise.all(
      onlyOpenOrders.map(async (order) => {
        const currentPrice = await JSON.parse(
          await redisClient.get(
            `live-${exchange == 'NSE' ? 'NFO' : exchange}:${order.scriptName}`
          )
        );
        const pl = SmSquareOff.profitLossCalculation(
          parseFloat(order.buyPrice),
          parseFloat(order.sellPrice),
          parseFloat(currentPrice.buyPrice),
          parseFloat(currentPrice.sellPrice),
          parseInt(order.quantityLeft),
          order.tradeType
        );
        const [holdedMargin, brokerageCollected] = await Promise.all([
          new Ledger({
            userId,
            redisClient,
          }).getLedgerByOrderIdAndParticular({
            orderId: order.id,
            particularName: 'Margin Hold',
          }),
          new Ledger({
            userId,
            redisClient,
          }).getLedgerByOrderIdAndParticular({
            orderId: order.id,
            particularName: 'Brokerage Collected',
          }),
        ]);

        const livePrice = await JSON.parse(
          await redisClient.get(
            `live-${exchange == 'NSE' ? 'NFO' : exchange}:${order.scriptName}`
          )
        );

        return {
          ...order,
          lotSize: livePrice.lotSize,
          pl,
          margin:
            (holdedMargin.transactionAmount * parseInt(order.quantityLeft)) /
            parseInt(order.quantity),
          brokerage:
            (brokerageCollected.transactionAmount *
              parseInt(order.quantityLeft)) /
            parseInt(order.quantity),
        };
      })
    );

    _onlyOpenOrders.forEach((order) => {
      const amount_to_be_released =
        parseFloat(order.margin) +
        parseFloat(order.pl) -
        parseFloat(order.brokerage);
      if (margin_to_be_released + amount_to_be_released <= marginAmount) {
        margin_to_be_released += amount_to_be_released;
        scriptsToSquareOff.push({
          scriptName: order.scriptName,
          quantity: order.quantityLeft,
          tradeType: order.tradeType,
          margin: order.margin,
          brokerage: order.brokerage,
        });
      } else {
        const amount_required = marginAmount - margin_to_be_released;
        margin_to_be_released = marginAmount;

        console.log('lottt', order);
        const quantity = Math.floor(
          (amount_required * parseInt(order.quantityLeft)) /
            (parseFloat(order.margin) +
              parseFloat(order.pl) -
              parseFloat(order.brokerage))
        );

        // quantity should be multiple of lot size and it should be ceil
        const _quantity =
          Math.ceil(
            // @ts-ignore
            parseInt(quantity) / parseInt(order.lotSize)
          ) * parseInt(order.lotSize);

        scriptsToSquareOff.push({
          scriptName: order.scriptName,
          quantity: _quantity,
          tradeType: order.tradeType,
          margin: (order.margin * _quantity) / parseInt(order.quantity),
          brokerage: (order.brokerage * _quantity) / parseInt(order.quantity),
        });
      }
    });

    console.log('scriptsToSquareOff', scriptsToSquareOff);
    await Promise.all(
      scriptsToSquareOff.map(async (script) => {
        if (script.quantity == 0) return;
        const creat_workflow = new CreateWorkflow();
        const liveData = await JSON.parse(
          await redisClient.get(
            `live-${exchange == 'NSE' ? 'NFO' : exchange}:${script.scriptName}`
          )
        );
        const msg: msgType = {
          userId,
          type: script.tradeType == 'B' ? 'S' : 'B',
          script: `${exchange == 'NSE' ? 'NFO' : exchange}:${
            script.scriptName
          }`,
          orderType: 'market',
          quantity: script.quantity,
          price: null,
          isIntraday: false,
          orderCreationDate: new Date(),
          margin: 0,
          brokerage: 0,
          transactionType: '',
          marginChargedType: 'lot',
          marginChargedRate: 0,
          brokerageChargedType: 'lot',
          brokerageChargedRate: 0,
          squareoff: 'system squareoff',
          execData: liveData,
        };
        await AppDataSource.transaction((txn) =>
          creat_workflow.market(msg, userId, txn)
        );
      })
    );
  }

  public static async squareOff(exchange: 'NSE' | 'MCX') {
    try {
      let user = new User({});
      let clients = await user.getAllClients();
      clients.forEach(async (client) => {
        await AppDataSource.transaction(async (tmanager) => {
          let trade = new Trade({
            redisClient: redisClient,
            userId: client.id,
          });
          trade.setTransactionManager(tmanager);
          let ledger = new Ledger({
            redisClient: redisClient,
            userId: client.id,
          });
          ledger.setTransactionManager(tmanager);
          let currentAvlMargin = await ledger.getCreditBalance();
          console.log('currentAvlMargin', currentAvlMargin);
          if (currentAvlMargin < 0) {
            await SmSquareOff.freeMargin(
              client.id,
              Math.abs(currentAvlMargin), // -ve value
              trade,
              exchange
            );
          } else {
            // do not do anything
          }
        });
      });
    } catch (e) {
      //initiating alerts for script fail
      return false;
    }
  }
}

export default SmSquareOff;

// {"instrumentToken":65579783,"tradable":true,"change":"0.34","ltp":"61832.00","buyQty":0,"buyPrice":"61830.00","sellPrice":"61832.00","sellQty":0,"exchangeTimestamp":"2024-02-16T18:38:30.000Z","volumeTraded":0,"tbq":0,"tsq":0,"oi":13399,"open":"61651.00","high":"61904.00","low":"61451.00","close":"61622.00","exchange":"MCX","symbol":"GOLD24APRFUT","expiry":"5-Apr-24","lotSize":"1","isSelected":false}

// {"instrumentToken":65113607,"tradable":true,"change":"1.36","ltp":"72085.00","buyQty":0,"buyPrice":"72080.00","sellPrice":"72085.00","sellQty":0,"exchangeTimestamp":"2024-02-16T18:38:31.000Z","volumeTraded":0,"tbq":0,"tsq":0,"oi":21872,"open":"71276.00","high":"72180.00","low":"70850.00","close":"71121.00","exchange":"MCX","symbol":"SILVER24MARFUT","expiry":"5-Mar-24","lotSize":"1","isSelected":false}
