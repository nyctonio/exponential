import moment from 'moment';
import CreateUser from 'entity/user/create-user';
import { CreateUserConstants } from '../../../constants/admin/create-user';
import errorParser from 'entity/common/errorParser';
import ProjectSetting from 'entity/project-settings';
import { CreateUserBody } from '../../../types/user/create-user';
import User from 'entity/user';
import AuthService from '../../auth';

import Logger from '../../../utils/logger';
import redisClient from 'lib/redis';
import { m_usercreationcount } from 'database/sql/schema';

class CreateUserService {
  private errors: { key: string; message: string }[] = [];
  private status = true;

  private async validTillDateRule(user: CreateUser) {
    //past date check
    if (moment().diff(user.new_user_data.validTillDate, 'days') > 0) {
      this.status = false;
      this.errors.push({
        key: CreateUserConstants.KEYS.VALID_TILL_DATE,
        message: CreateUserConstants.VALIDATION.PAST_VALID_DATE,
      });
      return;
    }
    //parent date check
    if (
      user.new_user_data.validTillDate &&
      moment(user.new_user_data.validTillDate).diff(
        (await user.curr_user).validTillDate,
        'days'
      ) >= 0
    ) {
      this.status = false;
      this.errors.push({
        key: CreateUserConstants.KEYS.VALID_TILL_DATE,
        message: errorParser(
          CreateUserConstants.VALIDATION.VALID_TILL_DATE_GREATER_THAN_PARENT,
          {
            date: moment((await user.curr_user).validTillDate).format(
              'YYYY-MM-DD'
            ),
          }
        ),
      });
      return;
    }
    return;
  }

  private async tradeSquareOffLimitRule(user: CreateUser) {
    let projectSetting = new ProjectSetting();
    let userLimit = await projectSetting.getProjectSettingById(
      user.new_user_data.tradeSquareOffLimit
    );
    if (
      userLimit.prjSettSortOrder <
      (await user.curr_user).tradeSquareOffLimit.prjSettSortOrder
    ) {
      this.status = false;
      this.errors.push({
        key: CreateUserConstants.KEYS.TRADE_SQUARE_OFF_LIMIT,
        message: CreateUserConstants.VALIDATION.TRADE_SQUARE_OFF_LIMIT,
      });
    }
    return;
  }

  private async exchangeSettingsRule(user: CreateUser) {
    let currUserExchangeData = await user.getCurrUserExchange();
    console.log('curr user exchange data ', currUserExchangeData);
    Object.keys(user.new_user_data.exchangeSettings).map((item) => {
      let checkData = currUserExchangeData.find((a) => {
        return a.exchange.exchangeName == item;
      });
      if (!checkData) {
        this.status = false;
        this.errors.push({
          key: `${item} Not Allowed to Parent`,
          message: CreateUserConstants.KEYS[`${item}_EXCHANGE_TOGGLE`],
        });
        return;
      } else {
        if (
          user.new_user_data.exchangeSettings[`${item}`].exchangeMaxLotSize >
          checkData.exchangeMaxLotSize
        ) {
          this.status = false;
          this.errors.push({
            key: CreateUserConstants.KEYS[`${item}_EXCHANGE_MAX_LOT_SIZE`],
            message: errorParser(
              CreateUserConstants.VALIDATION.EXCHANGE_MAX_LOT_SIZE,
              { exchange: item, value: checkData.exchangeMaxLotSize }
            ),
          });
        }
        if (
          user.new_user_data.exchangeSettings[`${item}`].scriptMaxLotSize >
          checkData.scriptMaxLotSize
        ) {
          this.status = false;
          this.errors.push({
            key: CreateUserConstants.KEYS[`${item}_SCRIPT_MAX_LOT_SIZE`],
            message: errorParser(
              CreateUserConstants.VALIDATION.SCRIPT_MAX_LOT_SIZE,
              { exchange: item, value: checkData.scriptMaxLotSize }
            ),
          });
        }
        if (
          user.new_user_data.exchangeSettings[`${item}`].tradeMaxLotSize >
          checkData.tradeMaxLotSize
        ) {
          this.status = false;
          this.errors.push({
            key: CreateUserConstants.KEYS[`${item}_TRADE_MAX_LOT_SIZE`],
            message: errorParser(
              CreateUserConstants.VALIDATION.TRADE_MAX_LOT_SIZE,
              { exchange: item, value: checkData.tradeMaxLotSize }
            ),
          });
        }
      }
    });
    if (
      (await user.curr_user).tradeAllowedinQty == false &&
      user.new_user_data.tradeAllowedInQty == true
    ) {
      this.status = false;
      this.errors.push({
        key: CreateUserConstants.KEYS.TRADE_ALLOWED_IN_QTY,
        message: CreateUserConstants.VALIDATION.TRADE_ALLOWED_IN_QTY,
      });
    }
    return;
  }

