import moment from 'moment';
import {
  EntityManager,
  In,
  MoreThanOrEqual,
  ILike,
  LessThanOrEqual,
  And,
} from 'typeorm';
import ProjectSetting from '../project-settings';
import {
  m_transaction,
  t_settlementlogs,
  t_usertransactionledger,
} from 'database/sql/schema';
import redisClient, { RedisClientType } from 'lib/redis';
import { AppDataSource } from 'database/sql';

class Ledger {
  userId: number | null = null;
  tmanager: EntityManager | null = null;
  redisClient: RedisClientType = null;
  constructor({
    userId,
    redisClient,
  }: {
    userId: number;
    redisClient: RedisClientType;
  }) {
    this.userId = userId;
    this.redisClient = redisClient;
  }

  public setTransactionManager(tmanager: EntityManager) {
    this.tmanager = tmanager;
  }

  public async addLedgerEntry(data: {
    transactionAmount: number;
    transactionParticularId: number;
    transactionTypeId: number;
    transactionRemarks: string;
  }) {
    if (!this.userId) {
      throw new Error('Please pass user id');
    }
    let newTransaction = await this.tmanager.save(t_usertransactionledger, {
      createdBy: {
        id: this.userId,
      },
      transactionParticular: { id: data.transactionParticularId },
      transactionDate: moment().toDate(),
      transactionRemarks: data.transactionRemarks,
      transactionType: { id: data.transactionTypeId },
      user: {
        id: this.userId,
      },
      transactionAmount: data.transactionAmount,
    });
    await this.updateBalanceRedis();
    return newTransaction;
  }

  public async getCreditBalance() {
    const now = moment();
    const startOfCurrentWeek = now.startOf('week').startOf('day'); // Assuming Sunday is the start of the week
    let projectSetting = new ProjectSetting(['TRXNTYP']);
    let [debitConstant, creditConstant] = await Promise.all([
      projectSetting.getProjectSettingByKeyAndConstant('TRXNTYP', 'Debit'),
      projectSetting.getProjectSettingByKeyAndConstant('TRXNTYP', 'Credit'),
    ]);

    let result;

    if (this.tmanager) {
      result = await this.tmanager
        .createQueryBuilder()
        .select(
          'SUM(CASE WHEN t.transactionType.id = :credit AND t.transactionDate >= :startOfWeek THEN t.transactionAmount ELSE 0 END) - SUM(CASE WHEN t.transactionType.id = :debit AND t.transactionDate >= :startOfWeek THEN t.transactionAmount ELSE 0 END)',
          'balance'
        )
        .from('t_usertransactionledger', 't')
        .where({ user: { id: this.userId } })
        .setParameter('debit', debitConstant.id)
        .setParameter('credit', creditConstant.id)
        .setParameter('startOfWeek', startOfCurrentWeek.toDate())
        .getRawOne();
    } else {
      result = await AppDataSource.createQueryBuilder()
        .select(
          'SUM(CASE WHEN t.transactionType.id = :credit AND t.transactionDate >= :startOfWeek THEN t.transactionAmount ELSE 0 END) - SUM(CASE WHEN t.transactionType.id = :debit AND t.transactionDate >= :startOfWeek THEN t.transactionAmount ELSE 0 END)',
          'balance'
        )
        .from('t_usertransactionledger', 't')
        .where({ user: { id: this.userId } })
        .setParameter('debit', debitConstant.id)
        .setParameter('credit', creditConstant.id)
        .setParameter('startOfWeek', startOfCurrentWeek.toDate())
        .getRawOne();
    }
    return parseFloat(result.balance) || 0;
  }

  public async updateBalanceRedis() {
    let balance = await this.getCreditBalance();
    console.log('updated balance is ', balance);
    await this.redisClient
      .multi()
      .hSet(`margin-user-${this.userId}`, 'margin', balance)
      .exec();
    return;
  }

