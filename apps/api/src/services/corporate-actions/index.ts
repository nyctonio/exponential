import Instruments from 'entity/instruments';
import Reconciliation from 'entity/reconciliation';
class CorporateActionsService {
  public static async getActions() {
    let recon = new Reconciliation();
    let data = await recon.getActions();
    return data;
  }

  public static async createAction({
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
    let instrument = new Instruments();
    let instrumentData = await instrument.getInstruments({
      names: [instrumentName],
    });
    if (instrumentData.length == 0) {
      throw new Error('Please pass valid instrument name');
    }
    let recon = new Reconciliation();
    await recon.createAction({
      actionData,
      actionDate,
      actionType,
      instrumentName,
    });
    return;
  }
}

export default CorporateActionsService;
