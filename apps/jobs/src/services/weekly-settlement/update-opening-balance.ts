import { AppDataSource } from 'database/sql';
import Ledger from 'entity/ledger';
import ProjectSetting from 'entity/project-settings';
import User from 'entity/user';
import redisClient from 'lib/redis';

class OpeningBalance {
  public static async handler() {
    try {
      let user = new User({});
      let projectSetting = new ProjectSetting();
      let openingBalanceParticular =
        await projectSetting.getProjectSettingByKeyAndConstant(
          'TRXNPRT',
          'Opening Balance'
        );
      let clientsData = await user.getAllClients();
      AppDataSource.transaction(async (trx) => {
        await Promise.all(
          clientsData.map(async (client) => {
            let ledger = new Ledger({
              userId: client.id,
              redisClient: redisClient,
            });
            ledger.setTransactionManager(trx);
            let currBalance = await ledger.getCreditBalance();
            let newEntry = await ledger.creditBalance({
              amount: currBalance,
              currUserId: null,
              transactionParticularId: openingBalanceParticular.id,
              transactionRemarks: 'Opening Balance',
              orderId: null,
            });
          })
        );
      });
      return;
    } catch (e) {
      console.log('error in updating opening balances', e);
      return;
    }
  }
}

export default OpeningBalance;