  public async creditBalance({
    amount,
    currUserId,
    transactionParticularId,
    transactionRemarks,
    orderId = null,
  }: {
    amount: number;
    transactionParticularId: number;
    currUserId: number;
    transactionRemarks: string;
    orderId?: number | null;
  }) {
    if (!this.userId) {
      throw new Error('Please pass user id');
    }
    if (!this.tmanager) {
      throw new Error('Please pass transaction manager');
    }
    let projectSetting = new ProjectSetting([]);
    let creditConstant = await projectSetting.getProjectSettingByKeyAndConstant(
      'TRXNTYP',
      'Credit'
    );

    let newTransaction = await this.tmanager.save(t_usertransactionledger, {
      createdBy: {
        id: currUserId,
      },
      transactionParticular: { id: transactionParticularId },
      transactionDate: moment().toDate(),
      transactionRemarks: transactionRemarks,
      transactionType: { id: creditConstant.id },
      user: {
        id: this.userId,
      },
      transactionAmount: amount,
      order: {
        id: orderId,
      },
    });
    await this.updateBalanceRedis();
    return newTransaction;
  }

  public async debitBalance({
    amount,
    currUserId,
    transactionParticularId,
    transactionRemarks,
    orderId = null,
  }: {
    amount: number;
    transactionParticularId: number;
    currUserId: number;
    transactionRemarks: string;
    orderId?: number | null;
  }) {
    if (!this.userId) {
      throw new Error('Please pass user id');
    }
    if (!this.tmanager) {
      throw new Error('Please pass transaction manager');
    }

    let currentBalance = await this.getCreditBalance();
    console.log('current balance is ', currentBalance, amount);
    // if (Number(currentBalance) < amount) {
    //   throw new Error('Margin not available');
    // }

    let projectSetting = new ProjectSetting([]);
    let creditConstant = await projectSetting.getProjectSettingByKeyAndConstant(
      'TRXNTYP',
      'Debit'
    );

    let newTransaction = await this.tmanager.save(t_usertransactionledger, {
      createdBy: {
        id: currUserId,
      },
      transactionParticular: { id: transactionParticularId },
      transactionDate: moment().toDate(),
      transactionRemarks: transactionRemarks,
      transactionType: { id: creditConstant.id },
      user: {
        id: this.userId,
      },
      transactionAmount: amount,
      order: {
        id: orderId,
      },
    });
    await this.updateBalanceRedis();
    return newTransaction;
  }

  public async multipleCreditBalance(
    data: {
      amount: number;
      transactionParticularId: number;
      currUserId: number;
      transactionRemarks: string;
      orderId?: number | null;
    }[]
  ) {
    if (!this.userId) {
      throw new Error('Please pass user id');
    }
    if (!this.tmanager) {
      throw new Error('Please pass transaction manager');
    }
    let projectSetting = new ProjectSetting([]);
    let creditConstant = await projectSetting.getProjectSettingByKeyAndConstant(
      'TRXNTYP',
      'Credit'
    );

    let newTransaction = await this.tmanager.save(
      t_usertransactionledger,
      data.map((item) => {
        return {
          createdBy: {
            id: item.currUserId,
          },
          transactionParticular: { id: item.transactionParticularId },
          transactionDate: moment().toDate(),
          transactionRemarks: item.transactionRemarks,
          transactionType: { id: creditConstant.id },
          user: {
            id: this.userId,
          },
          transactionAmount: item.amount,
          order: {
            id: item.orderId,
          },
        };
      })
    );
    await this.updateBalanceRedis();
    return newTransaction;
  }

  public async multipleDebitBalance(
    data: {
      amount: number;
      transactionParticularId: number;
      currUserId: number;
      transactionRemarks: string;
      orderId?: number | null;
    }[]
  ) {
    if (!this.userId) {
      throw new Error('Please pass user id');
    }
    if (!this.tmanager) {
      throw new Error('Please pass transaction manager');
    }
    let currentBalance = await this.getCreditBalance();
    console.log('current balance is ', currentBalance, data);
    // if (Number(currentBalance) < data.reduce((a, b) => a + b.amount, 0)) {
    //   throw new Error('Margin not available');
    // }

    let projectSetting = new ProjectSetting([]);
    let creditConstant = await projectSetting.getProjectSettingByKeyAndConstant(
      'TRXNTYP',
      'Debit'
    );

    let newTransaction = await this.tmanager.save(
      t_usertransactionledger,
      data.map((item) => {
        return {
          createdBy: {
            id: item.currUserId,
          },
          transactionParticular: { id: item.transactionParticularId },
          transactionDate: moment().toDate(),
          transactionRemarks: item.transactionRemarks,
          transactionType: { id: creditConstant.id },
          user: {
            id: this.userId,
          },
          transactionAmount: item.amount,
          order: {
            id: item.orderId,
          },
        };
      })
    );
    await this.updateBalanceRedis();
    return newTransaction;
  }