  private async brokerageSettingsRule(user: CreateUser) {
    let currUserBrokerageData = await user.getCurrUserBrokerage();

    Object.keys(user.new_user_data.brokerageSettings).map((item) => {
      if (!user.new_user_data.exchangeSettings[`${item}`]) {
      } else {
        // newUserData['MCX'].brokerageAmt
        let currUserItem = currUserBrokerageData.find((a) => {
          return a.exchange.exchangeName == item;
        });

        if (currUserItem) {
          if (
            user.new_user_data.brokerageSettings[`${item}`]
              .brokeragePerCroreAmt < currUserItem.brokeragePerCroreAmt
          ) {
            this.status = false;
            this.errors.push({
              key: CreateUserConstants.KEYS[`${item}_BROKERAGE_PER_CRORE`],
              message:
                CreateUserConstants.VALIDATION[`${item}_BROKERAGE_PER_CRORE`],
            });
          }
          if (
            user.new_user_data.brokerageSettings[`${item}`].brokeragePerLotAmt <
            currUserItem.brokeragePerLotAmt
          ) {
            this.status = false;
            this.errors.push({
              key: CreateUserConstants.KEYS[`${item}_BROKERAGE_PER_LOT`],
              message:
                CreateUserConstants.VALIDATION[`${item}_BROKERAGE_PER_LOT`],
            });
          }
        }
      }
    });

    return;
  }

  private async marginSettingsRule(user: CreateUser) {
    let currUserTradeMarginData = await user.getCurrUserTradeMargin();
    Object.keys(user.new_user_data.tradeMarginSettings).map((item) => {
      if (!user.new_user_data.exchangeSettings[`${item}`]) {
      } else {
        let currUserItem = currUserTradeMarginData.find((a) => {
          return a.exchange.exchangeName == item;
        });

        if (!currUserItem) {
          if (
            user.new_user_data.tradeMarginSettings[`${item}`].marginPerCrore <
            currUserItem.marginPerCrore
          ) {
            this.status = false;
            this.errors.push({
              key: CreateUserConstants.KEYS[`${item}_TRADE_MARGIN_PER_CRORE`],
              message:
                CreateUserConstants.VALIDATION[
                  `${item}_TRADE_MARGIN_PER_CRORE`
                ],
            });
          }
          if (
            user.new_user_data.tradeMarginSettings[`${item}`].marginPerLot <
            currUserItem.marginPerLot
          ) {
            this.status = false;
            this.errors.push({
              key: CreateUserConstants.KEYS[`${item}_TRADE_MARGIN_PER_LOT`],
              message:
                CreateUserConstants.VALIDATION[`${item}_TRADE_MARGIN_PER_LOT`],
            });
          }
        }
      }
    });

    return;
  }

  private async intradayMarginSettingsRule(user: CreateUser) {
    if (user.new_user_data.isIntradayAllowed == false) {
      this.status = false;
      this.errors.push();
      return;
    }
    let currUserIntraTradeMarginData = await user.getCurrUserIntradayMargin();
    Object.keys(user.new_user_data.intradayTradeMarginSettings).map((item) => {
      if (!user.new_user_data.exchangeSettings[`${item}`]) {
      } else {
        let currUserItem = currUserIntraTradeMarginData.find((a) => {
          return a.exchange.exchangeName == item;
        });

        if (!currUserItem) {
          if (
            user.new_user_data.intradayTradeMarginSettings[`${item}`]
              .marginPerCrore < currUserItem.marginPerCrore
          ) {
            this.status = false;
            this.errors.push({
              key: CreateUserConstants.KEYS[`${item}_INTRA_MARGIN_PER_CRORE`],
              message:
                CreateUserConstants.VALIDATION[
                  `${item}_INTRA_MARGIN_PER_CRORE`
                ],
            });
          }
          if (
            user.new_user_data.intradayTradeMarginSettings[`${item}`]
              .marginPerLot < currUserItem.marginPerLot
          ) {
            this.status = false;
            this.errors.push({
              key: CreateUserConstants.KEYS[`${item}_INTRA_MARGIN_PER_LOT`],
              message:
                CreateUserConstants.VALIDATION[`${item}_INTRA_MARGIN_PER_LOT`],
            });
          }
        }
      }
    });

    return;
  }

