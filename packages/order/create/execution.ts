import Trade from 'entity/trade';
import { AppDataSource } from 'database/sql';
import { env } from 'env';
import moment from 'moment';
import Ledger from 'entity/ledger';
import ProjectSetting from 'entity/project-settings';
import { m_projectsetting, m_transaction } from 'database/sql/schema';

// let count = 0;

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
  msg;
  pending_order_instruments = [];
  validated_orders: order[] = [];
  redisClient;
  queue;
  constructor(msg, redisClient, queue) {
    this.msg = msg;
    this.redisClient = redisClient;
    this.queue = queue;
  }

  private validateOrder() {
    let validatedOrders = [];
    this.pending_order_instruments.map((order) => {
      console.log('validating order ', order);
      let currentInstrument = this.msg.find(
        (a) => a.instrument_token == order.instrumentToken
      );
      console.log('current instrument is ', currentInstrument);
      if (currentInstrument) {
        let buyPrice = currentInstrument.depth.buy[0].price.toFixed(2);
        let sellPrice = currentInstrument.depth.sell[0].price.toFixed(2);
        if (order.tradeType == 'B' && Number(sellPrice) <= order.price) {
          console.log('validated order B');
          validatedOrders.push(order);
        }
        if (order.tradeType == 'S' && Number(buyPrice) >= order.price) {
          console.log('validated order S');
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

  private async realtimeMarginCalculation() {
    console.log('realtime margin calculation');
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
      // console.log('all scripts ', allScripts, scriptsMap);
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
        user_script_multi.hSet(`margin-${key}`, updatedPLs);
        // @ts-ignore batch updating 1 user n scripts
        user_index++;
      });
      // batch updating n users
      await user_script_multi.exec();
      // console.log('final', allScripts, scriptsMap);
      // console.log('executeddddd == > **');
    } catch (e) {
      console.log('error in realtime margin calculation ', e);
      // handle error
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
      // console.log('keys are ', keys);
      if (keys.length == 0) return;
      //getting pending orders from redis
      // console.log('loooking for keys ', keys);
      // count++;
      // console.time(`pending ${count} `);
      const pending_order_multi = this.redisClient.multi();
      keys.forEach((key) => {
        pending_order_multi.hGetAll(key);
      });
      let pendingOrders = await pending_order_multi.exec();
      // checking if the pending orders are not empty
      pendingOrders = pendingOrders.filter((a) => Object.keys(a).length > 0);
      pendingOrders = [...pendingOrders.map((a) => Object.values(a)).flat()];
      // @ts-ignore
      pendingOrders = pendingOrders.map((a) => JSON.parse(a));
      this.pending_order_instruments = pendingOrders;
      // console.timeEnd(`pending ${count} `);
      console.log('pending orders ', pendingOrders);
      // filtering the keys that fullfill the criteria for execution
      // console.time(`pending ${count} `);
      this.validateOrder();
      // console.timeEnd(`pending ${count} `);
      console.log('validated orders ', this.validated_orders);
      if (this.validated_orders.length != 0) {
        // console.log('validated orders', this.validated_orders);
        // removing the fulfiled keys from redis
        await this.removeValidatedOrders();
        // push to execute limit orders
        console.log('push to limit orders');
        await this.queue.publish(
          env.LIMIT_ORDER_QUEUE,
          JSON.stringify(this.validated_orders)
        );
      }
      // realtime calculation of margin
      // console.time(`margin ${count} `);
      await this.realtimeMarginCalculation();
      // console.timeEnd(`margin ${count} `);
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
    console.log('executing order');
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

class OrderProcessor {
  public static async processOrders(queue, redisClient) {
    //consuming live data from queue;
    await queue.consume(env.TRADE_DATA_QUEUE, async (msg) => {
      try {
        let tick = new Tick(msg, redisClient, queue);
        await tick.processTick();
        return;
      } catch (e) {
        console.log('error in processint tick in trade queue ', e);
      }
    });
  }

  public static async executeLimitOrders(redisClient, queue) {
    await queue.consume(env.LIMIT_ORDER_QUEUE, async (orders: order[]) => {
      console.log('rec in limit');
      let limit = new Limit(orders, redisClient);
      await limit.executeOrder();
      return;
    });
  }
}

export { OrderProcessor };
