import { m_transaction, m_exchangesetting } from 'database/sql/schema';
import { Not, In, Brackets } from 'typeorm';
import type { RedisClientType } from 'lib/redis';
import moment from 'moment';
import {
  EntityManager,
  ILike,
  Between,
  MoreThanOrEqual,
  LessThan,
  LessThanOrEqual,
} from 'typeorm';
import { AppDataSource } from 'database/sql';
import Instruments from '../instruments';

type GetOrders = {
  username: string;
  exchange: string;
  script: string;
  tradeDateFrom: string | null;
  tradeDateTo: string | null;
  pageNumber: number;
  pageSize: number;
  transactionStatus: string;
  sort: any;
  groupByScript: boolean | null;
};

class Trade {
  userId: number = null;
  scriptName: string = null;
  exchange: string = null;
  orderType: string = null;
  tmanager: EntityManager = null;
  redisClient: RedisClientType = null;

  constructor({
    userId,
    scriptName,
    orderType,
    exchange,
    redisClient,
  }: {
    userId: number;
    redisClient: RedisClientType;
    scriptName?: string;
    exchange?: string;
    orderType?: string;
  }) {
    this.userId = userId;
    this.scriptName = scriptName;
    this.orderType = orderType;
    this.exchange = exchange;
    if (!redisClient) {
      throw new Error('redis client is null');
    }
    this.redisClient = redisClient;
  }

  setTransactionManager(tmanager: EntityManager) {
    this.tmanager = tmanager;
  }

  async getOrderById(orderId: number) {
    return await m_transaction.findOne({
      where: { id: orderId },
      relations: { order: true },
    });
  }