  private async noOfDemoIdRule(user: CreateUser) {
    //balance check
    let currUser = await user.curr_user;
    let defaultBalance = await user.master_demo_creation_balance;
    let balanceData = {
      BROKER_SUBBROKER: defaultBalance.find((a) => {
        return a.name == 'BROKER_SUBBROKER';
      }),
      BROKER_CLIENT: defaultBalance.find((a) => {
        return a.name == 'BROKER_CLIENT';
      }),
      SUBBROKER_CLIENT: defaultBalance.find((a) => {
        return a.name == 'SUBBROKER_CLIENT';
      }),
    };
    let userTypeData = await user.new_user_type_data;
    switch (currUser.userType.prjSettConstant) {
      case 'Broker':
        switch (userTypeData.prjSettConstant) {
          case 'Client':
            let clientCount = await user.getUserCount({
              broker: currUser.id,
              userType: 'Client',
            });
            if (clientCount == balanceData.BROKER_CLIENT.balance) {
              this.status = false;
              this.errors.push({
                key: CreateUserConstants.KEYS.DEMO_ID,
                message: errorParser(
                  CreateUserConstants.VALIDATION.DEMO_BROKER_CLIENT,
                  { balance: balanceData.BROKER_CLIENT.balance }
                ),
              });
            }
            break;
          case 'Sub-Broker':
            let subBrokerCount = await user.getUserCount({
              broker: currUser.id,
              userType: 'Sub-Broker',
            });
            if (subBrokerCount == balanceData.BROKER_SUBBROKER.balance) {
              this.status = false;
              this.errors.push({
                key: CreateUserConstants.KEYS.DEMO_ID,
                message: errorParser(
                  CreateUserConstants.VALIDATION.DEMO_BROKER_SUBBROKER,
                  { balance: balanceData.BROKER_SUBBROKER.balance }
                ),
              });
            }
            break;
        }
        break;
      case 'Sub-Broker':
        let clientCount = await user.getUserCount({
          subBroker: currUser.id,
          userType: 'Client',
        });
        if (clientCount == balanceData.SUBBROKER_CLIENT.balance) {
          this.status = false;
          this.errors.push({
            key: CreateUserConstants.KEYS.DEMO_ID,
            message: errorParser(
              CreateUserConstants.VALIDATION.DEMO_SUBBROKER_CLIENT,
              { balance: balanceData.SUBBROKER_CLIENT.balance }
            ),
          });
        }
        break;
    }
    return;
  }

  private async demoParentRule(user: CreateUser) {
    if (
      user.new_user_data.isDemoId == false &&
      (await user.curr_user).isDemoId == true
    ) {
      this.status = false;
      this.errors.push({
        key: CreateUserConstants.KEYS.DEMO_ID,
        message: CreateUserConstants.VALIDATION.PARENT_DEMO_ACCOUNT,
      });
      return { status: this.status, errors: this.errors };
    }
  }

