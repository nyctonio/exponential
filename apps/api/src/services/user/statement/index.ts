// import User from 'entity/user';
import { redisClient } from '../../../lib/redis';
import Ledger from 'entity/ledger';
import ProjectSetting from 'entity/project-settings';
import User from 'entity/user';

class StatementService {
  public static async getStatementData(userId: number) {
    let data = {
      openingBalance: 0,
      normalUnrealizedPL: 0,
      intradayUnrealizedPL: 0,
      realizedPL: 0,
      marginAvailable: 0,
      m2m: 0,
      intradayMarginHold: 0,
      normalMarginHold: 0,
      withdrawal: 0,
      deposit: 0,
    };

    try {
      const ledger = new Ledger({ userId, redisClient });

      const [
        openingBalance,
        realizedPL,
        marginAvailable,
        brokerageSum,
        marginHold,
        marginReleased,
        userUnRealizedPL,
        subsequent,
      ] = await Promise.all([
        ledger.getOpeningBalance(),
        ledger.getRealizedPL(),
        ledger.getCreditBalance(),
        ledger.getBrokerageSum(),
        ledger.getMarginHold(),
        ledger.getMarginReleased(),
        redisClient.hGetAll(`margin-user-${userId}`),
        ledger.getDepositAndWithdrawal(),
      ]);

      for (const i in userUnRealizedPL) {
        if (i.endsWith('I-PL')) {
          data.intradayUnrealizedPL += parseFloat(userUnRealizedPL[i]);
        }
      }

      for (const i in userUnRealizedPL) {
        if (i.endsWith('N-PL')) {
          data.normalUnrealizedPL += parseFloat(userUnRealizedPL[i]);
        }
      }

      const unrealizedPL = data.intradayUnrealizedPL + data.normalUnrealizedPL;

      data.marginAvailable =
        unrealizedPL < 0 ? marginAvailable + unrealizedPL : marginAvailable;
      data.openingBalance = openingBalance;

      data.realizedPL = realizedPL - brokerageSum;
      data.m2m = unrealizedPL + data.realizedPL;
      data.intradayMarginHold =
        marginHold.intradayHold - marginReleased.intradayReleased;
      data.normalMarginHold =
        marginHold.normalHold - marginReleased.normalReleased;
      data.withdrawal = subsequent.withdrawal;
      data.deposit = subsequent.deposit;

      console.log('data', data);

      return data;
    } catch (e) {
      console.log('error in get statement data ', e);
      return data;
    }
  }

  public static async getHierarchyTransactions(
    currUserId: number,
    pageNumber: number,
    pageSize: number,
    username: string
  ) {
    let user = new User({ userId: currUserId });
    let userTypeData = await user.getUserData({ userType: true });
    let ledger = new Ledger({ redisClient: redisClient, userId: currUserId });
    console.log('username is ', username);
    let data = await ledger.getHierarchyTransactions(
      userTypeData.userType.prjSettConstant,
      pageNumber,
      pageSize,
      username
    );

    return data;
  }

  public static async getSettlementIndex(
    userId: number | null,
    period: 'this' | 'prev',
    loggedInUserId: number
  ) {
    let ledger = new Ledger({ redisClient: redisClient, userId: userId });
    let user = new User({ userId: userId == null ? loggedInUserId : userId });
    let childs = await user.get.getAllChildUsers();
    let childIds = childs
      .filter((a) => a.userType.prjSettConstant == 'Client')
      .map((a) => a.id);
    if (
      (await user.getUserData({ userType: true })).userType.prjSettConstant ==
      'Client'
    ) {
      childIds = [user.userId];
    }
    if (childIds.length == 0) {
      return [];
    }

    console.log('childs are ', childIds);
    return await ledger.getSettlementIndexes(period, childIds);
  }

  public static async getSettlementLogs(
    userId: number,
    period: 'this' | 'prev',
    pageNumber: number
  ) {
    let ledger = new Ledger({ redisClient, userId });
    let user = new User({ userId });
    let { userIds, count } = await user.get.getUserDirectChild(pageNumber);
    if (userIds.length == 0) {
      userIds = [
        await user.getUserData({ createdByUser: true, userType: true }),
      ];
    }

    let finalData = [];

    await Promise.all(
      userIds.map(async (user) => {
        let settlementRecords = await this.getSettlementIndex(
          user.id,
          period,
          user.id
        );
        console.log('settlement records for ', user.id, settlementRecords);
        finalData.push(
          ...settlementRecords.map((a) => {
            return {
              ...a,
              userId: user.id,
              username: user.username,
              upline: user.createdByUser.username,
              userType: user.userType.prjSettDisplayName,
            };
          })
        );
        return;
      })
    );

    return { data: finalData, count };
  }
}

export default StatementService;