  async getOrders(data: GetOrders, currUser: { id: number; userType: string }) {
    let filter: any = {
      user: {},
    };

    if (data.exchange != '') {
      filter['exchange'] = data.exchange;
    }

    if (data.username.length > 0) {
      filter.user.username = ILike(`%${data.username}%`);
    }
    if (data.script.length > 0) {
      filter.scriptName = ILike(`%${data.script}%`);
    }

    if (data.transactionStatus.length > 0) {
      let status = data.transactionStatus.split(',').map((a) => a.trim());
      filter.transactionStatus = In(status);
    }

    if (currUser.userType == 'Company') {
      filter.user.company = {
        id: currUser.id,
      };
    }

    if (currUser.userType == 'Master') {
      filter.user.master = {
        id: currUser.id,
      };
    }
    if (currUser.userType == 'Broker') {
      filter.user.broker = {
        id: currUser.id,
      };
    }
    if (currUser.userType == 'Sub-Broker') {
      filter.user.subBroker = {
        id: currUser.id,
      };
    }

    if (currUser.userType == 'Client') {
      filter.user.id = currUser.id;
    }

    if (data.tradeDateFrom && !data.tradeDateTo) {
      filter['createdAt'] = MoreThanOrEqual(
        moment(data.tradeDateFrom, 'YYYY-MM-DD').utc().toDate()
      );
    }

    if (!data.tradeDateFrom && data.tradeDateTo) {
      filter['createdAt'] = LessThanOrEqual(
        moment(data.tradeDateFrom, 'YYYY-MM-DD').utc().toDate()
      );
    }

    if (data.tradeDateFrom && data.tradeDateTo) {
      filter['createdAt'] = Between(
        moment(data.tradeDateFrom, 'YYYY-MM-DD').utc().toDate(),
        moment(data.tradeDateTo, 'YYYY-MM-DD').utc().toDate()
      );
    }

    console.log('filter is ', filter);
    let [ordersData, count] = [null, null];

    if (data.groupByScript == true) {
      console.log('searching');

      const fiters_to_apply = [
        data.sort ? data.sort : 'latestTransactionDate',
        // page size
        data.pageSize,
        // pagination
        (data.pageNumber - 1) * data.pageSize,
        // transaction status
        'open',
        // username
        `%${data.username}%`,
        // user id
        currUser.id,
      ];
      // script name
      if (data.script.length > 0) {
        fiters_to_apply.push(`%${data.script}%`);
      } else {
        fiters_to_apply.push(true);
      }
      // exchange
      if (data.exchange.length > 0) {
        fiters_to_apply.push(data.exchange);
      } else {
        fiters_to_apply.push(true);
      }
      // trade date from and to
      if (data.tradeDateFrom && !data.tradeDateTo) {
        fiters_to_apply.push(
          moment(data.tradeDateFrom, 'YYYY-MM-DD').utc().toDate()
        );
      }
      if (!data.tradeDateFrom && data.tradeDateTo) {
        fiters_to_apply.push(
          moment(data.tradeDateTo, 'YYYY-MM-DD').utc().toDate()
        );
      }
      if (data.tradeDateFrom && data.tradeDateTo) {
        fiters_to_apply.push(
          moment(data.tradeDateFrom, 'YYYY-MM-DD').utc().toDate(),
          moment(data.tradeDateTo, 'YYYY-MM-DD').utc().toDate()
        );
      }

      const query = `
      SELECT 
        trans."scriptName",
        COUNT(trans.id) AS transactionCount,
        MAX(trans."createdAt") as latestTransactionDate,
        trans."transactionStatus",
        trans."tradeType",
        trans."exchange",
        trans."lotSize",
        trans."isIntraday",
        SUM(trans."quantityLeft") as "quantityLeft",
        SUM(trans.quantity) as quantity,
        (SUM(trans."buyPrice" * trans."quantityLeft") / SUM(trans."quantityLeft")) as "buyPriceAvg",
        (SUM(trans."sellPrice" * trans."quantityLeft") / SUM(trans."quantityLeft")) as "sellPriceAvg",
        usr."username",
        usr."id" as userId,
        upline."username" as upline
      FROM 
        m_transaction AS trans
      LEFT JOIN
        m_user AS usr ON trans."userId" = usr.id 
      LEFT JOIN
        m_user as upline ON usr."createdByUserId" = upline.id
      WHERE
        trans."transactionStatus" IN ($4)
      AND
        usr."username" ILIKE $5
      AND
        ${
          currUser.userType == 'Company'
            ? 'usr."companyId" = $6'
            : currUser.userType == 'Master'
              ? 'usr."masterId" = $6'
              : currUser.userType == 'Broker'
                ? 'usr."brokerId" = $6'
                : currUser.userType == 'Sub-Broker'
                  ? 'usr."subBrokerId" = $6'
                  : currUser.userType == 'Client'
                    ? 'usr."id" = $6'
                    : 'true'
        }
      AND
        ${data.script.length > 0 ? 'trans."scriptName" LIKE $7' : '$7=$7'}
      AND
        ${data.exchange.length > 0 ? 'trans."exchange" = $8' : '$8=$8'}
      AND
        ${
          data.tradeDateFrom && !data.tradeDateTo
            ? 'm_transaction.createdAt >= $9'
            : !data.tradeDateFrom && data.tradeDateTo
              ? 'trans."createdAt" <= $9'
              : data.tradeDateFrom && data.tradeDateTo
                ? 'trans."createdAt" BETWEEN $9 AND $10'
                : 'true'
        }
      GROUP BY 
        trans."scriptName",
        trans."transactionStatus",
        trans."tradeType",
        trans."lotSize",
        trans."exchange",
        trans."isIntraday",
        usr."username",
        usr."id",
        upline."username"  
      ORDER BY $1
      LIMIT $2
      OFFSET $3
      `;
      const count_query = `
      SELECT
        COUNT(DISTINCT concat(usr.id ,trans."scriptName" ,trans."isIntraday" )) as count
      FROM 
        m_transaction AS trans
      LEFT JOIN
        m_user AS usr ON trans."userId" = usr.id 
      LEFT JOIN
        m_user as upline ON usr."createdByUserId" = upline.id
      WHERE
        trans."transactionStatus" IN ($4)
      AND
        usr."username" ILIKE $5
      AND
        ${
          currUser.userType == 'Company'
            ? 'usr."companyId" = $6'
            : currUser.userType == 'Master'
              ? 'usr."masterId" = $6'
              : currUser.userType == 'Broker'
                ? 'usr."brokerId" = $6'
                : currUser.userType == 'Sub-Broker'
                  ? 'usr."subBrokerId" = $6'
                  : currUser.userType == 'Client'
                    ? 'usr."id" = $6'
                    : 'true'
        }
      AND
        ${data.script.length > 0 ? 'trans."scriptName" LIKE $7' : '$7=$7'}
      AND
        ${data.exchange.length > 0 ? 'trans."exchange" = $8' : '$8=$8'}
      AND
        ${
          data.tradeDateFrom && !data.tradeDateTo
            ? 'm_transaction.createdAt >= $9'
            : !data.tradeDateFrom && data.tradeDateTo
              ? 'trans."createdAt" <= $9'
              : data.tradeDateFrom && data.tradeDateTo
                ? 'trans."createdAt" BETWEEN $9 AND $10'
                : 'true'
        }
      AND $1 = $1
      AND $2 = $2
      AND $3 = $3
      GROUP BY 
        trans."scriptName",
        trans."transactionStatus",
        trans."tradeType",
        trans."exchange",
        trans."lotSize",
        trans."isIntraday",
        usr."username",
        usr."id",
        upline."username"  
      `;

      [ordersData, count] = await Promise.all([
        AppDataSource.query(query, fiters_to_apply),
        AppDataSource.query(count_query, fiters_to_apply),
      ]);

      count = count.reduce((prevCount, v) => {
        return Number(v.count) + prevCount;
      }, 0);

      console.log('orders data length ', ordersData);
      console.log('total count ', count);
    } else {
      [ordersData, count] = await Promise.all([
        m_transaction.find({
          where: [{ ...filter }, { ...filter, user: { id: currUser.id } }],
          skip: (data.pageNumber - 1) * data.pageSize,
          take: data.pageSize,
          relations: {
            user: {
              createdByUser: true,
            },
          },
          select: {
            user: {
              username: true,
              id: true,
              createdByUser: {
                id: true,
                username: true,
              },
            },
          },
          order: {
            orderCreationDate: 'DESC',
            ...data.sort,
          },
        }),
        m_transaction.count({
          where: [{ ...filter }, { ...filter, user: { id: currUser.id } }],
        }),
      ]);
    }

    // console.log('orders data ', ordersData.length);
    let redisKeys = [];
    if (ordersData.length > 0) {
      redisKeys = ordersData.map((order) => {
        return `live-${order.exchange == 'NSE' ? 'NFO' : order.exchange}:${
          order.scriptName
        }`;
      });
    }

    // console.log('keys are ', redisKeys);
    let redisData = await this.getRedisPositions(redisKeys);
    // console.log('data from redis is ', redisData);
    let finalOrdersData = ordersData.map((order, index) => {
      let checkData: any = redisData[index];
      if (checkData) {
        checkData = JSON.parse(checkData);
        return {
          ...order,
          currentSellPrice:
            checkData.sellPrice == '0.00' ? checkData.ltp : checkData.sellPrice,
          currentBuyPrice:
            checkData.buyPrice == '0.00' ? checkData.ltp : checkData.buyPrice,
        };
      } else {
        return order;
      }
    });

    return { orders: finalOrdersData, count };
  }

