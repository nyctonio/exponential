import { AppDataSource } from 'database/sql';
import { t_scriptreconciliation } from 'database/sql/schema';
import Ledger from 'entity/ledger';
import ProjectSetting from 'entity/project-settings';
import Reconciliation from 'entity/reconciliation';
import Trade from 'entity/trade';
import redisClient from 'lib/redis';

class ReconciliationsService {
  private static async dividendProcessor(dueAction: t_scriptreconciliation) {
    let dividendAmount =
      dueAction.actionData.dividend && dueAction.actionData.dividend.amount;
    let trade = new Trade({ redisClient: redisClient, userId: -1 });
    let ledger = new Ledger({ userId: -1, redisClient: redisClient });
    let projectSetting = new ProjectSetting();
    let dividendParticularData =
      await projectSetting.getProjectSettingByKeyAndConstant(
        'TRXNPRT',
        'Dividend Received'
      );
    let orders = await trade.getOpenOrdersByNameAndDate(
      dueAction.instrumentName,
      dueAction.actionDate
    );

    console.log(
      'dividend amount ',
      dividendAmount,
      ' particular data ',
      dividendParticularData,
      ' orders ',
      orders
    );

    let creditLedgerRecords = [];
    orders.map((order) => {
      creditLedgerRecords.push({
        amount: dividendAmount * order.quantityLeft,
        transactionRemarks: `Dividend Received for ${order.id} of ${order.quantityLeft} qty@${dividendAmount}`,
        transactionParticularId: dividendParticularData.id,
        userId: order.user.id,
        orderId: order.id,
      });
    });

    console.log('credit ledger records ', creditLedgerRecords);
    if (creditLedgerRecords.length > 0) {
      await AppDataSource.transaction(async (tmanager) => {
        ledger.setTransactionManager(tmanager);
        return ledger.bulkCreditRecords(creditLedgerRecords);
      });
    }
    return orders.map((a) => a.id);
  }
  private static async processAction(dueAction: t_scriptreconciliation) {
    try {
      let recon = new Reconciliation();
      switch (dueAction.actionType) {
        case 'dividend':
          let affectedOrderIds = await this.dividendProcessor(dueAction);
          await recon.updateAction(dueAction.id, affectedOrderIds);
          break;
      }

      return;
    } catch (e) {
      console.log('error in processing action ', e);
      return;
    }
  }

  public static async runReconciliations() {
    let recon = new Reconciliation();
    let dueActions = await recon.getDueActions();
    console.log('due actions ', dueActions);
    if (dueActions.length > 0) {
      await Promise.all(
        dueActions.map(async (dueAction) => {
          await this.processAction(dueAction);
        })
      );
    }

    return;
  }
}

export default ReconciliationsService;