  public async getLedgerByOrderId({ orderId }: { orderId: number }) {
    let data = await this.tmanager.find(t_usertransactionledger, {
      where: { order: { id: orderId } },
    });

    return data;
  }

  public async getLedgerByOrderIdAndParticular({
    orderId,
    particularName,
  }: {
    orderId: number;
    particularName: string;
  }) {
    let data = await t_usertransactionledger.findOne({
      where: {
        order: { id: orderId },
        transactionParticular: {
          prjSettConstant: particularName,
        },
      },
      relations: {
        transactionParticular: true,
        transactionType: true,
      },
    });

    return data;
  }

  public async updateLedgerOrderId({
    orderId,
    ledgerId,
  }: {
    orderId: number;
    ledgerId: number;
  }) {
    let data = await this.tmanager.update(
      t_usertransactionledger,
      { id: ledgerId },
      { order: { id: orderId } }
    );
    return data;
  }

  public async getLedgerByTxnId({ txnId }: { txnId: number }) {
    let data = await this.tmanager.findOne(t_usertransactionledger, {
      where: { id: txnId },
    });

    return data;
  }

  public async getOpeningBalance() {
    const now = moment();
    // Set Sunday as the first day of the week
    const startOfCurrentWeek = now.clone().startOf('week');
    const endOfCurrentWeek = now.clone().endOf('week');

    let projectSetting = new ProjectSetting(['TRXNTYP']);
    let [creditConstant, particular] = await Promise.all([
      projectSetting.getProjectSettingByKeyAndConstant('TRXNTYP', 'Credit'),
      projectSetting.getProjectSettingByKeyAndConstant(
        'TRXNPRT',
        'Opening Balance'
      ),
    ]);

    const result = await AppDataSource.createQueryBuilder()
      .select(
        'SUM(CASE WHEN t.transactionType.id = :credit AND t.transactionParticular.id = :particular AND t.transactionDate >= :startOfWeek AND t.transactionDate <= :endOfWeek THEN t.transactionAmount ELSE 0 END)',
        'openingBalance'
      )
      .from('t_usertransactionledger', 't')
      .where({ user: { id: this.userId } })
      .setParameter('credit', creditConstant.id)
      .setParameter('particular', particular.id)
      .setParameter('startOfWeek', startOfCurrentWeek.toDate())
      .setParameter('endOfWeek', endOfCurrentWeek.toDate())
      .groupBy('t.userId') // Assuming you want to group by user, adjust as needed
      .orderBy('MIN(t.transactionDate)', 'ASC') // Get the earliest transaction date
      .getRawOne();
    return parseFloat((result && result.openingBalance) || '0') || 0;
  }

  public async getRealizedPL() {
    const now = moment();

    // Set Sunday as the first day of the week
    const startOfCurrentWeek = now.clone().startOf('week');
    const endOfCurrentWeek = now.clone().endOf('week');

    let projectSetting = new ProjectSetting(['TRXNTYP']);
    let [profit, loss] = await Promise.all([
      projectSetting.getProjectSettingByKeyAndConstant(
        'TRXNPRT',
        'Trade Profit'
      ),
      projectSetting.getProjectSettingByKeyAndConstant('TRXNPRT', 'Trade Loss'),
    ]);

    const result = await AppDataSource.createQueryBuilder()
      .select(
        'SUM(CASE WHEN t.transactionParticular.id = :creditParticularId AND t.transactionDate >= :startOfWeek AND t.transactionDate <= :endOfWeek THEN t.transactionAmount ELSE 0 END)' +
          ' - ' +
          'SUM(CASE WHEN t.transactionParticular.id = :debitParticularId AND t.transactionDate >= :startOfWeek AND t.transactionDate <= :endOfWeek THEN t.transactionAmount ELSE 0 END)',
        'realizedPL'
      )
      .from('t_usertransactionledger', 't')
      .where({ user: { id: this.userId } })
      .setParameter('creditParticularId', profit.id) // Replace with your specific particularIds
      .setParameter('debitParticularId', loss.id) // Replace with your specific particularIds
      .setParameter('startOfWeek', startOfCurrentWeek.toDate())
      .setParameter('endOfWeek', endOfCurrentWeek.toDate())
      .getRawOne();
    return parseFloat(result.realizedPL) || 0;
  }