  async getOpenOrders({
    type,
    order,
  }: {
    type: string;
    order: 'intraday' | 'normal' | 'all';
  }) {
    const openOrders = await m_transaction.find({
      relations: {
        order: true,
      },
      where: {
        user: { id: this.userId },
        transactionStatus: 'open',
        tradeType: type,
        scriptName: this.scriptName,
        isIntraday:
          order == 'intraday' ? true : order == 'normal' ? false : Not(null),
      },
      // FIFO
      order: {
        id: 'ASC',
      },
    });
    return openOrders;
  }

  async getOpenOrdersByScript() {
    const openOrders = await m_transaction
      .createQueryBuilder('transaction')
      .select('transaction.scriptName', 'scriptName')
      .addSelect('transaction.tradeType', 'tradeType')
      .addSelect('SUM(transaction.quantityLeft)', 'quantityLeft')
      .where({
        user: { id: this.userId },
        transactionStatus: 'open',
      })
      .groupBy('transaction.scriptName')
      .addGroupBy('transaction.tradeType')
      .getRawMany();
    return openOrders;
  }

  async getOpenOrdersByScriptName({ scriptName }: { scriptName: string }) {
    if (this.tmanager == null) {
      const openOrders = await m_transaction
        .createQueryBuilder('transaction')
        .select('transaction.scriptName', 'scriptName')
        .addSelect('transaction.tradeType', 'tradeType')
        .addSelect('transaction.isIntraday', 'isIntraday')
        .addSelect('SUM(transaction.quantityLeft)', 'quantityLeft')
        .addSelect('transaction.transactionStatus', 'transactionStatus')
        .addSelect(
          'SUM(transaction.buyPrice * transaction.quantityLeft)',
          'buyPriceAvg'
        )
        .addSelect(
          'SUM(transaction.sellPrice * transaction.quantityLeft)',
          'sellPriceAvg'
        )
        .where({
          user: { id: this.userId },
          transactionStatus: In(['open']),
          scriptName: scriptName,
        })
        .groupBy('transaction.scriptName')
        .addGroupBy('transaction.isIntraday')
        .addGroupBy('transaction.tradeType')
        .addGroupBy('transaction.transactionStatus')
        .getRawMany();
      return openOrders;
    } else {
      const openOrders = await this.tmanager
        .createQueryBuilder(m_transaction, 'transaction')
        .select('transaction.scriptName', 'scriptName')
        .addSelect('transaction.tradeType', 'tradeType')
        .addSelect('transaction.isIntraday', 'isIntraday')
        .addSelect('SUM(transaction.quantityLeft)', 'quantityLeft')
        .addSelect('transaction.transactionStatus', 'transactionStatus')
        .addSelect(
          'SUM(transaction.buyPrice * transaction.quantityLeft)',
          'buyPriceAvg'
        )
        .addSelect(
          'SUM(transaction.sellPrice * transaction.quantityLeft)',
          'sellPriceAvg'
        )
        .where({
          user: { id: this.userId },
          transactionStatus: In(['open']),
          scriptName: scriptName,
        })
        .groupBy('transaction.scriptName')
        .addGroupBy('transaction.isIntraday')
        .addGroupBy('transaction.tradeType')
        .addGroupBy('transaction.transactionStatus')
        .getRawMany();
      return openOrders;
    }
  }