  private async userTypeRule(user: CreateUser) {
    let currUser = await user.curr_user;
    // console.log('user is ', currUser);
    let currUserType = (await user.curr_user).userType;
    let newUserType = await user.new_user_type_data;

    switch (currUserType.prjSettConstant) {
      case 'Company':
        if (
          newUserType.prjSettConstant != 'Master' &&
          newUserType.prjSettConstant != 'Client'
        ) {
          this.status = false;
          this.errors.push({
            key: CreateUserConstants.KEYS.USER_TYPE,
            message: CreateUserConstants.VALIDATION.USER_TYPE_NOT_ALLOWED,
          });
        }
        break;

      case 'Master':
        if (
          newUserType.prjSettConstant != 'Broker' &&
          newUserType.prjSettConstant != 'Client'
        ) {
          this.status = false;
          this.errors.push({
            key: CreateUserConstants.KEYS.USER_TYPE,
            message: CreateUserConstants.VALIDATION.USER_TYPE_NOT_ALLOWED,
          });
        }
        break;

      case 'Broker':
        if (
          newUserType.prjSettConstant != 'Sub-Broker' &&
          newUserType.prjSettConstant != 'Client'
        ) {
          this.status = false;
          this.errors.push({
            key: CreateUserConstants.KEYS.USER_TYPE,
            message: CreateUserConstants.VALIDATION.USER_TYPE_NOT_ALLOWED,
          });
        }
        break;

      case 'Sub-Broker':
        if (newUserType.prjSettConstant != 'Client') {
          this.status = false;
          this.errors.push({
            key: CreateUserConstants.KEYS.USER_TYPE,
            message: CreateUserConstants.VALIDATION.USER_TYPE_NOT_ALLOWED,
          });
        }
        break;
    }

    return;
  }

  private async plShareRule(user: CreateUser) {
    let plShareStats = await user.getHierarchyPLSum();
    let newUserType = await user.getUserType();
    console.log('pl share stats are ', plShareStats);
    Object.keys(plShareStats).map((exch) => {
      if (
        newUserType.prjSettConstant == 'Client' &&
        plShareStats[`${exch}`] != 100
      ) {
        this.status = false;
        this.errors.push({
          key: CreateUserConstants.KEYS[`${exch}_PL_SHARE`],
          message: errorParser(
            CreateUserConstants.VALIDATION[`${exch}_PL_SHARE_CLIENT`],
            {
              value:
                100 -
                plShareStats[`${exch}`] +
                user.new_user_data.plShare[`${exch}`],
            }
          ),
        });
      }
      if (
        newUserType.prjSettConstant != 'Client' &&
        plShareStats[`${exch}`] > 100
      ) {
        this.status = false;
        this.errors.push({
          key: CreateUserConstants.KEYS[`${exch}_PL_SHARE`],
          message: errorParser(
            CreateUserConstants.VALIDATION[`${exch}_PL_SHARE`],
            {
              value: 100 - plShareStats[`${exch}`],
            }
          ),
        });
      }
    });
    return;
  }

  private async squareOffSettingsRule(user: CreateUser) {
    let parentMaxLossCap = (await user.curr_user).maxLossCap;
    let parentM2M = (await user.curr_user).m2mSquareOff;
    let parentM2MLimit = (await user.curr_user).m2mSquareOffLimit;
    let parentSmSquareOff = (await user.curr_user).shortMarginSquareOff;

    if (
      parentSmSquareOff == true &&
      user.new_user_data.shortMarginSquareOff == false
    ) {
      this.status = false;
      this.errors.push({
        key: 'SM_SQUARE_OFF',
        message: `Short margin square off should be enabled for this user`,
      });
    }

    if (user.new_user_data.maxLossCap > parentMaxLossCap) {
      this.status = false;
      this.errors.push({
        key: 'MAX_LOSS_CAP',
        message: `Max loss cap can't be more than ${parentMaxLossCap}`,
      });
    }

    if (parentM2M == true && user.new_user_data.m2mSquareOff == false) {
      this.status = false;
      this.errors.push({
        key: 'M2M_SQUARE_OFF',
        message: `M2M square off should be enabled for this user`,
      });
    }

    if (parentM2MLimit > user.new_user_data.m2mSquareOffLimit) {
      this.status = false;
      this.errors.push({
        key: 'M2M_SQUARE_OFF_LIMIT',
        message: `M2M square off limit should be more than ${parentM2MLimit}`,
      });
    }
  }