  public async deleteLedgerByOrderId(orderId: number) {
    await this.tmanager.softDelete(t_usertransactionledger, {
      order: { id: orderId },
    });
    await this.updateBalanceRedis();
    return;
  }

  public async deleteLedgerById(ledgerId: number) {
    await this.tmanager.softDelete(t_usertransactionledger, {
      id: ledgerId,
    });
    await this.updateBalanceRedis();
    return;
  }

  public async getBrokerageSum() {
    const now = moment();
    const startOfCurrentWeek = now.startOf('week'); // Assuming Monday is the start of the week
    console.log('start of week ', startOfCurrentWeek);
    let projectSetting = new ProjectSetting(['TRXNTYP']);
    let [debitConstant, particular] = await Promise.all([
      projectSetting.getProjectSettingByKeyAndConstant('TRXNTYP', 'Debit'),
      projectSetting.getProjectSettingByKeyAndConstant(
        'TRXNPRT',
        'Brokerage Collected'
      ),
    ]);

    console.log('debit constant ', debitConstant, ' particular ', particular);
    let result;
    if (this.tmanager) {
      result = await this.tmanager
        .createQueryBuilder()
        .select(
          'SUM(CASE WHEN t.transactionType.id = :debit AND t.transactionDate >= :startOfWeek AND t.transactionParticular.id = :particular THEN t.transactionAmount ELSE 0 END)',
          'balance'
        )
        .from('t_usertransactionledger', 't')
        .where({ user: { id: this.userId } })
        .setParameter('debit', debitConstant.id)
        .setParameter('particular', particular.id)
        .setParameter('startOfWeek', startOfCurrentWeek.toDate())
        .getRawOne();
    } else {
      result = await AppDataSource.createQueryBuilder()
        .select(
          'SUM(CASE WHEN t.transactionType.id = :debit AND t.transactionDate >= :startOfWeek AND t.transactionParticular.id = :particular THEN t.transactionAmount ELSE 0 END)',
          'balance'
        )
        .from('t_usertransactionledger', 't')
        .where({ user: { id: this.userId } })
        .setParameter('debit', debitConstant.id)
        .setParameter('particular', particular.id)
        .setParameter('startOfWeek', startOfCurrentWeek.toDate())
        .getRawOne();
    }
    return parseFloat(result.balance) || 0;
  }

  public async getUnrealizedPL() {
    let user_margin = redisClient.hGetAll(`margin-user-${this.userId}`);
    let PL = 0;
    if (Object.keys(user_margin).length > 0) {
      Object.keys(user_margin).map((key) => {
        if (key.endsWith('-PL')) {
          let instrumentToken = key.split('-')[0];
          if (
            typeof user_margin[`${key}`] == 'string' &&
            user_margin[`${instrumentToken}-T`] &&
            user_margin[`${instrumentToken}-P`] &&
            user_margin[`${instrumentToken}-Q`]
          ) {
            let value = Number(user_margin[`${key}`]);
            PL = PL + value;
          }
        }
      });
    }
    return PL;
  }