  async getOpenAndPendingOrdersByScript({
    scriptName,
  }: {
    scriptName: string;
  }) {
    if (this.tmanager == null) {
      const openOrders = await m_transaction
        .createQueryBuilder('transaction')
        .select('transaction.scriptName', 'scriptName')
        .addSelect('transaction.tradeType', 'tradeType')
        .addSelect('SUM(transaction.quantityLeft)', 'quantityLeft')
        .addSelect('transaction.transactionStatus', 'transactionStatus')
        .where({
          user: { id: this.userId },
          transactionStatus: In(['open', 'pending']),
          scriptName: scriptName,
        })
        .groupBy('transaction.scriptName')
        .addGroupBy('transaction.tradeType')
        .addGroupBy('transaction.transactionStatus')
        .getRawMany();
      return openOrders;
    } else {
      const openOrders = await this.tmanager
        .createQueryBuilder(m_transaction, 'transaction')
        .select('transaction.scriptName', 'scriptName')
        .addSelect('transaction.tradeType', 'tradeType')
        .addSelect('SUM(transaction.quantityLeft)', 'quantityLeft')
        .addSelect('transaction.transactionStatus', 'transactionStatus')
        .where({
          user: { id: this.userId },
          transactionStatus: In(['open', 'pending']),
          scriptName: scriptName,
        })
        .groupBy('transaction.scriptName')
        .addGroupBy('transaction.tradeType')
        .addGroupBy('transaction.transactionStatus')
        .getRawMany();
      return openOrders;
    }
  }