  private async userCountRule(user: CreateUser) {
    let currUserType = (await user.curr_user).userType.prjSettConstant;
    if (currUserType != 'Company') {
      let currUserCreationCount = await m_usercreationcount.findOne({
        where: { user: { id: (await user.curr_user).id } },
      });
      let [brokerCount, subBrokerCount, clientCount] = await Promise.all([
        user.getUserCount({
          userType: 'Broker',
          broker: currUserType == 'Broker' ? (await user.curr_user).id : null,
          master: currUserType == 'Master' ? (await user.curr_user).id : null,
          subBroker:
            currUserType == 'Sub-Broker' ? (await user.curr_user).id : null,
        }),
        user.getUserCount({
          userType: 'Sub-Broker',
          broker: currUserType == 'Broker' ? (await user.curr_user).id : null,
          master: currUserType == 'Master' ? (await user.curr_user).id : null,
          subBroker:
            currUserType == 'Sub-Broker' ? (await user.curr_user).id : null,
        }),
        user.getUserCount({
          userType: 'Client',
          broker: currUserType == 'Broker' ? (await user.curr_user).id : null,
          master: currUserType == 'Master' ? (await user.curr_user).id : null,
          subBroker:
            currUserType == 'Sub-Broker' ? (await user.curr_user).id : null,
        }),
      ]);

      let balance = {
        broker: currUserCreationCount.brokerCount - brokerCount,
        subBroker: currUserCreationCount.subBrokerCount - subBrokerCount,
        clientCount: currUserCreationCount.clientCount - clientCount,
      };

      console.log('balance is ', balance);

      console.log('user new user data', user.new_user_data);

      switch ((await user.new_user_type_data).prjSettConstant) {
        case 'Master':
          break;
        case 'Broker':
          if (balance.broker <= 0) {
            this.status = false;
            this.errors.push({
              key: 'BROKER_COUNT',
              message: `Can't create more brokers.`,
            });
          }
          if (balance.subBroker < user.new_user_data.subBrokerCount) {
            this.status = false;
            this.errors.push({
              key: 'SUBBROKER_COUNT',
              message: `Can't create more than ${balance.subBroker} sub brokers.`,
            });
          }
          if (balance.clientCount < user.new_user_data.clientCount) {
            this.status = false;
            this.errors.push({
              key: 'CLIENT_COUNT',
              message: `Can't create more than ${balance.clientCount} clients.`,
            });
          }

          break;
        case 'Sub-Broker':
          if (balance.subBroker <= 0) {
            this.status = false;
            this.errors.push({
              key: 'SUBBROKER_COUNT',
              message: `Can't create more sub brokers.`,
            });
          }
          if (balance.clientCount < user.new_user_data.clientCount) {
            this.status = false;
            this.errors.push({
              key: 'CLIENT_COUNT',
              message: `Can't create more than ${balance.clientCount} clients.`,
            });
          }

          break;
        case 'Client':
          if (balance.clientCount <= 0) {
            this.status = false;
            this.errors.push({
              key: 'CLIENT_COUNT',
              message: `Can't create more clients.`,
            });
          }

          break;
      }
    }

    return;
  }

  private async validationService(user: CreateUser) {
    // Rule 0 -> company can only create broker, broker -> subbroker
    await this.userTypeRule(user);
    if (this.status == false)
      return { status: this.status, errors: this.errors };

    let promises = [
      // Rule 1 -> demo user can only create demo user
      this.demoParentRule(user),
      // Rule 2 -> there is a limit on no of demo user
      // this.noOfDemoIdRule(user), //todo recheck with new user type
      // Rule 3 -> trade square off limit of parent should be less than child
      this.tradeSquareOffLimitRule(user),
      // Rule 5 -> exchange settings Rule
      this.exchangeSettingsRule(user),
      // Rule 6 -> brokerage settings Rule
      this.brokerageSettingsRule(user),
      // Rule 7 -> margin settings Rule
      this.marginSettingsRule(user),
      // Rule 9 -> pofit and loss sharing check
      this.plShareRule(user),
      //square off settings rule
      this.squareOffSettingsRule(user),
      //user count rule
      // this.userCountRule(user),
    ];

    // Rule 4 -> check valid till date if parent has a valid till date
    if (user.new_user_data.validTillDate) {
      promises.push(this.validTillDateRule(user));
    }

    // Rule 8 -> intraday margin settings Rule If parent has intraday allowed
    if (user.new_user_data.isIntradayAllowed == true) {
      promises.push(this.intradayMarginSettingsRule(user));
    }

    await Promise.all(promises);
    return { status: this.status, errors: this.errors };
  }

