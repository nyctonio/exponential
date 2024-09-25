import User from 'entity/user';
import Pl from 'entity/plshare';
import Brokerage from 'entity/brokerage-settings';
import Ledger from 'entity/ledger';
import redisClient from 'lib/redis';
import ProjectSetting from 'entity/project-settings';
import { AppDataSource } from 'database/sql';
import { m_projectsetting, m_user } from 'database/sql/schema';
import moment from 'moment';

type ClientSharingData = {
  company: number;
  master: number;
  broker: number;
  subBroker: number;
  client: number;
};
class ClientSharing {
  private static async settlementReportHandler({
    totalTradeBrokerage,
    totalTradeLoss,
    totalTradeProfit,
    client,
    tmanager,
    tradeLossTxnKey,
    tradeProfitTxnKey,
    brokerageCollectedTxnKey,
  }: {
    totalTradeBrokerage: ClientSharingData;
    totalTradeLoss: ClientSharingData;
    totalTradeProfit: ClientSharingData;
    client: m_user;
    tmanager: any;
    tradeLossTxnKey: m_projectsetting;
    tradeProfitTxnKey: m_projectsetting;
    brokerageCollectedTxnKey: m_projectsetting;
  }) {
    let ledger = new Ledger({ userId: client.id, redisClient });
    ledger.setTransactionManager(tmanager);

    await Promise.all([
      ledger.createSettlementLog(
        moment().subtract(1, 'week').startOf('week').utc().toDate(),
        moment().subtract(1, 'week').endOf('week').utc().toDate(),
        totalTradeBrokerage,
        brokerageCollectedTxnKey.id
      ),
      ledger.createSettlementLog(
        moment().subtract(1, 'week').startOf('week').utc().toDate(),
        moment().subtract(1, 'week').endOf('week').utc().toDate(),
        totalTradeProfit,
        tradeLossTxnKey.id
      ),
      ledger.createSettlementLog(
        moment().subtract(1, 'week').startOf('week').utc().toDate(),
        moment().subtract(1, 'week').endOf('week').utc().toDate(),
        totalTradeLoss,
        tradeProfitTxnKey.id
      ),
    ]);

    return;
  }
  public static async plAndBrokerageShare() {
    let user = new User({});
    let clientsData = await user.getAllClientsWithHierarchy();
    let projectSetting = new ProjectSetting();

    let [
      tradeLossTxnKey,
      tradeProfitTxnKey,
      brokerageReceivedTxnKey,
      brokerageCollectedTxnKey,
    ] = await Promise.all([
      projectSetting.getProjectSettingByKeyAndConstant('TRXNPRT', 'Trade Loss'),
      projectSetting.getProjectSettingByKeyAndConstant(
        'TRXNPRT',
        'Trade Profit'
      ),
      projectSetting.getProjectSettingByKeyAndConstant(
        'TRXNPRT',
        'Brokerage Received'
      ),
      projectSetting.getProjectSettingByKeyAndConstant(
        'TRXNPRT',
        'Brokerage Collected'
      ),
    ]);

    let newLedgerCreditRecords: {
      amount: number;
      transactionParticularId: number;
      transactionRemarks: string;
      orderId?: number;
      userId: number;
    }[] = [];
    let newLedgerDebitRecords: {
      amount: number;
      transactionParticularId: number;
      transactionRemarks: string;
      orderId?: number;
      userId: number;
    }[] = [];
    let settledRecords = [];

    await AppDataSource.transaction(async (tmanager) => {
      await Promise.all(
        clientsData.map(async (client) => {
          console.log('client is ', client);
          let pl = new Pl({ userId: client.id });
          let brokerage = new Brokerage({ userId: client.id });
          let ledger = new Ledger({
            userId: client.id,
            redisClient: redisClient,
          });
          ledger.setTransactionManager(tmanager);
          let totalTradeBrokerage = {
            company: 0,
            master: 0,
            broker: 0,
            subBroker: 0,
            client: 0,
          };

          let totalTradeLoss = {
            company: 0,
            master: 0,
            broker: 0,
            subBroker: 0,
            client: 0,
          };

          let totalTradeProfit = {
            company: 0,
            master: 0,
            broker: 0,
            subBroker: 0,
            client: 0,
          };

          let [clientPlData, clientBrokerageData, brokerageAndPLRecords] =
            await Promise.all([
              pl.getPlShareData(),
              brokerage.getBrokerageSettings(),
              ledger.getBrokerageAndPlRecords(client.id),
            ]);

          console.log(
            'brokerage and pl records ',
            brokerageAndPLRecords,
            clientBrokerageData,
            clientPlData
          );
          brokerageAndPLRecords.map((record) => {
            record.transactionAmount = Number(record.transactionAmount);
            console.log('on record', record);
            let applicableBrokerage = clientBrokerageData.find(
              (a) => a.exchange.exchangeName == record.order.exchange
            );

            let applicablePl = clientPlData.find(
              (a) => a.exchange.exchangeName == record.order.exchange
            );

            switch (record.transactionParticular.prjSettConstant) {
              case 'Brokerage Collected':
                if (
                  applicableBrokerage.companyPerCroreAmt ||
                  applicableBrokerage.companyPerLotAmt
                ) {
                  let brokTypeOnOrder = record.order.brokerageChargedType;
                  let brokPer =
                    brokTypeOnOrder == 'crore'
                      ? (applicableBrokerage.companyPerCroreAmt /
                          applicableBrokerage.brokeragePerCroreAmt) *
                        100
                      : (applicableBrokerage.companyPerLotAmt /
                          applicableBrokerage.brokeragePerLotAmt) *
                        100;

                  newLedgerCreditRecords.push({
                    amount: Number(
                      ((record.transactionAmount * brokPer) / 100).toFixed(2)
                    ),
                    transactionRemarks: `Brokerage Received for ${record.order.id}`,
                    transactionParticularId: brokerageReceivedTxnKey.id,
                    userId: client.company.id,
                  });

                  totalTradeBrokerage.company += Number(
                    ((record.transactionAmount * brokPer) / 100).toFixed(2)
                  );
                }

                if (
                  applicableBrokerage.masterPerCroreAmt ||
                  applicableBrokerage.masterPerLotAmt
                ) {
                  let brokTypeOnOrder = record.order.brokerageChargedType;
                  let brokPer =
                    brokTypeOnOrder == 'crore'
                      ? (applicableBrokerage.masterPerCroreAmt /
                          applicableBrokerage.brokeragePerCroreAmt) *
                        100
                      : (applicableBrokerage.masterPerLotAmt /
                          applicableBrokerage.brokeragePerLotAmt) *
                        100;

                  console.log('brok percent is ', brokPer);
                  newLedgerCreditRecords.push({
                    amount: Number(
                      ((record.transactionAmount * brokPer) / 100).toFixed(2)
                    ),
                    transactionRemarks: `Brokerage Received for ${record.order.id}`,
                    transactionParticularId: brokerageReceivedTxnKey.id,
                    userId: client.master.id,
                  });

                  totalTradeBrokerage.master += Number(
                    ((record.transactionAmount * brokPer) / 100).toFixed(2)
                  );
                }

                if (
                  applicableBrokerage.brokerPerCroreAmt ||
                  applicableBrokerage.brokerPerLotAmt
                ) {
                  let brokTypeOnOrder = record.order.brokerageChargedType;
                  let brokPer =
                    brokTypeOnOrder == 'crore'
                      ? (applicableBrokerage.brokerPerCroreAmt /
                          applicableBrokerage.brokeragePerCroreAmt) *
                        100
                      : (applicableBrokerage.brokerPerLotAmt /
                          applicableBrokerage.brokeragePerLotAmt) *
                        100;

                  newLedgerCreditRecords.push({
                    amount: Number(
                      ((record.transactionAmount * brokPer) / 100).toFixed(2)
                    ),
                    transactionRemarks: `Brokerage Received for ${record.order.id}`,
                    transactionParticularId: brokerageReceivedTxnKey.id,
                    userId: client.broker.id,
                  });

                  totalTradeBrokerage.broker += Number(
                    ((record.transactionAmount * brokPer) / 100).toFixed(2)
                  );
                }

                if (
                  applicableBrokerage.subBrokerPerCroreAmt ||
                  applicableBrokerage.subBrokerPerLotAmt
                ) {
                  let brokTypeOnOrder = record.order.brokerageChargedType;
                  let brokPer =
                    brokTypeOnOrder == 'crore'
                      ? (applicableBrokerage.subBrokerPerCroreAmt /
                          applicableBrokerage.brokeragePerCroreAmt) *
                        100
                      : (applicableBrokerage.subBrokerPerLotAmt /
                          applicableBrokerage.brokeragePerLotAmt) *
                        100;

                  newLedgerCreditRecords.push({
                    amount: Number(
                      ((record.transactionAmount * brokPer) / 100).toFixed(2)
                    ),
                    transactionRemarks: `Brokerage Received for ${record.order.id}`,
                    transactionParticularId: brokerageReceivedTxnKey.id,
                    userId: client.subBroker.id,
                  });

                  totalTradeBrokerage.subBroker += Number(
                    ((record.transactionAmount * brokPer) / 100).toFixed(2)
                  );
                }

                totalTradeBrokerage.client += Number(record.transactionAmount);

                break;
              case 'Trade Profit':
                if (applicablePl.companySharing) {
                  newLedgerDebitRecords.push({
                    amount: Number(
                      (
                        (record.transactionAmount *
                          applicablePl.companySharing) /
                        100
                      ).toFixed(2)
                    ),
                    transactionRemarks: `Loss for ${record.order.id}`,
                    transactionParticularId: tradeLossTxnKey.id,
                    userId: client.company.id,
                  });

                  totalTradeProfit.company += Number(
                    (
                      (record.transactionAmount * applicablePl.companySharing) /
                      100
                    ).toFixed(2)
                  );
                }
                if (applicablePl.masterSharing) {
                  newLedgerDebitRecords.push({
                    amount: Number(
                      (
                        (record.transactionAmount *
                          applicablePl.masterSharing) /
                        100
                      ).toFixed(2)
                    ),
                    transactionRemarks: `Loss for ${record.order.id}`,
                    transactionParticularId: tradeLossTxnKey.id,
                    userId: client.master.id,
                  });

                  totalTradeProfit.master += Number(
                    (
                      (record.transactionAmount * applicablePl.masterSharing) /
                      100
                    ).toFixed(2)
                  );
                }
                if (applicablePl.brokerSharing) {
                  newLedgerDebitRecords.push({
                    amount: Number(
                      (
                        (record.transactionAmount *
                          applicablePl.brokerSharing) /
                        100
                      ).toFixed(2)
                    ),
                    transactionRemarks: `Loss for ${record.order.id}`,
                    transactionParticularId: tradeLossTxnKey.id,
                    userId: client.broker.id,
                  });

                  totalTradeProfit.broker += Number(
                    (
                      (record.transactionAmount * applicablePl.brokerSharing) /
                      100
                    ).toFixed(2)
                  );
                }
                if (applicablePl.subbrokerSharing) {
                  newLedgerDebitRecords.push({
                    amount: Number(
                      (
                        (record.transactionAmount *
                          applicablePl.subbrokerSharing) /
                        100
                      ).toFixed(2)
                    ),
                    transactionRemarks: `Loss for ${record.order.id}`,
                    transactionParticularId: tradeLossTxnKey.id,
                    userId: client.subBroker.id,
                  });

                  totalTradeProfit.subBroker += Number(
                    (
                      (record.transactionAmount *
                        applicablePl.subbrokerSharing) /
                      100
                    ).toFixed(2)
                  );
                }

                totalTradeProfit.client += Number(record.transactionAmount);
                break;
              case 'Trade Loss':
                if (applicablePl.companySharing) {
                  newLedgerCreditRecords.push({
                    amount: Number(
                      (
                        (record.transactionAmount *
                          applicablePl.companySharing) /
                        100
                      ).toFixed(2)
                    ),
                    transactionRemarks: `Profit for ${record.order.id}`,
                    transactionParticularId: tradeProfitTxnKey.id,
                    userId: client.company.id,
                  });

                  totalTradeLoss.company += Number(
                    (
                      (record.transactionAmount * applicablePl.companySharing) /
                      100
                    ).toFixed(2)
                  );
                }
                if (applicablePl.masterSharing) {
                  newLedgerCreditRecords.push({
                    amount: Number(
                      (
                        (record.transactionAmount *
                          applicablePl.masterSharing) /
                        100
                      ).toFixed(2)
                    ),
                    transactionRemarks: `Profit for ${record.order.id}`,
                    transactionParticularId: tradeProfitTxnKey.id,
                    userId: client.master.id,
                  });

                  totalTradeLoss.master += Number(
                    (
                      (record.transactionAmount * applicablePl.masterSharing) /
                      100
                    ).toFixed(2)
                  );
                }
                if (applicablePl.brokerSharing) {
                  newLedgerCreditRecords.push({
                    amount: Number(
                      (
                        (record.transactionAmount *
                          applicablePl.brokerSharing) /
                        100
                      ).toFixed(2)
                    ),
                    transactionRemarks: `Profit for ${record.order.id}`,
                    transactionParticularId: tradeProfitTxnKey.id,
                    userId: client.broker.id,
                  });

                  totalTradeLoss.broker += Number(
                    (
                      (record.transactionAmount * applicablePl.brokerSharing) /
                      100
                    ).toFixed(2)
                  );
                }
                if (applicablePl.subbrokerSharing) {
                  newLedgerCreditRecords.push({
                    amount: Number(
                      (
                        (record.transactionAmount *
                          applicablePl.subbrokerSharing) /
                        100
                      ).toFixed(2)
                    ),
                    transactionRemarks: `Profit for ${record.order.id}`,
                    transactionParticularId: tradeProfitTxnKey.id,
                    userId: client.subBroker.id,
                  });

                  totalTradeLoss.subBroker += Number(
                    (
                      (record.transactionAmount *
                        applicablePl.subbrokerSharing) /
                      100
                    ).toFixed(2)
                  );
                }

                totalTradeLoss.client += Number(record.transactionAmount);
                break;
            }
          });

          console.log(
            'total trade loss ',
            totalTradeLoss,
            ' brokerage ',
            totalTradeBrokerage,
            ' profit',
            totalTradeProfit
          );

          await this.settlementReportHandler({
            totalTradeBrokerage,
            totalTradeLoss,
            totalTradeProfit,
            client,
            tmanager,
            brokerageCollectedTxnKey,
            tradeLossTxnKey,
            tradeProfitTxnKey,
          });

          settledRecords = [
            ...settledRecords,
            ...brokerageAndPLRecords.map((a) => a.id),
          ];
        })
      );
      let ledger = new Ledger({ userId: -1, redisClient });
      ledger.setTransactionManager(tmanager);
      console.log('settled records ', settledRecords);
      // await ledger.bulkCreditRecords(newLedgerCreditRecords);
      // await ledger.bulkDebitRecords(newLedgerDebitRecords);
      await ledger.updateSettlementStatus(settledRecords);
    });

    console.log('credit ', newLedgerCreditRecords, newLedgerDebitRecords);
    return;
  }
}

export default ClientSharing;