  async getOpenOrdersByTradingSymbol(symbol: string, isIntraday: boolean) {
    return await m_transaction.find({
      where: {
        scriptName: symbol,
        transactionStatus: 'open',
        isIntraday,
        user: { id: this.userId },
      },
    });
  }

  async getAllOpenOrders({ exchange }: { exchange: string | string[] }) {
    const openOrders = await m_transaction
      .createQueryBuilder('transaction')
      .select('transaction.scriptName', 'scriptName')
      .addSelect('transaction.tradeType', 'tradeType')
      .addSelect('transaction.lotSize', 'lotSize')
      .addSelect('transaction.buyPrice', 'buyPrice')
      .addSelect('transaction.sellPrice', 'sellPrice')
      .addSelect('transaction.exchange', 'exchange')
      .addSelect('transaction.transactionStatus', 'transactionStatus')
      .addSelect('SUM(transaction.quantityLeft)', 'quantityLeft')
      .addSelect('SUM(transaction.quantity)', 'quantity')
      .where({
        user: { id: this.userId },
        transactionStatus: In(['open', 'pending']),
        exchange: typeof exchange == 'object' ? In(exchange) : exchange,
      })
      .groupBy('transaction.scriptName')
      .addGroupBy('transaction.tradeType')
      .addGroupBy('transaction.lotSize')
      .addGroupBy('transaction.transactionStatus')
      .addGroupBy('transaction.buyPrice')
      .addGroupBy('transaction.exchange')
      .addGroupBy('transaction.sellPrice')
      .getRawMany();
    return openOrders;
  }

  async getPositions() {
    let orders: any = await m_transaction.find({
      where: {
        user: { id: this.userId },
        transactionStatus: 'open',
      },
      order: {
        orderCreationDate: 'ASC',
      },
    });

    let redisKeys = [];
    if (orders.length > 0) {
      redisKeys = orders.map((order) => {
        return `live-${order.exchange == 'NSE' ? 'NFO' : order.exchange}:${
          order.scriptName
        }`;
      });
    }

    console.log('keys are ', redisKeys);
    let data = await this.getRedisPositions(redisKeys);
    console.log('data from redis is ', data);
    orders = orders.map((order, index) => {
      let checkData: any = data[index];

      if (checkData) {
        checkData = JSON.parse(checkData);
        return {
          ...order,
          currentSellPrice:
            checkData.sellPrice == '0.00' ? checkData.ltp : checkData.sellPrice,
          currentBuyPrice:
            checkData.buyPrice == '0.00' ? checkData.ltp : checkData.buyPrice,
        };
      } else {
        return order;
      }
    });

    return orders;
  }

  async getRedisPositions(redisKeys) {
    try {
      let data = await this.redisClient.mGet(redisKeys);
      return data;
    } catch (e) {
      return [];
    }
  }