  public async createUser(
    userData: CreateUserBody,
    currUser: { id: number; username: string }
  ) {
    let parentUserId = currUser.id;
    //validations
    if (userData.createdOnBehalf) {
      parentUserId = userData.createdOnBehalf;
    }
    userData.password = await AuthService.hashPassword(userData.password);
    let user = new CreateUser(userData, parentUserId);
    let validationResult = await this.validationService(user);
    if (validationResult.status == false) {
      return validationResult;
    }
    let userId = await user.createUser();
    await redisClient.hSet(`m2m-user-${userId}`, {
      ['allowed']: userData.m2mSquareOff ? 'true' : 'false',
      ['value']: userData.m2mSquareOffLimit,
    });
    await redisClient.hSet(
      `margin-user-${userId}`,
      'margin',
      userData.transactionLedger.amount
    );

    // console.log('user id is ', userId);

    const logData = {
      operation: 'create',
      type: 'event',
      loggedInUser: currUser.id,
      targetUsers: [currUser.id],
      actionDoneBy: 'user',
      description: 'User created',
      metadata: {
        additionalInfo: userId,
      },
    };
    Logger.logQueue(logData);
    return { status: true, errors: [], userId };
  }

  public async getUsernameAvailability(username: string) {
    let user = new User({ userName: username });
    return await user.getUsernameAvailability();
  }

  public async getDropdownData(userId: number) {
    let user = new User({ userId });
    let projectSetting = new ProjectSetting(['USRTYP', 'TRDSQOL', 'USRCITY']);
    await projectSetting.getProjectSettingByKeys();
    let userData = await user.getUserData({
      tradeSquareOffLimit: true,
      userType: true,
    });

    let responseData: {
      userType: {
        text: string;
        value: number;
        sort: number;
        constant: string;
      }[];
      city: { text: string; value: number; sort: number; constant: string }[];
      tradeSquareOffLimit: {
        text: string;
        value: number;
        sort: number;
        constant: string;
      }[];
    } = {
      userType: [],
      city: [],
      tradeSquareOffLimit: [],
    };

    let userTypeData = projectSetting.project_setting_data.filter(
      (a) => a.prjSettKey == 'USRTYP'
    );

    let tradeSquareOffLimitData = projectSetting.project_setting_data.filter(
      (a) => a.prjSettKey == 'TRDSQOL'
    );

    let citiesData = projectSetting.project_setting_data.filter(
      (a) => a.prjSettKey == 'USRCITY'
    );

    responseData.city = citiesData
      .map((a) => {
        return {
          text: a.prjSettDisplayName,
          value: a.id,
          sort: a.prjSettSortOrder,
          constant: a.prjSettConstant,
        };
      })
      .sort((a, b) => a.sort - b.sort);

    responseData.tradeSquareOffLimit = tradeSquareOffLimitData
      .filter(
        (a) =>
          a.prjSettSortOrder >= userData.tradeSquareOffLimit.prjSettSortOrder
      )
      .map((a) => {
        return {
          text: a.prjSettDisplayName,
          value: a.id,
          sort: a.prjSettSortOrder,
          constant: a.prjSettConstant,
        };
      })
      .sort((a, b) => a.sort - b.sort);
    // console.log('user type ', userTypeData);
    responseData.userType = userTypeData.map((a) => {
      return {
        text: a.prjSettDisplayName,
        value: a.id,
        sort: a.prjSettSortOrder,
        constant: a.prjSettConstant,
      };
    });
    console.log('curr user type ', userData.userType.prjSettConstant);
    switch (userData.userType.prjSettConstant) {
      case 'Company':
        responseData.userType = responseData.userType.filter(
          (a) => a.constant == 'Master' || a.constant == 'Client'
        );
        break;

      case 'Master':
        responseData.userType = responseData.userType.filter(
          (a) => a.constant == 'Broker' || a.constant == 'Client'
        );
        break;

      case 'Broker':
        responseData.userType = responseData.userType.filter(
          (a) => a.constant == 'Sub-Broker' || a.constant == 'Client'
        );
        break;

      case 'Sub-Broker':
        responseData.userType = responseData.userType.filter(
          (a) => a.constant == 'Client'
        );
        break;
    }

    return responseData;
  }
}

export default CreateUserService;
