import {
  SearchUserBody,
  SearchUserBodySort,
  TransactionBody,
} from '../../../types/user/search-user';
import printSafe from 'entity/common/printSafe';
import ProjectSetting from 'entity/project-settings';
import User from 'entity/user';
import SearchUser from 'entity/user/search-user';
import AuthService from '../../auth';
import Ledger from 'entity/ledger';
import { AppDataSource } from 'database/sql';
import { redisClient } from '../../../lib/redis';

class SearchUserUtils {
  public static parseUserType(userType, currUserType) {
    let finalUserType: string[] = [];
    switch (userType) {
      case 'all':
        if (currUserType.type == 'Company') {
          finalUserType.push('Master', 'Broker', 'Sub-Broker', 'Client');
        } else if (currUserType.type == 'Master') {
          finalUserType.push('Broker', 'Sub-Broker', 'Client');
        } else if (currUserType.type == 'Broker') {
          finalUserType.push('Sub-Broker', 'Client');
        } else if (currUserType.type == 'Sub-Broker') {
          finalUserType.push('Client');
        }
        break;

      case 'Master':
        if (currUserType.type == 'Company') {
          finalUserType.push('Master');
        }
        break;

      case 'Broker':
        if (currUserType.type == 'Company' || currUserType.type == 'Master') {
          finalUserType.push('Broker');
        }
        break;

      case 'Sub-Broker':
        if (
          currUserType.type == 'Company' ||
          currUserType.type == 'Broker' ||
          currUserType.type == 'Master'
        ) {
          finalUserType.push('Sub-Broker');
        }
        break;

      case 'Client':
        finalUserType.push('Client');
        break;
    }
    return finalUserType;
  }

  public static parseSortObj(sortData: SearchUserBodySort) {
    let sortObj = {};
    Object.keys(sortData).map((item) => {
      if (sortData[`${item}`] != 'NONE') {
        switch (item) {
          case 'username':
            sortObj['username'] = sortData['username'];
            break;
          case 'userType':
            sortObj['userType'] = {
              prjSettDisplayName: sortData['userType'],
            };
            break;
          case 'upline':
            sortObj['createdByUser'] = {
              username: sortData['upline'],
            };
            break;
          case 'name':
            sortObj['firstName'] = sortData['name'];
            sortObj['lastName'] = sortData['name'];
            break;
          case 'onlySquareOff':
            sortObj['onlySquareOff'] = sortData['onlySquareOff'];
            break;
          case 'createdDate':
            sortObj['createdAt'] = sortData['createdDate'];
            break;
        }
      }
    });

    printSafe(['sort objjj is ', sortObj]);
    return sortObj;
  }
}

class SearchUserService {
  public static async getCompanyBrokers(userId: number) {
    let searchUser = new SearchUser(userId);
    return await searchUser.getCompanyBrokers();
  }

  public static async getSubBrokers(userId: number) {
    let searchUser = new SearchUser(userId);
    return await searchUser.getSubBrokers();
  }

  public static async searchUser(
    userId: number,
    searchCritera: SearchUserBody
  ) {
    // console.log('search criteria is ', searchCritera);
    let { pageNumber, pageSize, sort, upline, userType, username } =
      searchCritera;
    let searchUser = new SearchUser(userId);
    let usernames = username.split(',').map((a) => a.trim());
    let finalUserType = SearchUserUtils.parseUserType(
      userType,
      await searchUser.getUserType()
    );
    let sortObj = SearchUserUtils.parseSortObj(sort);

    let { users, count } = await searchUser.searchUser({
      pageNumber,
      pageSize,
      sortObj,
      upline,
      username: usernames,
      userType: finalUserType,
    });

    return { users, count };
  }

  //   public static async transactionHandler() {
  //     let { userId, amount, remarks, type } = transactionData;
  //     let transactionTypeData = await models.m_projectsetting.findOne({
  //       where: {
  //         prjSettKey: 'TRXNTYP',
  //         prjSettConstant: type == 'Deposit' ? 'Credit' : 'Debit',
  //       },
  //     });