  async createOrder({
    buyPrice,
    sellPrice,
    quantity,
    margin,
    brokerage,
    tradeType,
    transactionStatus,
    lotSize,
    parentId = null,
    orderCreationDate,
    orderExecutionDate,
    isIntraday,
    marginChargedType,
    marginChargedRate,
    brokerageChargedType,
    brokerageChargedRate,
    tradeRemarks,
  }: {
    buyPrice: number;
    sellPrice: number;
    quantity: number;
    margin: number;
    brokerage: number;
    tradeType: string;
    transactionStatus: string;
    lotSize: number;
    parentId?: number;
    orderCreationDate: Date;
    orderExecutionDate: Date;
    isIntraday: boolean;
    marginChargedType: string;
    marginChargedRate: number;
    brokerageChargedType: string;
    brokerageChargedRate: number;
    tradeRemarks: string;
  }) {
    if (this.tmanager == null) {
      const order = m_transaction.create({
        user: { id: this.userId },
        scriptName: this.scriptName,
        orderType: this.orderType,
        quantity,
        margin,
        brokerage,
        exchange: this.exchange,
        quantityLeft: quantity,
        lotSize,
        orderCreationDate,
        tradeType: tradeType,
        buyPrice: buyPrice,
        sellPrice,
        transactionStatus: transactionStatus,
        orderExecutionDate,
        isIntraday,
        marginChargedType,
        marginChargedRate,
        brokerageChargedType,
        brokerageChargedRate,
        tradeRemarks,
        parent: {
          id: parentId,
        },
      });
      await order.save();
    } else {
      const order = this.tmanager.create(m_transaction, {
        user: { id: this.userId },
        scriptName: this.scriptName,
        orderType: this.orderType,
        quantity,
        margin,
        brokerage,
        exchange: this.exchange,
        quantityLeft: quantity,
        lotSize,
        orderCreationDate,
        tradeType: tradeType,
        buyPrice: buyPrice,
        sellPrice,
        transactionStatus: transactionStatus,
        orderExecutionDate,
        isIntraday,
        marginChargedType,
        marginChargedRate,
        brokerageChargedType,
        brokerageChargedRate,
        tradeRemarks,
        parent: {
          id: parentId,
        },
      });
      await this.tmanager.save(order);
      return order.id;
    }
  }

  async createMultipleOrders(
    data: {
      buyPrice: number;
      sellPrice: number;
      quantity: number;
      quantityLeft: number;
      margin: number;
      brokerage: number;
      tradeType: string;
      lotSize: number;
      transactionStatus: string;
      parentId?: number;
      orderCreationDate: Date;
      orderExecutionDate: Date;
      isIntraday: boolean;
      marginChargedType: string;
      marginChargedRate: number;
      brokerageChargedType: string;
      brokerageChargedRate: number;
      tradeRemarks: string;
      orderId?: number | null;
    }[]
  ) {
    if (this.tmanager == null) {
      throw new Error('Transaction manager not set');
    } else {
      const res = await this.tmanager
        .createQueryBuilder()
        .insert()
        .into(m_transaction)
        .values(
          data.map((d) => ({
            exchange: this.exchange,
            scriptName: this.scriptName,
            buyPrice: d.buyPrice,
            sellPrice: d.sellPrice,
            quantity: d.quantity,
            quantityLeft: d.quantityLeft,
            margin: d.margin,
            brokerage: d.brokerage,
            transactionStatus: d.transactionStatus,
            lotSize: d.lotSize,
            tradeType: d.tradeType,
            parent: {
              id: d.parentId ? d.parentId : null,
            },
            orderCreationDate: d.orderCreationDate,
            orderExecutionDate: d.orderExecutionDate,
            isIntraday: d.isIntraday,
            marginChargedType: d.marginChargedType,
            marginChargedRate: d.marginChargedRate,
            brokerageChargedType: d.brokerageChargedType,
            brokerageChargedRate: d.brokerageChargedRate,
            tradeRemarks: d.tradeRemarks,
            user: { id: this.userId },
            orderType: this.orderType,
            order: {
              id: d.orderId,
            },
          }))
        )
        .execute();

      // console.log('res is ', res);
      return res.identifiers;
    }
  }

  async editOrderById(
    orderId: number,
    buyPrice: number | null,
    sellPrice: number | null,
    quantity: number,
    margin: number,
    brokerage: number
  ) {
    this.tmanager.update(
      m_transaction,
      { id: orderId },
      {
        quantity: quantity,
        quantityLeft: quantity,
        margin,
        brokerage,
        buyPrice,
        sellPrice,
      }
    );

    return;
  }

