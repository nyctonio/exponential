import { t_scriptreconciliation } from 'database/sql/schema';
import moment from 'moment';
import { And, LessThanOrEqual, MoreThan } from 'typeorm';
class Reconciliation {
  public async getActions() {
    let actionData = await t_scriptreconciliation.find();
    return actionData;
  }

  public async getDueActions() {
    let dueActionsData = await t_scriptreconciliation.find({
      where: {
        actionDate: And(
          LessThanOrEqual(moment().startOf('day').utc().toDate()),
          MoreThan(moment().subtract(1, 'd').startOf('day').utc().toDate())
        ),
      },
    });
    return dueActionsData;
  }

  public async createAction({
    actionDate,
    actionData,
    actionType,
    instrumentName,
  }: {
    actionDate: Date;
    instrumentName: string;
    actionData: any;
    actionType: 'dividend' | 'bonus' | 'split';
  }) {
    let newAction = await t_scriptreconciliation.save({
      actionDate: moment(actionDate, 'YYYY-MM-DD').utc().toDate(),
      actionData: actionData,
      actionStatus: 'pending',
      actionType: actionType,
      instrumentName: instrumentName,
    });

    return newAction;
  }

  public async updateAction(id: number, orderIds: number[]) {
    return await t_scriptreconciliation.update(
      { id },
      { actionStatus: 'processed', affectedOrders: orderIds }
    );
  }
}

export default Reconciliation;