  //     let transactionParticularData = await models.m_projectsetting.findOne({
  //       where: {
  //         prjSettKey: 'TRXNPRT',
  //         prjSettConstant:
  //           type == 'Deposit' ? 'Subsequent Deposit' : 'Subsequent Withdrawal',
  //       },
  //     });

  //     const result = await models.t_usertransactionledger.insert({
  //       transactionAmount: amount,
  //       transactionParticular: {
  //         id: transactionParticularData.id,
  //       },
  //       transactionType: {
  //         id: transactionTypeData.id,
  //       },
  //       transactionRemarks: remarks,
  //       user: {
  //         id: userId,
  //       },
  //       createdBy: {
  //         id: currUser.id,
  //       },
  //       updatedBy: {
  //         id: currUser.id,
  //       },
  //       transactionDate: moment().toDate(),
  //     });

  //     return result;
  //   }

  public static async updatePasswordHandler(userId: number, password: string) {
    let searchUser = new SearchUser(userId);
    await searchUser.updatePassword(
      userId,
      await AuthService.hashPassword(password)
    );
    return;
  }

  public static async updateStatusHandler({
    currUserId,
    lastStatus,
    remarks,
    updatedStatus,
    userId,
  }: {
    userId: number;
    remarks: string;
    currUserId: number;
    lastStatus: number;
    updatedStatus: number;
  }) {
    let user = new User({ userId });
    let projectSetting = new ProjectSetting();
    let userData = await user.getUserData({ userType: true });

    let updatedStateData =
      await projectSetting.getProjectSettingById(updatedStatus);

    await user.updateUserStatus(updatedStatus, lastStatus, currUserId, remarks);
    if (
      updatedStateData.prjSettConstant == 'Inactive' ||
      updatedStateData.prjSettConstant == 'Suspended'
    ) {
      switch (userData.userType.prjSettConstant) {
        case 'Master':
          await user.updateDownlineStatus({
            updatedStatus: updatedStatus,
            brokerId: null,
            subBrokerId: null,
            masterId: userId,
          });
          break;
        case 'Broker':
          await user.updateDownlineStatus({
            updatedStatus: updatedStatus,
            brokerId: userId,
            subBrokerId: null,
            masterId: null,
          });
          break;
        case 'Sub-Broker':
          await user.updateDownlineStatus({
            updatedStatus: updatedStatus,
            brokerId: null,
            subBrokerId: userId,
            masterId: null,
          });
          break;
      }
    }
    return;
  }

  public static async transactionHandler(
    transactionData: TransactionBody,
    currUser: { id: number }
  ) {
    let { userId, amount, remarks, type } = transactionData;
    let projectSetting = new ProjectSetting();

    let transactionParticularData =
      await projectSetting.getProjectSettingByKeyAndConstant(
        'TRXNPRT',
        type == 'Deposit' ? 'Subsequent Deposit' : 'Subsequent Withdrawal'
      );

    await AppDataSource.transaction(async (tmanager) => {
      const ledger = new Ledger({ userId, redisClient });
      ledger.setTransactionManager(tmanager);
      if (type == 'Deposit') {
        await ledger.creditBalance({
          amount,
          currUserId: currUser.id,
          transactionParticularId: transactionParticularData.id,
          transactionRemarks: remarks,
        });
      } else {
        await ledger.debitBalance({
          amount,
          currUserId: currUser.id,
          transactionParticularId: transactionParticularData.id,
          transactionRemarks: remarks,
        });
      }
    });

    return {};
  }

  public static async loginHistory({
    userId,
    pageNumber,
  }: {
    userId: number;
    pageNumber: number;
  }) {
    let user = new User({ userId });
    return await user.getLoginHistory({ userId, pageNumber });
  }
}

export default SearchUserService;