  public async getMarginHold() {
    const now = moment();
    const startOfCurrentWeek = now.startOf('week').startOf('day');
    let projectSetting = new ProjectSetting(['TRXNPRT']);
    let marginHoldKey = await projectSetting.getProjectSettingByKeyAndConstant(
      'TRXNPRT',
      'Margin Hold'
    );

    let transactionData = await t_usertransactionledger.find({
      where: {
        user: { id: this.userId },
        createdAt: MoreThanOrEqual(startOfCurrentWeek.toDate()),
        transactionParticular: { id: marginHoldKey.id },
      },
      relations: {
        order: true,
      },
      select: {
        transactionAmount: true,
        order: {
          isIntraday: true,
        },
      },
    });

    let intradayHold = transactionData
      .filter((a) => a.order.isIntraday == true)
      .reduce((total, obj) => Number(obj.transactionAmount) + total, 0);

    let normalHold = transactionData
      .filter((a) => a.order.isIntraday == false)
      .reduce((total, obj) => Number(obj.transactionAmount) + total, 0);

    return { normalHold, intradayHold };
  }

  public async getMarginReleased() {
    const now = moment();
    const startOfCurrentWeek = now.startOf('week').startOf('day');
    let projectSetting = new ProjectSetting(['TRXNPRT']);
    let marginHoldKey = await projectSetting.getProjectSettingByKeyAndConstant(
      'TRXNPRT',
      'Margin Released'
    );

    let transactionData = await t_usertransactionledger.find({
      where: {
        user: { id: this.userId },
        createdAt: MoreThanOrEqual(startOfCurrentWeek.toDate()),
        transactionParticular: { id: marginHoldKey.id },
      },
      relations: {
        order: true,
      },
      select: {
        transactionAmount: true,
        order: {
          isIntraday: true,
        },
      },
    });

    let intradayReleased = transactionData
      .filter((a) => a.order.isIntraday == true)
      .reduce((total, obj) => Number(obj.transactionAmount) + total, 0);

    let normalReleased = transactionData
      .filter((a) => a.order.isIntraday == false)
      .reduce((total, obj) => Number(obj.transactionAmount) + total, 0);

    return { normalReleased, intradayReleased };
  }

  public async deleteLedgerByOrderIds(orderIds: number[]) {
    await this.tmanager.softDelete(t_usertransactionledger, {
      order: { id: In(orderIds) },
    });
    await this.updateBalanceRedis();
    return;
  }

  public async getMultipleLedgerByOrderIdAndParticular(
    orderIds: number[],
    particularConstant: string
  ) {
    let ledgerData = await t_usertransactionledger.find({
      where: {
        order: { id: In(orderIds) },
        transactionParticular: { prjSettConstant: particularConstant },
      },
      relations: {
        order: true,
        user: true,
      },
      select: {
        order: {
          id: true,
        },
        user: {
          id: true,
        },
      },
    });

    return ledgerData;
  }

  public async createMultipleUserLedger(ledgerData) {
    await this.tmanager.insert(t_usertransactionledger, ledgerData);
    return;
  }

  public async deleteLedgerByOrderAndParticular(
    orderId: number,
    particularId: number
  ) {
    await this.tmanager.softDelete(t_usertransactionledger, {
      order: { id: orderId },
      transactionParticular: { id: particularId },
    });
    return;
  }

  public async getBrokerageAndPlRecords(userId: number) {
    let projectSetting = new ProjectSetting();
    let [brokerageCollectedKey, profitKey, lossKey] = await Promise.all([
      projectSetting.getProjectSettingByKeyAndConstant(
        'TRXNPRT',
        'Brokerage Collected'
      ),
      projectSetting.getProjectSettingByKeyAndConstant(
        'TRXNPRT',
        'Trade Profit'
      ),
      projectSetting.getProjectSettingByKeyAndConstant('TRXNPRT', 'Trade Loss'),
    ]);

    let ledgerRecords = await this.tmanager.find(t_usertransactionledger, {
      where: {
        transactionParticular: {
          id: In([brokerageCollectedKey.id, profitKey.id, lossKey.id]),
        },
        user: {
          id: userId,
        },
        isSettled: false,
        createdAt: And(
          MoreThanOrEqual(
            moment().subtract(1, 'week').startOf('week').utc().toDate()
          ),
          LessThanOrEqual(
            moment().subtract(1, 'week').endOf('week').utc().toDate()
          )
        ),
      },
      relations: {
        order: true,
        transactionParticular: true,
      },
      select: {
        transactionParticular: {
          prjSettConstant: true,
          id: true,
        },
      },
    });

    return ledgerRecords;
  }

