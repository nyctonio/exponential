import Trade from 'entity/trade';
import User from 'entity/user';
import Penalty from 'entity/penalty';
import Ledger from 'entity/ledger';
import redisClient from 'lib/redis';
import ProjectSetting from 'entity/project-settings';
import { AppDataSource } from 'database/sql';
import moment from 'moment';

class PenaltyHandler {
  public static async processPenalty(exchange: 'NSE' | 'MCX') {
    try {
      let trade = new Trade({ userId: -1, redisClient: redisClient });
      let user = new User({});
      let clients = await user.getAllClients();
      let prj = new ProjectSetting([]);
      const txnId = await prj.getProjectSettingByKeyAndConstant(
        'TRXNPRT',
        'Penalty'
      );
      const profitKey = await prj.getProjectSettingByKeyAndConstant(
        'TRXNTYP',
        'Credit'
      );
      const lossKey = await prj.getProjectSettingByKeyAndConstant(
        'TRXNTYP',
        'Debit'
      );
      await AppDataSource.transaction(async (trx) => {
        trade.setTransactionManager(trx);
        let openNormalOrders = await trade.getAllNormalOpenOrders(exchange);
        let penalty = await new Penalty(-1).getPenaltyOfAllUsers();
        let penaltyEligibleOrders = [];
        await Promise.all(
          clients.map(async (client) => {
            let clientsWithPenalty = penalty.filter(
              (a) => a.user.id == client.id
            );
            const parent_user = await new User({
              userId: client.id,
            }).getParentUser();
            const parent_user_data = await parent_user.getUserData();
            if (clientsWithPenalty.length > 0) {
              let openClientOrders = openNormalOrders.filter(
                (a) => a.user.id == client.id
              );
              console.log('openClientOrders', openClientOrders);
              if (
                clientsWithPenalty[0].penaltyType.prjSettConstant == 'MRGNPER'
              ) {
                // check if openOrders lastPenaltyDate + hours > current time then add to penaltyEligibleOrders
                openClientOrders = openClientOrders.filter((a) => {
                  let lastPenaltyDate =
                    a.lastPenaltyDate || a.orderExecutionDate;
                  let hours = clientsWithPenalty[0].hours;
                  // lastPenaltyDate is in +0:00 timezone so get Current time in +0:00 timezone
                  let lastPenaltyTime = moment(lastPenaltyDate)
                    .utc()
                    .format('YYYY-MM-DD HH:mm:ss');
                  let currentTime = moment()
                    .utc()
                    .format('YYYY-MM-DD HH:mm:ss');
                  let diffHours = moment(currentTime).diff(
                    lastPenaltyTime,
                    'hours'
                  );
                  return diffHours >= hours;
                });
                // @ts-ignores
                openClientOrders = openClientOrders.map((a) => {
                  return {
                    ...a,
                    parentId: parent_user_data.id,
                  };
                });
              }
              penaltyEligibleOrders.push(...openClientOrders);
            }
          })
        );
        console.log('penaltyEligibleOrders', penaltyEligibleOrders);
        await Promise.all(
          penaltyEligibleOrders.map(async (order) => {
            let clientsWithPenalty = penalty.filter(
              (a) => a.user.id == order.user.id
            );
            await new Penalty(order.user.id).updateLastPenaltyDate({
              orderId: order.id,
            });
            const margin_holded = await new Ledger({
              userId: order.user.id,
              redisClient: redisClient,
            }).getLedgerByOrderIdAndParticular({
              orderId: order.id,
              particularName: 'Margin Hold',
            });
            let added_margin =
              (margin_holded.transactionAmount *
                clientsWithPenalty[0].penalty) /
              100;
            console.log('order  ->', order);
            const user_ledger = new Ledger({
              userId: order.user.id,
              redisClient: redisClient,
            });
            const parent_ledger = new Ledger({
              userId: order.parentId,
              redisClient: redisClient,
            });
            user_ledger.setTransactionManager(trx);
            parent_ledger.setTransactionManager(trx);
            await Promise.all([
              user_ledger.addLedgerEntry({
                transactionAmount: added_margin,
                transactionParticularId: txnId.id,
                transactionTypeId: lossKey.id,
                transactionRemarks: `Penalty for order id ${order.id}`,
              }),
              parent_ledger.addLedgerEntry({
                transactionAmount: added_margin,
                transactionParticularId: txnId.id,
                transactionTypeId: profitKey.id,
                transactionRemarks: `Penalty for order id ${order.id}`,
              }),
            ]);

            if (clientsWithPenalty[0].cutBrokerage) {
              let brokerage = await new Ledger({
                userId: order.parentId,
                redisClient: redisClient,
              }).getLedgerByOrderIdAndParticular({
                orderId: order.id,
                particularName: 'Brokerage Collected',
              });

              await Promise.all([
                parent_ledger.addLedgerEntry({
                  transactionAmount: brokerage.transactionAmount,
                  transactionParticularId: txnId.id,
                  transactionTypeId: profitKey.id,
                  transactionRemarks: `Penalty brokerage sell for order id ${order.id}`,
                }),
                parent_ledger.addLedgerEntry({
                  transactionAmount: brokerage.transactionAmount,
                  transactionParticularId: txnId.id,
                  transactionTypeId: profitKey.id,
                  transactionRemarks: `Penalty brokerage for buy order id ${order.id}`,
                }),
                user_ledger.addLedgerEntry({
                  transactionAmount: brokerage.transactionAmount,
                  transactionParticularId: txnId.id,
                  transactionTypeId: lossKey.id,
                  transactionRemarks: `Penalty brokerage for sell order id ${order.id}`,
                }),
                user_ledger.addLedgerEntry({
                  transactionAmount: brokerage.transactionAmount,
                  transactionParticularId: txnId.id,
                  transactionTypeId: lossKey.id,
                  transactionRemarks: `Penalty brokerage for buy order id ${order.id}`,
                }),
              ]);
            }
          })
        );
      });
    } catch (e) {
      console.log('error in penalty handler ', e);
    }
  }
}

export default PenaltyHandler;