  async updateOrder({
    id,
    quantityLeft,
    transactionStatus,
    buyPrice,
    sellPrice,
    brokerage,
    margin,
    isIntraday,
    quantity,
  }: {
    id: number;
    quantityLeft?: number | null;
    transactionStatus?: string | null;
    sellPrice?: number | null;
    buyPrice?: number | null;
    brokerage?: number | null;
    margin?: number | null;
    isIntraday?: boolean | null;
    quantity?: number | null;
  }) {
    let dataToUpdate = {};

    if (buyPrice) {
      dataToUpdate['buyPrice'] = buyPrice;
    }
    if (sellPrice) {
      dataToUpdate['sellPrice'] = sellPrice;
    }
    if (brokerage) {
      dataToUpdate['brokerage'] = brokerage;
    }
    if (margin) {
      dataToUpdate['margin'] = margin;
    }
    if (quantityLeft) {
      dataToUpdate['quantityLeft'] = quantityLeft;
    }
    if (quantity) {
      dataToUpdate['quantity'] = quantity;
    }
    if (transactionStatus) {
      dataToUpdate['transactionStatus'] = transactionStatus;
    }
    if (isIntraday) {
      dataToUpdate['isIntraday'] = isIntraday;
    }

    await this.tmanager.update(m_transaction, { id }, dataToUpdate);
  }

  async limitBulkStatusUpdate(orderIds: number[]) {
    await this.tmanager.update(
      m_transaction,
      { id: In(orderIds) },
      {
        transactionStatus: 'executed',
        quantityLeft: 0,
        orderExecutionDate: moment().utc().toDate(),
      }
    );
    return;
  }

  async getAllChildOrders(parentOrderId: number) {
    return await this.tmanager.find(m_transaction, {
      where: { parent: { id: parentOrderId } },
    });
  }

  async deleteMultipleOrders(orderIds: number[]) {
    return await this.tmanager.update(
      m_transaction,

      { id: In(orderIds) },
      { transactionStatus: 'deleted' }
    );
  }

  //settlement bulk functions

  async getAllPendingOrders(exchange: 'NSE' | 'MCX') {
    let pendingOrders = await this.tmanager.find(m_transaction, {
      where: { transactionStatus: 'pending', exchange: exchange },
      relations: { user: true, order: true },
    });
    return pendingOrders;
  }

  async getAllIntradayOpenOrders(exchange: 'NSE' | 'MCX') {
    let intradayOrders = await this.tmanager.find(m_transaction, {
      where: {
        transactionStatus: 'open',
        exchange: exchange,
        isIntraday: true,
      },

      relations: { user: true, order: true },
    });
    return intradayOrders;
  }

  async cancelAllPendingOrders(orderIds: number[]) {
    await this.tmanager.update(
      m_transaction,
      { id: In(orderIds) },
      { transactionStatus: 'cancelled' }
    );
    return;
  }

  async getAllNormalOpenOrders(exchange: 'NSE' | 'MCX') {
    let normalOrders = await this.tmanager.find(m_transaction, {
      where: {
        transactionStatus: 'open',
        exchange: exchange,
        isIntraday: false,
      },
      relations: { user: true },
      select: {
        user: {
          id: true,
        },
      },
    });
    return normalOrders;
  }

  async closeOrder(orderId: number) {
    await this.tmanager.update(
      m_transaction,
      { id: orderId },
      { transactionStatus: 'closed' }
    );
    return;
  }

  async getExpiringOrders(exchange: string) {
    let instruments = new Instruments();
    let instrumentsData = await instruments.getAllInstruments();
    let expiringScripts = [];
    instrumentsData.map((item) => {
      if (moment().utc().diff(moment(item.expiry).toDate(), 'd') == 0) {
        expiringScripts.push(item.tradingsymbol);
      }
    });

    console.log('expiring scripts ', expiringScripts);

    let orders = await m_transaction.find({
      where: {
        transactionStatus: 'open',
        scriptName: In(expiringScripts),
        exchange: exchange,
      },
      relations: { user: true },
      select: {
        user: {
          id: true,
        },
      },
    });

    return orders;
  }

  async getOpenOrdersByNameAndDate(scriptName: string, date: Date) {
    let ordersData = await m_transaction.find({
      where: {
        orderCreationDate: LessThan(date),
        scriptName: ILike(`${scriptName}%`),
        transactionStatus: 'open',
      },
      relations: {
        user: true,
      },
      select: {
        quantityLeft: true,
        id: true,
        user: {
          id: true,
          username: true,
        },
      },
    });
    return ordersData;
  }
}

export default Trade;