  public async bulkCreditRecords(data) {
    let projectSetting = new ProjectSetting([]);
    let creditConstant = await projectSetting.getProjectSettingByKeyAndConstant(
      'TRXNTYP',
      'Credit'
    );

    let newTransaction = await this.tmanager.save(
      t_usertransactionledger,
      data.map((item) => {
        return {
          createdBy: {
            id: item.userId,
          },
          transactionParticular: { id: item.transactionParticularId },
          transactionDate: moment().toDate(),
          transactionRemarks: item.transactionRemarks,
          transactionType: { id: creditConstant.id },
          user: {
            id: item.userId,
          },
          transactionAmount: item.amount,
          order: {
            id: item.orderId,
          },
        };
      })
    );
    return;
  }

  public async bulkDebitRecords(data) {
    let projectSetting = new ProjectSetting([]);
    let debitConstant = await projectSetting.getProjectSettingByKeyAndConstant(
      'TRXNTYP',
      'Debit'
    );

    let newTransaction = await this.tmanager.save(
      t_usertransactionledger,
      data.map((item) => {
        return {
          createdBy: {
            id: item.userId,
          },
          transactionParticular: { id: item.transactionParticularId },
          transactionDate: moment().toDate(),
          transactionRemarks: item.transactionRemarks,
          transactionType: { id: debitConstant.id },
          user: {
            id: item.userId,
          },
          transactionAmount: item.amount,
          order: {
            id: item.orderId,
          },
        };
      })
    );
    return;
  }

  public async getHierarchyTransactions(
    userType: string,
    pageNumber: number,
    pageSize: number,
    username: string
  ) {
    let filter = {};

    switch (userType) {
      case 'Company':
        filter['company'] = { id: this.userId };
        filter['username'] = ILike(`${username}`);
        break;

      case 'Master':
        filter['master'] = { id: this.userId };
        filter['username'] = ILike(`${username}`);
        break;

      case 'Broker':
        filter['broker'] = { id: this.userId };
        filter['username'] = ILike(`${username}`);
        break;

      case 'Sub-Broker':
        filter['subBroker'] = { id: this.userId };
        filter['username'] = ILike(`${username}`);
        break;
    }

    console.log('filter ', filter);
    let [transactions, count] = await t_usertransactionledger.findAndCount({
      where: [{ user: filter }],
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      relations: {
        order: true,
        user: true,
        transactionParticular: true,
        transactionType: true,
      },
      select: {
        order: {
          scriptName: true,
          id: true,
          quantity: true,
        },
        user: {
          username: true,
          id: true,
        },
        transactionParticular: {
          prjSettConstant: true,
          id: true,
        },
        transactionType: {
          prjSettConstant: true,
          id: true,
        },
      },
    });

    return { transactions, count };
  }

  public async getDepositAndWithdrawal() {
    const now = moment();
    const startOfCurrentWeek = now.startOf('week').startOf('day');
    let projectSetting = new ProjectSetting(['TRXNPRT']);
    let [subsequentWithdrawal, subsequentDeposit] = await Promise.all([
      projectSetting.getProjectSettingByKeyAndConstant(
        'TRXNPRT',
        'Subsequent Withdrawal'
      ),
      projectSetting.getProjectSettingByKeyAndConstant(
        'TRXNPRT',
        'Subsequent Deposit'
      ),
    ]);

    let transactionData = await t_usertransactionledger.find({
      where: {
        user: { id: this.userId },
        createdAt: MoreThanOrEqual(startOfCurrentWeek.toDate()),
        transactionParticular: {
          id: In([subsequentDeposit.id, subsequentWithdrawal.id]),
        },
      },
      relations: {
        transactionParticular: true,
      },
      select: {
        transactionAmount: true,
        transactionParticular: {
          prjSettConstant: true,
        },
      },
    });

    let withdrawal = transactionData
      .filter(
        (a) =>
          a.transactionParticular.prjSettConstant == 'Subsequent Withdrawal'
      )
      .reduce((total, obj) => Number(obj.transactionAmount) + total, 0);

    let deposit = transactionData
      .filter(
        (a) => a.transactionParticular.prjSettConstant == 'Subsequent Deposit'
      )
      .reduce((total, obj) => Number(obj.transactionAmount) + total, 0);

    return { withdrawal, deposit };
  }

