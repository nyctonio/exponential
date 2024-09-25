import express from 'express';
import morgan from 'morgan';
import { env } from 'env';
import { AppDataSource } from 'database/sql';
import cors from 'cors';
import { queue } from './lib/queue';
import redisClient from 'lib/redis';
import { CreateWorkflow } from 'order';
import moment from 'moment';
import Trade from 'entity/trade';
import Ledger from 'entity/ledger';
import ProjectSetting from 'entity/project-settings';
import { m_projectsetting, m_transaction } from 'database/sql/schema';

const app = express();
const PORT = env.TRADE_PORT;

app.use(express.json());
app.use(cors());
app.use(morgan('combined'));

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

type msgType = {
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

type order = {
  userId: number;
  tradeType: string;
  quantity: number;
  price: number;
  instrumentToken: string;
  exchange: string;
  tradingsymbol: string;
  orderId: number;
  margin: number;
  brokerage: number;
};

class Tick {
  msg: any; // this message is the tick from zerodha
  redisClient: any;
  queue: any;
  pending_order_instruments = [];
  validated_orders: order[] = [];
  constructor(msg: msgType, redisClient: any, queue: any) {
    this.msg = msg;
    this.redisClient = redisClient;
    this.queue = queue;
  }

  private profitLossCalculation(
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

  private validateOrder() {
    let validatedOrders = [];
    this.pending_order_instruments.map((order) => {
      let currentInstrument = this.msg.find(
        (a) => a.instrument_token == order.instrumentToken
      );
      if (currentInstrument) {
        let buyPrice = currentInstrument.depth.buy[0].price.toFixed(2);
        let sellPrice = currentInstrument.depth.sell[0].price.toFixed(2);
        if (
          order.tradeType == 'B' &&
          Number(sellPrice) <= order.price &&
          order.limitType == 'bid'
        ) {
          validatedOrders.push(order);
        } else if (
          order.tradeType == 'B' &&
          Number(sellPrice) >= order.price &&
          order.limitType == 'sl'
        ) {
          validatedOrders.push(order);
        }
        if (
          order.tradeType == 'S' &&
          Number(buyPrice) >= order.price &&
          order.limitType == 'bid'
        ) {
          validatedOrders.push(order);
        } else if (
          order.tradeType == 'S' &&
          Number(buyPrice) <= order.price &&
          order.limitType == 'sl'
        ) {
          validatedOrders.push(order);
        }
      }
    });
    this.validated_orders = validatedOrders;
    return;
  }

  private async removeValidatedOrders() {
    const delete_multi = this.redisClient.multi();
    this.validated_orders.map((a) => {
      delete_multi.hDel(
        `limit-${a.instrumentToken}-${a.tradeType}`,
        `${a.userId}-${a.orderId}`
      );
    });
    await delete_multi.exec();
    return;
  }

  private async realtimeMarginCalculation() {
    let scripts = this.msg;
    const instrumentTokens = scripts.map((a) => `margin-${a.instrument_token}`);
    try {
      const script_multi = this.redisClient.multi();
      instrumentTokens.forEach((key) => {
        script_multi.sMembers(key);
      });
      // all users which have open orders in the scripts which came from tick
      const allUsers = await script_multi.exec();
      // all users + script in ticks live data
      const scriptsMap = new Map();
      allUsers.forEach((users: string[], index) => {
        if (users && users.length > 0) {
          users.map((user) => {
            const _scripts = scriptsMap.get(user) || [];
            scriptsMap.set(user, [
              ..._scripts,
              {
                instrumentToken: scripts[index].instrument_token,
                buyPrice: scripts[index].depth.buy[0].price,
                sellPrice: scripts[index].depth.sell[0].price,
              },
            ]);
          });
          // scriptsMap.set(instrumentTokens[index], users);
        }
      });
      const user_multi = this.redisClient.multi();

      scriptsMap.forEach((value, key) => {
        user_multi.hGetAll(`margin-${key}`);
      });

      // all users current data
      let allScripts = await user_multi.exec();
      //users m2m data
      const user_script_multi = this.redisClient.multi();

      let user_index = 0;
      scriptsMap.forEach((value, key) => {
        let user_script = allScripts[user_index];
        let updatedPLs = {};
        value.forEach((s) => {
          if (user_script[`${s.instrumentToken}-I-T`]) {
            // if intraday
            if (user_script[`${s.instrumentToken}-I-T`] == 'B') {
              user_script[`${s.instrumentToken}-I-PL`] =
                this.profitLossCalculation(
                  parseFloat(user_script[`${s.instrumentToken}-I-P`]),
                  parseFloat(user_script[`${s.instrumentToken}-I-P`]),
                  parseFloat(s.buyPrice),
                  parseFloat(s.sellPrice),
                  parseInt(user_script[`${s.instrumentToken}-I-Q`]),
                  'B'
                );
            } else {
              user_script[`${s.instrumentToken}-I-PL`] =
                this.profitLossCalculation(
                  parseFloat(user_script[`${s.instrumentToken}-I-P`]),
                  parseFloat(user_script[`${s.instrumentToken}-I-P`]),
                  parseFloat(s.buyPrice),
                  parseFloat(s.sellPrice),
                  parseInt(user_script[`${s.instrumentToken}-I-Q`]),
                  'S'
                );
            }
          }
          if (user_script[`${s.instrumentToken}-N-T`]) {
            // normal
            if (user_script[`${s.instrumentToken}-N-T`] == 'B') {
              user_script[`${s.instrumentToken}-N-PL`] =
                this.profitLossCalculation(
                  parseFloat(user_script[`${s.instrumentToken}-N-P`]),
                  parseFloat(user_script[`${s.instrumentToken}-N-P`]),
                  parseFloat(s.buyPrice),
                  parseFloat(s.sellPrice),
                  parseInt(user_script[`${s.instrumentToken}-N-Q`]),
                  'B'
                );
            } else {
              user_script[`${s.instrumentToken}-N-PL`] =
                this.profitLossCalculation(
                  parseFloat(user_script[`${s.instrumentToken}-N-P`]),
                  parseFloat(user_script[`${s.instrumentToken}-N-P`]),
                  parseFloat(s.buyPrice),
                  parseFloat(s.sellPrice),
                  parseInt(user_script[`${s.instrumentToken}-N-Q`]),
                  'S'
                );
            }
          }
          // check for NaN (conflict bw redis and postgres)
          // console.log('updated pl ', user_script[`${s.instrumentToken}-PL`]);
          if (user_script[`${s.instrumentToken}-I-PL`]) {
            updatedPLs[`${s.instrumentToken}-I-PL`] =
              user_script[`${s.instrumentToken}-I-PL`];
          }
          if (user_script[`${s.instrumentToken}-N-PL`]) {
            updatedPLs[`${s.instrumentToken}-N-PL`] =
              user_script[`${s.instrumentToken}-N-PL`];
          }
        });

        // fix this it is memory leak
        this.m2mHandler({ ...user_script, ...updatedPLs }, key.split('-')[1]);
        user_script_multi.hSet(`margin-${key}`, updatedPLs);
        // @ts-ignore batch updating 1 user n scripts
        user_index++;
      });
      // batch updating n users
      await user_script_multi.exec();
      // console.log('final', allScripts, scriptsMap);
      // console.log('executeddddd == > **');

      return true;
    } catch (e) {
      console.log('error in realtime margin calculation ', e);
      // handle error
      return false;
    }
  }

  public async freeMargin(userId: number, marginAmount: number, trade) {
    let margin_to_be_released = 0;
    let openOrders = await trade.getAllOpenOrders({ exchange: ['NSE', 'MCX'] });
    const onlyOpenOrders = openOrders.filter(
      (order) => order.transactionStatus === 'open'
    );

    const scriptsToSquareOff: {
      scriptName: string;
      quantity: number;
      tradeType: string;
      brokerage: number;
      margin: number;
      exchange: string;
    }[] = [];

    const _onlyOpenOrders = await Promise.all(
      onlyOpenOrders.map(async (order) => {
        const currentPrice = await JSON.parse(
          await redisClient.get(
            `live-${order.exchange == 'NSE' ? 'NFO' : order.exchange}:${
              order.scriptName
            }`
          )
        );
        const pl = this.profitLossCalculation(
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
            `live-${order.exchange == 'NSE' ? 'NFO' : order.exchange}:${
              order.scriptName
            }`
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
          exchange: order.exchange,
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
          exchange: order.exchange,
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
          exchange: order.exchange,
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
            `live-${script.exchange == 'NSE' ? 'NFO' : script.exchange}:${
              script.scriptName
            }`
          )
        );
        const msg: msgType = {
          userId,
          type: script.tradeType == 'B' ? 'S' : 'B',
          script: `${script.exchange == 'NSE' ? 'NFO' : script.exchange}:${
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
        await AppDataSource.transaction(async (txn) => {
          await creat_workflow.market(msg, userId, txn);
          await redisClient.hSet(`m2m-user-${userId}`, { status: 'idle' });
        });
      })
    );
  }

  private async m2mHandler(
    userMarginData: { [key: string]: string },
    userId: number
  ) {
    let m2mSettings = await redisClient.hGetAll(`m2m-user-${userId}`);
    if (
      m2mSettings.allowed == 'true' &&
      (m2mSettings.status == 'idle' || !m2mSettings.status) &&
      userMarginData.margin
    ) {
      let plSum = 0;
      Object.keys(userMarginData)
        .filter((a) => a.endsWith('-PL'))
        .map((key) => {
          plSum += Number(userMarginData[`${key}`]);
        });

      let currentMargin = Number(userMarginData['margin']);
      // Calculate the threshold for squaring off based on the percentage value in m2mSettings
      let squareOffThreshold =
        currentMargin * (Number(m2mSettings.value) / 100);

      // Check if the absolute value of plSum (loss) exceeds the threshold
      if (Math.abs(plSum) >= squareOffThreshold) {
        // Trigger square off event
        console.log('User needs to be squared off');
        // Add logic to square off the user's positions
        await redisClient.hSet(`m2m-user-${userId}`, { status: 'square off' });
        let trade = new Trade({ userId, redisClient: redisClient });
        await this.freeMargin(
          userId,
          Math.abs(plSum) - squareOffThreshold,
          trade
        );
      }
    }
    return;
  }

  public async processTick() {
    try {
      //generating keys from live data to check from redis.
      let keys = [];
      this.msg.map((item) => {
        keys.push(
          `limit-${item.instrument_token}-B`,
          `limit-${item.instrument_token}-S`
        );
      });
      if (keys.length == 0) return;

      const pending_order_multi = this.redisClient.multi();
      keys.forEach((key) => {
        pending_order_multi.hGetAll(key);
      });
      let pendingOrders = await pending_order_multi.exec();
      pendingOrders = pendingOrders.filter((a) => Object.keys(a).length > 0);
      pendingOrders = [...pendingOrders.map((a) => Object.values(a)).flat()];
      // @ts-ignore
      pendingOrders = pendingOrders.map((a) => JSON.parse(a));
      this.pending_order_instruments = pendingOrders;
      this.validateOrder();
      if (this.validated_orders.length != 0) {
        await this.removeValidatedOrders();
        await this.queue.publish(
          env.LIMIT_ORDER_QUEUE,
          JSON.stringify(this.validated_orders)
        );
      }
      await this.realtimeMarginCalculation();

      return;
    } catch (e) {
      console.log('error in processing tick ', e);
      return;
    }
  }
}

class Limit {
  orders: order[];
  tmanager: any;
  trade: Trade | null = null;
  margin_transaction_particular_data: m_projectsetting;
  brokerage_transaction_particular_data: m_projectsetting;
  profit_transaction_particular_data: m_projectsetting;
  loss_transaction_particular_data: m_projectsetting;
  redisClient;
  constructor(orders: order[], redisClient) {
    this.orders = orders;
    this.redisClient = redisClient;
  }

  private evaluateOpenOrderDataUpdate(
    openOrder: m_transaction,
    balanceQuantity: number,
    order: order
  ) {
    //paramaters needed to be update
    let dataToUpdate = {
      transactionStatus: openOrder.transactionStatus,
      quantityLeft: openOrder.quantityLeft,
      buyPrice: null,
      sellPrice: null,
      newCreationQty: null,
    };
    let orderQty = openOrder.quantityLeft;
    let checkDiff = balanceQuantity - orderQty;

    //case where balance quantity is greater than open order quantity left
    if (checkDiff >= 0) {
      dataToUpdate['quantityLeft'] = 0;
      dataToUpdate['transactionStatus'] = 'closed';
      balanceQuantity = balanceQuantity - orderQty;
      dataToUpdate.newCreationQty = openOrder.quantityLeft;
      orderQty = 0;
    }
    //case where the balance quantity is less than the open order quantity left
    else {
      orderQty = (balanceQuantity - orderQty) * -1;
      dataToUpdate['transactionStatus'] = 'open';
      dataToUpdate['quantityLeft'] = orderQty;
      dataToUpdate.newCreationQty = balanceQuantity;
      balanceQuantity = 0;
    }

    //updating the sell and buy prices of the open orders
    if (openOrder.tradeType == 'B') {
      if (openOrder.sellPrice) {
        dataToUpdate['sellPrice'] =
          // (Number(openOrder.sellPrice) + Number(order.price)) / 2;
          ((openOrder.quantity - openOrder.quantityLeft) *
            Number(openOrder.sellPrice) +
            order.price * dataToUpdate.newCreationQty) /
          (dataToUpdate.newCreationQty +
            openOrder.quantity -
            openOrder.quantityLeft);
      } else {
        dataToUpdate['sellPrice'] = Number(order.price);
      }
    }
    if (openOrder.tradeType == 'S') {
      if (openOrder.buyPrice) {
        dataToUpdate['buyPrice'] =
          ((openOrder.quantity - openOrder.quantityLeft) *
            Number(openOrder.buyPrice) +
            order.price * dataToUpdate.newCreationQty) /
          (dataToUpdate.newCreationQty +
            openOrder.quantity -
            openOrder.quantityLeft);
      } else {
        dataToUpdate['buyPrice'] = order.price;
      }
    }
    return dataToUpdate;
  }

  private async openOrdersProcessor(
    order: order,
    openOrders: m_transaction[],
    orderData: m_transaction,
    ledger: Ledger,
    trade: Trade
  ) {
    let balanceQuantity = order.quantity;
    await Promise.all(
      openOrders.map(async (openOrder) => {
        if (balanceQuantity > 0) {
          let dataToUpdate = this.evaluateOpenOrderDataUpdate(
            openOrder,
            balanceQuantity,
            order
          );
          //updating trade quantity, buy and sell price, status of open order.
          //marking order as closed if quantityLeft becomes zero, else it will still be a open order
          let updatedTrade = await trade.updateOrder({
            id: openOrder.id,
            transactionStatus: dataToUpdate.transactionStatus,
            quantityLeft: dataToUpdate.quantityLeft,
            buyPrice: dataToUpdate.buyPrice,
            sellPrice: dataToUpdate.sellPrice,
          });

          // (BUG TODO -fix)
          //pulling the transaction from ledger where margin was debited
          let transactionOrder = await ledger.getLedgerByOrderIdAndParticular({
            orderId: openOrder.id,
            particularName: 'Margin Hold',
          });

          //creating new closed order of same quantity as open order quantity
          let newOrder = await trade.createMultipleOrders([
            {
              buyPrice: order.tradeType == 'B' ? order.price : null,
              sellPrice: order.tradeType == 'S' ? order.price : null,
              lotSize: openOrder.lotSize,
              quantity: dataToUpdate.newCreationQty,
              quantityLeft: 0,
              margin:
                (transactionOrder.transactionAmount / openOrder.quantity) *
                dataToUpdate.newCreationQty,
              brokerage:
                (order.brokerage / order.quantity) *
                dataToUpdate.newCreationQty,
              tradeType: order.tradeType,
              transactionStatus: 'closed',
              orderCreationDate: orderData.orderCreationDate,
              parentId: openOrder.id,
              orderExecutionDate: moment().utc().toDate(),
              brokerageChargedRate: orderData.brokerageChargedRate,
              brokerageChargedType: orderData.brokerageChargedType,
              isIntraday: orderData.isIntraday,
              marginChargedRate: orderData.marginChargedRate,
              marginChargedType: orderData.marginChargedType,
              tradeRemarks: orderData.tradeRemarks,
            },
          ]);

          //creding margin
          await ledger.creditBalance({
            amount:
              (transactionOrder.transactionAmount / openOrder.quantity) *
              dataToUpdate.newCreationQty,
            currUserId: null,
            transactionParticularId: this.margin_transaction_particular_data.id,
            transactionRemarks: `Margin Credited for ${
              dataToUpdate.newCreationQty / openOrder.lotSize
            } lots of ${order.tradingsymbol}`,
            orderId: openOrder.id,
          });

          //evaluating PL
          let amtDiff: number;
          if (order.tradeType == 'B') {
            amtDiff = openOrder.sellPrice - order.price;
          } else {
            amtDiff = order.price - openOrder.buyPrice;
          }

          if (amtDiff >= 0) {
            await ledger.creditBalance({
              amount: dataToUpdate.newCreationQty * amtDiff,
              currUserId: null,
              transactionRemarks: `Profit credited for ${
                dataToUpdate.newCreationQty / openOrder.lotSize
              } lots of ${order.tradingsymbol}`,
              orderId: openOrder.id,
              transactionParticularId:
                this.profit_transaction_particular_data.id,
            });
          } else {
            await ledger.debitBalance({
              amount: dataToUpdate.newCreationQty * amtDiff * -1,
              currUserId: null,
              transactionRemarks: `Loss debited for ${
                dataToUpdate.newCreationQty / openOrder.lotSize
              } lots of ${order.tradingsymbol}`,
              orderId: openOrder.id,
              transactionParticularId: this.loss_transaction_particular_data.id,
            });
          }

          //debiting brokerage
          await ledger.debitBalance({
            amount:
              (order.brokerage / order.quantity) * dataToUpdate.newCreationQty,
            currUserId: null,
            transactionRemarks: `Brokerage debited for ${
              dataToUpdate.newCreationQty / openOrder.lotSize
            } lots of ${order.tradingsymbol}`,
            transactionParticularId:
              this.brokerage_transaction_particular_data.id,
            orderId: openOrder.id,
          });
        }
      })
    );
  }

  private async orderProcessor() {
    //steps involved
    //1. Iterating through orders in one message of queue
    //2. Fetching the data of all orders from postgres
    //3. creating trade & ledger object for each order
    //4. Fetching open orders of same script of rev type
    //5. If open orders are 0, then it means its a fresh bid. If not means its stop loss and we need to credit margin and debit brokerage
    await Promise.all(
      this.orders.map(async (order) => {
        console.log('on order', order);
        let trade = new Trade({
          userId: order.userId,
          redisClient: this.redisClient,
          orderType: 'limit',
          exchange: order.exchange == 'NFO' ? 'NSE' : order.exchange,
          scriptName: order.tradingsymbol,
        });
        let ledger = new Ledger({
          userId: order.userId,
          redisClient: this.redisClient,
        });
        ledger.setTransactionManager(this.tmanager);
        trade.setTransactionManager(this.tmanager);
        let orderData = await trade.getOrderById(order.orderId);
        console.log('order data ', orderData);
        if (!orderData) return;
        if (orderData.transactionStatus != 'executed') {
          let openOrders = await trade.getOpenOrders({
            type: order.tradeType == 'B' ? 'S' : 'B',
            order: orderData.isIntraday ? 'intraday' : 'normal',
          });
          console.log('open orders raw ', openOrders);
          if (openOrders.length == 0) {
            //creating bid open order.
            let newOrder = await trade.createMultipleOrders([
              {
                buyPrice: order.tradeType == 'B' ? order.price : null,
                sellPrice: order.tradeType == 'S' ? order.price : null,
                lotSize: orderData.lotSize,
                quantity: orderData.quantity,
                quantityLeft: orderData.quantityLeft,
                margin: order.margin,
                brokerage: order.brokerage,
                tradeType: order.tradeType,
                transactionStatus: 'open',
                orderCreationDate: orderData.orderCreationDate,
                parentId: null,
                orderId: order.orderId,
                orderExecutionDate: moment().utc().toDate(),
                brokerageChargedRate: orderData.brokerageChargedRate,
                brokerageChargedType: orderData.brokerageChargedType,
                isIntraday: orderData.isIntraday,
                marginChargedRate: orderData.marginChargedRate,
                marginChargedType: orderData.marginChargedType,
                tradeRemarks: orderData.tradeRemarks,
              },
            ]);
            const _ledger = await ledger.getLedgerByOrderIdAndParticular({
              orderId: order.orderId,
              particularName: 'Margin Hold',
            });
            // updating the transaction ledger order id
            await ledger.updateLedgerOrderId({
              orderId: newOrder[0].id,
              ledgerId: _ledger.id,
            });
            //deducting brokerage
            await ledger.debitBalance({
              amount: order.brokerage,
              currUserId: null,
              transactionParticularId:
                this.brokerage_transaction_particular_data.id,
              transactionRemarks: `Brokerage debit for ${order.quantity} quantity of ${order.tradingsymbol}`,
              orderId: newOrder[0].id,
            });
          }
          await this.openOrdersProcessor(
            order,
            openOrders,
            orderData,
            ledger,
            trade
          );
        }
      })
    );

    return;
  }

  private async addOpenOrdersRedis() {
    await Promise.all(
      this.orders.map(async (order) => {
        const trade = new Trade({
          userId: order.userId,
          redisClient: this.redisClient,
        });
        const openOrders = await trade.getOpenOrdersByScriptName({
          scriptName: order.tradingsymbol,
        });

        if (openOrders.length > 0) {
          const margin_multi = this.redisClient.multi();
          margin_multi.sAdd(
            `margin-${order.instrumentToken}`,
            `user-${order.userId}`
          );
          openOrders.forEach((openOrder) => {
            if (openOrder.isIntraday) {
              margin_multi.hSet(`margin-user-${order.userId}`, {
                [`${order.instrumentToken}-I-T`]:
                  openOrders[0].tradeType == 'B' ? 'B' : 'S',
                [`${order.instrumentToken}-I-P`]:
                  openOrders[0].tradeType == 'B'
                    ? parseFloat(openOrders[0].buyPriceAvg) /
                      parseFloat(openOrders[0].quantityLeft)
                    : parseFloat(openOrders[0].sellPriceAvg) /
                      parseFloat(openOrders[0].quantityLeft),
                [`${order.instrumentToken}-I-Q`]: openOrders[0].quantityLeft,
                [`${order.instrumentToken}-I-PL`]: 0,
              });
            } else {
              margin_multi.hSet(`margin-user-${order.userId}`, {
                [`${order.instrumentToken}-N-T`]:
                  openOrders[0].tradeType == 'B' ? 'B' : 'S',
                [`${order.instrumentToken}-N-P`]:
                  openOrders[0].tradeType == 'B'
                    ? parseFloat(openOrders[0].buyPriceAvg) /
                      parseFloat(openOrders[0].quantityLeft)
                    : parseFloat(openOrders[0].sellPriceAvg) /
                      parseFloat(openOrders[0].quantityLeft),
                [`${order.instrumentToken}-N-Q`]: openOrders[0].quantityLeft,
                [`${order.instrumentToken}-N-PL`]: 0,
              });
            }
          });
          await margin_multi.exec();
        } else {
          // remove from redis
          await this.redisClient
            .multi()
            .sRem(`margin-${order.instrumentToken}`, `user-${order.userId}`)
            .hDel(`margin-user-${order.userId}`, `${order.instrumentToken}-I-T`)
            .hDel(`margin-user-${order.userId}`, `${order.instrumentToken}-N-T`)
            .hDel(`margin-user-${order.userId}`, `${order.instrumentToken}-I-P`)
            .hDel(`margin-user-${order.userId}`, `${order.instrumentToken}-N-P`)
            .hDel(`margin-user-${order.userId}`, `${order.instrumentToken}-I-Q`)
            .hDel(`margin-user-${order.userId}`, `${order.instrumentToken}-N-Q`)
            .hDel(
              `margin-user-${order.userId}`,
              `${order.instrumentToken}-I-PL`
            )
            .hDel(
              `margin-user-${order.userId}`,
              `${order.instrumentToken}-N-PL`
            )
            .exec();
        }
      })
    );
    return;
  }

  public async executeOrder() {
    await AppDataSource.transaction(async (manager) => {
      this.tmanager = manager;
      this.trade = new Trade({ userId: -1, redisClient: this.redisClient });
      let projectSetting = new ProjectSetting();
      this.margin_transaction_particular_data =
        await projectSetting.getProjectSettingByKeyAndConstant(
          'TRXNPRT',
          'Margin Released'
        );

      this.brokerage_transaction_particular_data =
        await projectSetting.getProjectSettingByKeyAndConstant(
          'TRXNPRT',
          'Brokerage Collected'
        );

      this.profit_transaction_particular_data =
        await projectSetting.getProjectSettingByKeyAndConstant(
          'TRXNPRT',
          'Trade Profit'
        );

      this.loss_transaction_particular_data =
        await projectSetting.getProjectSettingByKeyAndConstant(
          'TRXNPRT',
          'Trade Loss'
        );
      this.trade.setTransactionManager(manager);

      //iterating through the orders
      await this.orderProcessor();

      // marking status to be executed
      await this.trade.limitBulkStatusUpdate(this.orders.map((a) => a.orderId));
    });
    // adding open orders to redis to maintain margin
    await this.addOpenOrdersRedis();
    return;
  }
}

class TradeService {
  static async createOrder() {
    await queue.consume(env.ORDER_QUEUE, async (msg: msgType) => {
      let create_flow = new CreateWorkflow();
      await AppDataSource.transaction(async (trx) => {
        if (msg.orderType == 'market') {
          await create_flow.market(msg, msg.userId, trx);
        } else {
          await create_flow.limit(msg, msg.userId, trx);
        }
      });
    });
  }

  static async processOrder() {
    await queue.consume(env.TRADE_DATA_QUEUE, async (msg) => {
      try {
        let tick = new Tick(msg, redisClient, queue);
        await tick.processTick();
        return;
      } catch (e) {
        console.log('error in processing tick in trade queue ', e);
      }
    });
  }

  public static async executeLimitOrders(redisClient, queue) {
    await queue.consume(env.LIMIT_ORDER_QUEUE, async (orders: order[]) => {
      let limit = new Limit(orders, redisClient);
      await limit.executeOrder();
      return;
    });
  }
}

app.listen(PORT, async () => {
  await AppDataSource.initialize();
  await queue.connect();
  await TradeService.createOrder();
  await TradeService.processOrder();
  await TradeService.executeLimitOrders(redisClient, queue);
  console.log(`Server is started on port ${PORT}`);
});