  public async createSettlementLog(
    startDate: Date,
    endDate: Date,
    amountDetails: {
      company: number;
      master: number;
      broker: number;
      subBroker: number;
      client: number;
    },
    transactionParticularId: number
  ) {
    // If not, create a new log entry
    await this.tmanager.save(t_settlementlogs, {
      user: { id: this.userId },
      startDate: startDate,
      endDate: endDate,
      transactionParticular: { id: transactionParticularId },
      totalAmount: amountDetails.client,
      brokerAmount: amountDetails.broker,
      companyAmount: amountDetails.company,
      masterAmount: amountDetails.master,
      subBrokerAmount: amountDetails.subBroker,
    });

    return;
  }

  public async updateSettlementStatus(ledgerIds: number[]) {
    await this.tmanager.update(
      t_usertransactionledger,
      { id: In(ledgerIds) },
      { isSettled: true }
    );
    return;
  }

  public async getSettlementIndexes(
    period: 'this' | 'prev',
    userIds: number[]
  ) {
    let startDate, endDate;

    // Calculate date range based on the period
    if (period === 'this') {
      startDate = moment().subtract(1, 'week').startOf('week').toDate();
      endDate = moment().subtract(1, 'week').endOf('week').toDate();
    } else if (period === 'prev') {
      startDate = moment().subtract(2, 'week').startOf('week').toDate();
      endDate = moment().subtract(2, 'week').endOf('week').toDate();
    }
    // Use createQueryBuilder to fetch and group data
    const settlementLogs = await t_settlementlogs
      .createQueryBuilder('logs')
      .leftJoin('logs.transactionParticular', 'transactionParticular')
      .select('transactionParticular.id', 'transactionParticularId')
      .addSelect(
        'transactionParticular.prjSettConstant',
        'transactionParticular'
      )
      .addSelect('SUM(logs.companyAmount)', 'companyAmount')
      .addSelect('SUM(logs.masterAmount)', 'masterAmount')
      .addSelect('SUM(logs.brokerAmount)', 'brokerAmount')
      .addSelect('SUM(logs.subBrokerAmount)', 'subBrokerAmount')
      .addSelect('SUM(logs.totalAmount)', 'totalAmount')
      .addSelect('logs.startDate', 'startDate')
      .addSelect('logs.endDate', 'endDate')
      .where('logs.user.id IN (:...userIds)', { userIds })
      .andWhere('logs.startDate >= :startDate', { startDate })
      .andWhere('logs.endDate <= :endDate', { endDate })
      .groupBy('transactionParticular.id')
      .addGroupBy('logs.startDate')
      .addGroupBy('logs.endDate')
      .getRawMany();

    console.log('logs are ', settlementLogs);

    return settlementLogs;
  }

  public async getSettlementLogs(period: 'this' | 'prev', userIds: number[]) {
    let filter = {};
    if (period == 'this') {
      filter['startDate'] = MoreThanOrEqual(
        moment().subtract(1, 'week').startOf('week').toDate()
      );
      filter['endDate'] = LessThanOrEqual(
        moment().subtract(1, 'week').endOf('week').toDate()
      );
    }
    if (period == 'prev') {
      filter['startDate'] = MoreThanOrEqual(
        moment().subtract(2, 'week').startOf('week').toDate()
      );
      filter['endDate'] = LessThanOrEqual(
        moment().subtract(2, 'week').endOf('week').toDate()
      );
    }
    console.log('filter ', filter);
    let settlementLogs = await t_settlementlogs.find({
      where: { user: { id: In(userIds) }, ...filter },
      relations: { transactionParticular: true, user: { createdByUser: true } },
      select: {
        user: {
          username: true,
          createdByUser: {
            username: true,
          },
        },
        transactionParticular: {
          prjSettConstant: true,
          prjSettDisplayName: true,
        },
      },
    });

    return settlementLogs;
  }
}

export default Ledger;
