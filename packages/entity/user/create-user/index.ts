import moment from 'moment';
import { AppDataSource } from 'database/sql';
import {
  m_defaultfunctionmapping,
  m_democreationbalance,
  m_exchange,
  m_exchangesetting,
  m_intradaytrademarginsetting,
  m_projectsetting,
  m_trademarginsetting,
  m_user,
  m_userbidstopsettings,
  m_userbrokeragesetting,
  m_usercuttingsettings,
  m_userfunctionmapping,
  m_usermcxbidstopsettings,
  m_userplsharing,
  m_userwatchlist,
  m_watchlistcolumn,
  m_scriptbrokeragesetting,
  m_scriptintradaymarginsetting,
  m_scripttrademarginsetting,
  m_scriptquantity,
  t_usertransactionledger,
  m_rent,
  m_usercreationcount,
} from 'database/sql/schema';
import { CreateUserBody } from '../../../../apps/api/src/types/user/create-user';
import printSafe from '../../common/printSafe';
import ProjectSetting from '../../project-settings';
class CreateUser {
  new_user_data: CreateUserBody;
  new_user_id: number | null = null;
  new_user_type_data: Promise<m_projectsetting>;
  curr_user: Promise<m_user>;
  curr_user_exchange: m_exchangesetting[] | null = null;
  curr_user_brokerage: m_userbrokeragesetting[] | null = null;
  curr_user_trade_margin: m_trademarginsetting[] | null = null;
  curr_user_intraday_margin: m_intradaytrademarginsetting[] | null = null;
  curr_user_pl_share: m_userplsharing[] | null = null;
  new_user_hierarchy: null | {
    companyId: null | number;
    brokerId: null | number;
    subBrokerId: null | number;
    masterId: null | number;
  } = null;
  master_demo_creation_balance: Promise<m_democreationbalance[]>;
  static_project_settings: {
    transactionParticular: m_projectsetting;
    transactionType: m_projectsetting;
    userStatus: m_projectsetting;
    rentDeductionParticular: m_projectsetting;
    debitTransactionType: m_projectsetting;
  } | null = null;
  master_exchange_data: m_exchange[] | null;
  master_watchlist_columns_data: m_watchlistcolumn[] | null = null;
  master_function_mapping: m_defaultfunctionmapping[] | null = null;
  new_user_function_mapping: m_userfunctionmapping[] | null = null;
  new_user_script_brokerage_setting_mapping: m_scriptbrokeragesetting[] | null =
    null;
  new_user_script_intraday_margin_setting_mapping:
    | m_scriptintradaymarginsetting[]
    | null = null;
  new_user_script_trade_margin_setting_mapping:
    | m_scripttrademarginsetting[]
    | null = null;
  new_user_script_quantity_mapping: m_scriptquantity[] | null = null;
  parsed_new_user_data: {
    transactionLedgerData: any;
    exchangeSettingsData: any[];
    tradeMarginSettingsData: any[];
    watchlistData: any[];
    functionsData: any[];
    scriptBrokerageData: any[];
    scriptIntradayMarginData: any[];
    scriptTradeMarginData: any[];
    scriptQuantityData: any[];
    brokerageSettingsData: any[];
    userBidStopSettingData: {
      userBidStopSettings: any[];
      userMcxBidStopSettings: any[];
      finalUserCuttingSettings: any[];
    };
    plShareData: any[];
    intradayMarginData: any | null;
  } | null = null;
  constructor(user_data: CreateUserBody, curr_user: number) {
    this.new_user_data = user_data;
    this.curr_user = m_user.findOne({
      where: { id: curr_user },
      relations: {
        tradeSquareOffLimit: true,
        userType: true,
        company: true,
        broker: true,
        subBroker: true,
        master: true,
      },
      select: {
        tradeSquareOffLimit: {
          id: true,
          prjSettSortOrder: true,
        },
        userType: {
          id: true,
          prjSettDisplayName: true,
          prjSettConstant: true,
        },
      },
    });
    this.master_demo_creation_balance = m_democreationbalance.find({});
    this.new_user_type_data = m_projectsetting.findOne({
      where: { id: this.new_user_data.userTypeId },
      select: {
        prjSettConstant: true,
      },
    });
  }

  async getUserHierarchy() {
    if (this.new_user_hierarchy == null) {
      let currUserData = await this.curr_user;

      let userHier = {
        companyId: null,
        masterId: null,
        brokerId: null,
        subBrokerId: null,
      };

      switch (currUserData.userType.prjSettConstant) {
        case 'Company':
          userHier.companyId = currUserData.id;
          break;
        case 'Master':
          userHier.companyId = currUserData.company.id;
          userHier.masterId = currUserData.id;
          break;
        case 'Broker':
          userHier.companyId = currUserData.company.id;
          userHier.masterId = currUserData.master.id;
          userHier.brokerId = currUserData.id;
          break;
        case 'Sub-Broker':
          userHier.companyId = currUserData.company.id;
          userHier.masterId = currUserData.master.id;
          userHier.brokerId = currUserData.broker.id;
          userHier.subBrokerId = currUserData.id;
          break;
      }

      this.new_user_hierarchy = userHier;
    }
    return this.new_user_hierarchy;
  }

  async getDemoBalanceData() {
    return await this.master_demo_creation_balance;
  }

  async getUserType() {
    return await this.new_user_type_data;
  }

  async getUserCount({
    broker = null,
    subBroker = null,
    userType,
    master,
  }: {
    master?: null | number;
    broker?: null | number;
    subBroker?: null | number;
    userType: string;
  }) {
    let condition: any = {};
    if (broker) {
      condition['broker'] = {
        id: broker,
      };
    }

    if (master) {
      condition['master'] = {
        id: master,
      };
    }

    if (subBroker) {
      condition['subBroker'] = {
        id: subBroker,
      };
    }

    return await m_user.count({
      where: {
        ...condition,
        userType: { prjSettConstant: userType },
      },
    });
  }

  async getCurrUserExchange() {
    if (!this.curr_user_exchange) {
      this.curr_user_exchange = await m_exchangesetting.find({
        where: {
          user: {
            id: (await this.curr_user).id,
          },
          isExchangeActive: true,
        },
        relations: {
          exchange: true,
        },
        select: {
          exchange: {
            exchangeName: true,
          },
        },
      });
    }
    return this.curr_user_exchange;
  }

  async getCurrUserBrokerage() {
    if (!this.curr_user_brokerage) {
      this.curr_user_brokerage = await m_userbrokeragesetting.find({
        where: {
          user: {
            id: (await this.curr_user).id,
          },
        },
        relations: {
          exchange: true,
        },
        select: {
          exchange: {
            exchangeName: true,
          },
        },
      });
    }
    return this.curr_user_brokerage;
  }

  async getCurrUserTradeMargin() {
    if (!this.curr_user_trade_margin) {
      this.curr_user_trade_margin = await m_trademarginsetting.find({
        where: {
          user: {
            id: (await this.curr_user).id,
          },
        },
        relations: {
          exchange: true,
        },
        select: {
          marginPerCrore: true,
          marginPerLot: true,
          exchange: {
            exchangeName: true,
          },
        },
      });
    }
    return this.curr_user_trade_margin;
  }

  async getCurrUserIntradayMargin() {
    if (!this.curr_user_intraday_margin) {
      this.curr_user_intraday_margin = await m_intradaytrademarginsetting.find({
        where: {
          user: {
            id: (await this.curr_user).id,
          },
        },
        relations: {
          exchange: true,
        },
        select: {
          marginPerCrore: true,
          marginPerLot: true,
          exchange: {
            exchangeName: true,
          },
        },
      });
    }
    return this.curr_user_intraday_margin;
  }

  async getStaticProjectSettings() {
    if (!this.static_project_settings) {
      this.static_project_settings = {
        transactionParticular: await m_projectsetting.findOne({
          where: { prjSettKey: 'TRXNPRT', prjSettConstant: 'Opening Balance' },
        }),
        transactionType: await m_projectsetting.findOne({
          where: {
            prjSettKey: 'TRXNTYP',
            prjSettConstant: 'Credit',
          },
        }),
        userStatus: await m_projectsetting.findOne({
          where: {
            prjSettKey: 'USRSTAT',
            prjSettConstant: 'Active',
          },
        }),
        debitTransactionType: await m_projectsetting.findOne({
          where: {
            prjSettKey: 'TRXNTYP',
            prjSettConstant: 'Debit',
          },
        }),

        rentDeductionParticular: await m_projectsetting.findOne({
          where: {
            prjSettKey: 'TRXNPRT',
            prjSettConstant: 'Rent Deduction',
          },
        }),
      };
    }
    return this.static_project_settings;
  }

  async getExchangeMasterData() {
    if (!this.master_exchange_data) {
      this.master_exchange_data = await m_exchange.find({
        where: { isActive: true },
      });
    }
    return this.master_exchange_data;
  }

  async getDefaultWatchlistColumns() {
    if (!this.master_watchlist_columns_data) {
      this.master_watchlist_columns_data = await m_watchlistcolumn.find({
        where: { default: true },
        order: { defaultIndex: 'ASC' },
        select: ['id', 'width'],
      });
    }
    return this.master_watchlist_columns_data;
  }

  async getDefaultFunctionMapping() {
    if (!this.master_function_mapping) {
      this.master_function_mapping = await m_defaultfunctionmapping.find({
        where: {
          userType: {
            id: this.new_user_data.userTypeId,
          },
        },
        relations: {
          func: true,
        },
        select: {
          func: {
            id: true,
          },
        },
      });
    }
    return this.master_function_mapping;
  }

  async getCopyUserFunctionMapping() {
    if (!this.new_user_function_mapping) {
      if (this.new_user_data.isCopyUser) {
        this.new_user_function_mapping = await m_userfunctionmapping.find({
          where: {
            user: {
              id: this.new_user_data.copyUserId,
            },
          },
          relations: {
            func: true,
          },
        });
      }
    }
    return this.new_user_function_mapping;
  }

  async getCopyUserScriptBrokerageSetting() {
    if (!this.new_user_script_brokerage_setting_mapping) {
      this.new_user_script_brokerage_setting_mapping =
        await m_scriptbrokeragesetting.find({
          where: {
            user: {
              id:
                this.new_user_data.isCopyUser == true
                  ? this.new_user_data.copyUserId
                  : (await this.curr_user).id,
            },
          },
        });
    }
    return this.new_user_script_brokerage_setting_mapping;
  }

  async getCopyUserScriptIntradayMarginSetting() {
    if (!this.new_user_script_intraday_margin_setting_mapping) {
      this.new_user_script_intraday_margin_setting_mapping =
        await m_scriptintradaymarginsetting.find({
          where: {
            user: {
              id:
                this.new_user_data.isCopyUser == true
                  ? this.new_user_data.copyUserId
                  : (await this.curr_user).id,
            },
          },
        });
    }
    return this.new_user_script_intraday_margin_setting_mapping;
  }

  async getCopyUserTradeMarginSetting() {
    if (!this.new_user_script_trade_margin_setting_mapping) {
      this.new_user_script_trade_margin_setting_mapping =
        await m_scripttrademarginsetting.find({
          where: {
            user: {
              id:
                this.new_user_data.isCopyUser == true
                  ? this.new_user_data.copyUserId
                  : (await this.curr_user).id,
            },
          },
          // relations: {
          //   func: true,
          // },
        });
    }
    return this.new_user_script_trade_margin_setting_mapping;
  }

  async getCopyUserScriptQuantitySetting() {
    if (!this.new_user_script_quantity_mapping) {
      this.new_user_script_quantity_mapping = await m_scriptquantity.find({
        where: {
          user: {
            id:
              this.new_user_data.isCopyUser == true
                ? this.new_user_data.copyUserId
                : (await this.curr_user).id,
          },
        },
      });
    }
    return this.new_user_script_quantity_mapping;
  }

  async getHierarchyPLSum() {
    let plShareData = await m_userplsharing.find({
      where: { user: { id: (await this.curr_user).id } },
      relations: {
        exchange: true,
      },
    });

    this.curr_user_pl_share = plShareData;

    let finalExchange: any = {};
    Object.keys(this.new_user_data.plShare).map((exch) => {
      let exchPlShare = plShareData.find(
        (a) => a.exchange.exchangeName == exch
      );
      if (exchPlShare) {
        finalExchange[`${exch}`] =
          this.new_user_data.plShare[`${exch}`] +
          exchPlShare.brokerSharing +
          exchPlShare.companySharing +
          exchPlShare.masterSharing;
      }
    });

    return finalExchange;
  }

  async getHierarchyRent() {
    let rentData = await m_rent.findOne({
      where: { user: { id: (await this.curr_user).id } },
    });
    return rentData;
  }

  private async userParser() {
    let data = this.new_user_data;
    let userHier = await this.getUserHierarchy();
    let currUser = await this.curr_user;
    let staticProjectSettings = await this.getStaticProjectSettings();
    let newUser: any = {
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobileNumber: data.mobileNumber,
      onlySquareOff: data.onlySquareOff,
      company: {
        id: userHier.companyId,
      },
      master: {
        id: userHier.masterId,
      },
      broker: {
        id: userHier.brokerId,
      },
      subBroker: {
        id: userHier.subBrokerId,
      },
      city: {
        id: data.cityId,
      },
      createdByUser: {
        id: currUser.id,
      },
      remarks: data.remarks,
      tradeAllowedinQty: data.tradeAllowedInQty,
      isIntradayAllowed: data.isIntradayAllowed,
      tradeSquareOffLimit: {
        id: data.tradeSquareOffLimit,
      },
      userType: {
        id: data.userTypeId,
      },
      isDemoId: data.isDemoId,
      userStatus: {
        id: staticProjectSettings.userStatus.id,
      },
      password: data.password,
      m2mSquareOff: data.m2mSquareOff,
      shortMarginSquareOff: data.shortMarginSquareOff,
      m2mSquareOffLimit: data.m2mSquareOffLimit,
      openingBalance: data.transactionLedger.amount,
      openingRemarks: data.transactionLedger.remarks,
    };
    if (data.validTillDate) {
      newUser.validTillDate = data.validTillDate;
    }

    return newUser;
  }

  private async transactionLedgerParser() {
    let staticProjectSettings = await this.getStaticProjectSettings();
    let currUser = await this.curr_user;
    let openingBalanceLedger: any = {
      transactionAmount: this.new_user_data.transactionLedger.amount,
      transactionRemarks: this.new_user_data.transactionLedger.remarks,
      user: {
        id: this.new_user_id,
      },
      createdBy: {
        id: currUser.id,
      },
      updatedBy: {
        id: currUser.id,
      },
      transactionParticular: {
        id: staticProjectSettings.transactionParticular.id,
      },
      transactionType: {
        id: staticProjectSettings.transactionType.id,
      },
      transactionDate: moment().utc().toDate(),
    };
    return openingBalanceLedger;
  }

  private async exchangeSettingsParser() {
    let finalExchangeData: any[] = [];
    let currUserData = await this.curr_user;
    await this.getExchangeMasterData();
    Object.keys(this.new_user_data.exchangeSettings).map((key) => {
      let item = this.new_user_data.exchangeSettings[`${key}`];
      let exchangeId = this.master_exchange_data.find(
        (a) => a.exchangeName == key
      ).id;
      finalExchangeData.push({
        exchange: {
          id: exchangeId,
        },
        exchangeMaxLotSize: item.exchangeMaxLotSize,
        scriptMaxLotSize: item.scriptMaxLotSize,
        tradeMaxLotSize: item.tradeMaxLotSize,
        isExchangeActive: true,
        user: {
          id: this.new_user_id,
        },
        createdBy: {
          id: currUserData.id,
        },
        updatedBy: {
          id: currUserData.id,
        },
      });
    });

    return finalExchangeData;
  }

  private async tradeMarginSettingsParser() {
    let finalTradeMarginData = [];
    let exchangeSettingsData = await this.getExchangeMasterData();
    let currUserData = await this.curr_user;
    exchangeSettingsData.map((item) => {
      if (this.new_user_data.tradeMarginSettings[`${item.exchangeName}`]) {
        finalTradeMarginData.push({
          exchange: {
            id: item.id,
          },
          marginType:
            this.new_user_data.tradeMarginSettings[`${item.exchangeName}`]
              .marginType,
          marginPerLot:
            this.new_user_data.tradeMarginSettings[`${item.exchangeName}`]
              .marginPerLot,
          marginPerCrore:
            this.new_user_data.tradeMarginSettings[`${item.exchangeName}`]
              .marginPerCrore,
          user: {
            id: this.new_user_id,
          },
          createdBy: {
            id: currUserData.id,
          },
          updatedBy: {
            id: currUserData.id,
          },
        });
      }
    });

    return finalTradeMarginData;
  }

  private async brokerageSettingsParser() {
    let finalBrokerageSettingsData = [];
    await this.getExchangeMasterData();
    let masterExchangeData = this.master_exchange_data;
    let exchangeSettingsData = this.new_user_data.exchangeSettings;
    let currUserData = await this.curr_user;
    let currUserBrokerageData = await this.getCurrUserBrokerage();
    console.log('curr user brokerage data is ', currUserBrokerageData);
    Object.keys(exchangeSettingsData).map((item) => {
      if (this.new_user_data.brokerageSettings[`${item}`]) {
        let currUserSettings = currUserBrokerageData.find(
          (a) => a.exchange.exchangeName == item
        );
        let associatedBrokerage = {
          brokerPerCroreAmt: null,
          brokerPerLotAmt: null,
          companyPerCroreAmt: null,
          companyPerLotAmt: null,
          subBrokerPerCroreAmt: null,
          subBrokerPerLotAmt: null,
          masterPerCroreAmt: null,
          masterPerLotAmt: null,
        };

        switch (currUserData.userType.prjSettConstant) {
          case 'Company':
            associatedBrokerage.companyPerCroreAmt =
              this.new_user_data.brokerageSettings[
                `${item}`
              ].brokeragePerCroreAmt;
            associatedBrokerage.companyPerLotAmt =
              this.new_user_data.brokerageSettings[
                `${item}`
              ].brokeragePerLotAmt;
            break;

          case 'Master':
            associatedBrokerage.companyPerCroreAmt =
              currUserSettings.companyPerCroreAmt;
            associatedBrokerage.companyPerLotAmt =
              currUserSettings.companyPerLotAmt;
            associatedBrokerage.masterPerCroreAmt =
              this.new_user_data.brokerageSettings[`${item}`]
                .brokeragePerCroreAmt - currUserSettings.brokeragePerCroreAmt;
            associatedBrokerage.masterPerLotAmt =
              this.new_user_data.brokerageSettings[`${item}`]
                .brokeragePerLotAmt - currUserSettings.brokeragePerLotAmt;
            break;

          case 'Broker':
            associatedBrokerage.companyPerCroreAmt =
              currUserSettings.companyPerCroreAmt;
            associatedBrokerage.companyPerLotAmt =
              currUserSettings.companyPerLotAmt;
            associatedBrokerage.masterPerCroreAmt =
              currUserSettings.masterPerCroreAmt;
            associatedBrokerage.masterPerLotAmt =
              currUserSettings.masterPerCroreAmt;
            associatedBrokerage.brokerPerCroreAmt =
              this.new_user_data.brokerageSettings[`${item}`]
                .brokeragePerCroreAmt - currUserSettings.brokeragePerCroreAmt;
            associatedBrokerage.brokerPerLotAmt =
              this.new_user_data.brokerageSettings[`${item}`]
                .brokeragePerLotAmt - currUserSettings.brokeragePerLotAmt;
            break;

          case 'Sub-Broker':
            associatedBrokerage.companyPerCroreAmt =
              currUserSettings.companyPerCroreAmt;
            associatedBrokerage.companyPerLotAmt =
              currUserSettings.companyPerLotAmt;
            associatedBrokerage.masterPerCroreAmt =
              currUserSettings.masterPerCroreAmt;
            associatedBrokerage.masterPerLotAmt =
              currUserSettings.masterPerCroreAmt;
            associatedBrokerage.brokerPerCroreAmt =
              currUserSettings.brokerPerCroreAmt;
            associatedBrokerage.brokerPerLotAmt =
              currUserSettings.brokerPerLotAmt;
            associatedBrokerage.subBrokerPerCroreAmt =
              this.new_user_data.brokerageSettings[`${item}`]
                .brokeragePerCroreAmt - currUserSettings.brokeragePerCroreAmt;
            associatedBrokerage.subBrokerPerLotAmt =
              this.new_user_data.brokerageSettings[`${item}`]
                .brokeragePerLotAmt - currUserSettings.brokeragePerLotAmt;
            break;
        }

        console.log('associated brokerage is ', associatedBrokerage);

        finalBrokerageSettingsData.push({
          exchange: {
            id: masterExchangeData.find((a) => a.exchangeName == item).id,
          },
          ...associatedBrokerage,
          brokerageType:
            this.new_user_data.brokerageSettings[`${item}`].brokerageType,

          brokeragePerCroreAmt:
            this.new_user_data.brokerageSettings[`${item}`]
              .brokeragePerCroreAmt,
          brokeragePerLotAmt:
            this.new_user_data.brokerageSettings[`${item}`].brokeragePerLotAmt,
          user: {
            id: this.new_user_id,
          },
          createdBy: {
            id: currUserData.id,
          },
          updatedBy: {
            id: currUserData.id,
          },
        });
      }
    });

    return finalBrokerageSettingsData;
  }

  private async plShareParser() {
    let finalPlShareData: any[] = [];
    let exchangeSettingsData = await this.getExchangeMasterData();
    let currUserData = await this.curr_user;
    let currUserPlShare = this.curr_user_pl_share;
    exchangeSettingsData.map((item) => {
      if (this.new_user_data.plShare[`${item.exchangeName}`]) {
        let currUserSettings = currUserPlShare.find(
          (a) => a.exchange.exchangeName == item.exchangeName
        );
        let associatedSharing = {
          brokerSharing: null,
          companySharing: null,
          masterSharing: null,
          subbrokerSharing: null,
        };

        switch (currUserData.userType.prjSettConstant) {
          case 'Company':
            associatedSharing.companySharing =
              this.new_user_data.plShare[`${item.exchangeName}`];
            break;
          case 'Master':
            associatedSharing.companySharing = currUserSettings.companySharing;
            associatedSharing.masterSharing =
              this.new_user_data.plShare[`${item.exchangeName}`];
            break;

          case 'Broker':
            associatedSharing.companySharing = currUserSettings.companySharing;
            associatedSharing.masterSharing = currUserSettings.masterSharing;
            associatedSharing.brokerSharing =
              this.new_user_data.plShare[`${item.exchangeName}`];
            break;

          case 'Sub-Broker':
            associatedSharing.companySharing = currUserSettings.companySharing;
            associatedSharing.masterSharing = currUserSettings.masterSharing;
            associatedSharing.brokerSharing = currUserSettings.brokerSharing;
            associatedSharing.subbrokerSharing =
              this.new_user_data.plShare[`${item.exchangeName}`];
            break;
        }

        finalPlShareData.push({
          exchange: {
            id: item.id,
          },
          ...associatedSharing,
          user: {
            id: this.new_user_id,
          },
          createdBy: {
            id: currUserData.id,
          },
          updatedBy: {
            id: currUserData.id,
          },
        });
      }
    });
    return finalPlShareData;
  }

  private async intradayTradeMarginSettingsParser() {
    let finalIntraMarginData = [];
    let exchangeSettingsData = await this.getExchangeMasterData();
    let currUserData = await this.curr_user;
    exchangeSettingsData.map((item) => {
      if (this.new_user_data.tradeMarginSettings[`${item.exchangeName}`]) {
        finalIntraMarginData.push({
          exchange: {
            id: item.id,
          },
          marginType:
            this.new_user_data.intradayTradeMarginSettings[
              `${item.exchangeName}`
            ].marginType,
          marginPerLot:
            this.new_user_data.intradayTradeMarginSettings[
              `${item.exchangeName}`
            ].marginPerLot,
          marginPerCrore:
            this.new_user_data.intradayTradeMarginSettings[
              `${item.exchangeName}`
            ].marginPerCrore,
          user: {
            id: this.new_user_id,
          },
          createdBy: {
            id: currUserData.id,
          },
          updatedBy: {
            id: currUserData.id,
          },
        });
      }
    });

    return finalIntraMarginData;
  }

  private async watchlistDataParser() {
    let defaultColumnsData = await this.getDefaultWatchlistColumns();
    let finalWatchlistData = [];
    for (let i = 0; i < 4; i++) {
      finalWatchlistData.push({
        name: `Watchlist ${i + 1}`,
        scripts: [],
        index: i + 1,
        columns: defaultColumnsData,
        user: {
          id: this.new_user_id,
        },
      });
    }
    return finalWatchlistData;
  }

  private async userFunctionsParser() {
    let currUser = await this.curr_user;
    if (this.new_user_data.copyUserId != -1) {
      let functions = await this.getCopyUserFunctionMapping();
      let finalFunctionsData = [];
      functions.map((item) => {
        finalFunctionsData.push({
          isAccess: item.isAccess,
          func: {
            id: item.func.id,
          },
          user: {
            id: this.new_user_id,
          },
          createdBy: {
            id: currUser.id,
          },
          updatedBy: {
            id: currUser.id,
          },
        });
      });

      return finalFunctionsData;
    } else {
      let functions = await this.getDefaultFunctionMapping();
      let finalFunctionsData = [];
      functions.map((item) => {
        finalFunctionsData.push({
          isAccess: item.isAccess,
          func: {
            id: item.func.id,
          },
          user: {
            id: this.new_user_id,
          },
          createdBy: {
            id: currUser.id,
          },
          updatedBy: {
            id: currUser.id,
          },
        });
      });

      return finalFunctionsData;
    }
  }

  private async userBidStopSettingsParser() {
    let userBidStopSettings = [];
    let userMcxBidStopSettings = [];
    let currUserId = (await this.curr_user).id;

    let projectSetting = new ProjectSetting([
      'USRBIDCMP',
      'USRSTPCMP',
      'USRMCXBID',
      'USRMCXSTOP',
      'USRMCXNAME',
      'USRCUTSETT',
    ]);
    await projectSetting.getProjectSettingByKeys();

    let projectSettingsData = projectSetting.project_setting_data;

    userBidStopSettings.push({
      user: {
        id: this.new_user_id,
      },
      option: 'Bid Activate',
      cmp: parseFloat(
        projectSettingsData.find((a) => a.prjSettKey == 'USRBIDCMP')
          .prjSettDisplayName
      ),
      createdBy: {
        id: currUserId,
      },
    });

    userBidStopSettings.push({
      user: {
        id: this.new_user_id,
      },
      option: 'Stop Loss Activate',
      cmp: parseFloat(
        projectSettingsData.find((a) => a.prjSettKey == 'USRSTPCMP')
          .prjSettDisplayName
      ),
      createdBy: {
        id: currUserId,
      },
    });

    let mcxScripts = projectSettingsData.filter(
      (a) => a.prjSettKey == 'USRMCXNAME'
    );
    mcxScripts.map((item) => {
      userMcxBidStopSettings.push({
        user: {
          id: this.new_user_id,
        },
        instrumentName: item.prjSettConstant,
        bidValue: parseFloat(
          projectSettingsData.find((a) => a.prjSettKey == 'USRMCXBID')
            .prjSettDisplayName
        ),
        stopLossValue: parseFloat(
          projectSettingsData.find((a) => a.prjSettKey == 'USRMCXSTOP')
            .prjSettDisplayName
        ),
        createdBy: {
          id: currUserId,
        },
      });
    });

    let cuttingSettings = projectSettingsData.filter(
      (a) => a.prjSettKey == 'USRCUTSETT'
    );

    let finalUserCuttingSettings = [];
    cuttingSettings.map((item) => {
      finalUserCuttingSettings.push({
        option: { id: item.id },
        user: { id: this.new_user_id },
        value: item.prjSettConstant,
        createdBy: {
          id: currUserId,
        },
        updatedBy: {
          id: currUserId,
        },
      });
    });

    return {
      userBidStopSettings,
      userMcxBidStopSettings,
      finalUserCuttingSettings,
    };
  }

  private async scriptBrokerageParser() {
    let currUser = await this.curr_user;
    let functions = await this.getCopyUserScriptBrokerageSetting();
    let finalFunctionsData = [];
    functions.map((item) => {
      finalFunctionsData.push({
        instrumentName: item.instrumentName,
        brokerageType: item.brokerageType,
        brokeragePerCroreAmt: item.brokeragePerCroreAmt,
        brokeragePerLotAmt: item.brokeragePerLotAmt,
        user: {
          id: this.new_user_id,
        },
        createdBy: {
          id: currUser.id,
        },
        updatedBy: {
          id: currUser.id,
        },
      });
    });

    return finalFunctionsData;
  }

  private async scriptIntradayMarginParser() {
    let currUser = await this.curr_user;
    let functions = await this.getCopyUserScriptIntradayMarginSetting();
    let finalFunctionsData = [];
    functions.map((item) => {
      finalFunctionsData.push({
        instrumentName: item.instrumentName,
        marginType: item.marginType,
        marginPerCrore: item.marginPerCrore,
        marginPerLot: item.marginPerLot,
        user: {
          id: this.new_user_id,
        },
        createdBy: {
          id: currUser.id,
        },
        updatedBy: {
          id: currUser.id,
        },
      });
    });

    return finalFunctionsData;
  }

  private async scriptTradeMarginParser() {
    let currUser = await this.curr_user;
    let functions = await this.getCopyUserTradeMarginSetting();
    let finalFunctionsData = [];
    functions.map((item) => {
      finalFunctionsData.push({
        instrumentName: item.instrumentName,
        marginType: item.marginType,
        marginPerCrore: item.marginPerCrore,
        marginPerLot: item.marginPerLot,
        user: {
          id: this.new_user_id,
        },
        createdBy: {
          id: currUser.id,
        },
        updatedBy: {
          id: currUser.id,
        },
      });
    });

    return finalFunctionsData;
  }

  private async scriptQuantityParser() {
    let currUser = await this.curr_user;
    let functions = await this.getCopyUserScriptQuantitySetting();
    let finalFunctionsData = [];
    functions.map((item) => {
      finalFunctionsData.push({
        instrumentName: item.instrumentName,
        scriptMaxLotSize: item.scriptMaxLotSize,
        tradeMaxLotSize: item.tradeMaxLotSize,
        active: item.active,
        isDeleted: item.isDeleted,
        user: {
          id: this.new_user_id,
        },
        createdBy: {
          id: currUser.id,
        },
        updatedBy: {
          id: currUser.id,
        },
      });
    });

    return finalFunctionsData;
  }

  private async dataParserService() {
    let [
      transactionLedgerData,
      exchangeSettingsData,
      brokerageSettingsData,
      tradeMarginSettingsData,
      watchlistData,
      functionsData,
      scriptBrokerageData,
      scriptIntradayMarginData,
      scriptTradeMarginData,
      scriptQuantityData,
      userBidStopSettingData,
      intradayMarginData,
      plShareData,
    ] = await Promise.all([
      this.transactionLedgerParser(),
      this.exchangeSettingsParser(),
      this.brokerageSettingsParser(),
      this.tradeMarginSettingsParser(),
      this.watchlistDataParser(),
      this.userFunctionsParser(),
      this.scriptBrokerageParser(),
      this.scriptIntradayMarginParser(),
      this.scriptTradeMarginParser(),
      this.scriptQuantityParser(),
      this.userBidStopSettingsParser(),
      null,
      this.plShareParser(),
    ]);
    let parsedData = {
      transactionLedgerData,
      exchangeSettingsData,
      brokerageSettingsData,
      tradeMarginSettingsData,
      watchlistData,
      functionsData,
      scriptBrokerageData,
      scriptIntradayMarginData,
      scriptTradeMarginData,
      scriptQuantityData,
      userBidStopSettingData,
      intradayMarginData,
      plShareData,
    };

    //step 6 -> creating intra day trade margin settings
    if (this.new_user_data.isIntradayAllowed == true) {
      parsedData.intradayMarginData =
        await this.intradayTradeMarginSettingsParser();
    }

    this.parsed_new_user_data = parsedData;

    return;
  }

  async createUser() {
    let parsedUser = await this.userParser();
    await AppDataSource.manager.transaction(async (manager) => {
      let user = await manager.save(m_user, parsedUser);
      this.new_user_id = await user.id;
      await this.dataParserService();
      //1. creating transaction ledger
      await manager.insert(
        t_usertransactionledger,
        this.parsed_new_user_data.transactionLedgerData
      );

      //2. creating exchange settings data
      await manager.insert(
        m_exchangesetting,
        this.parsed_new_user_data.exchangeSettingsData
      );

      //3.  brokerage settings
      await manager.insert(
        m_userbrokeragesetting,
        this.parsed_new_user_data.brokerageSettingsData
      );

      //4. user trade margin data
      await manager.insert(
        m_trademarginsetting,
        this.parsed_new_user_data.tradeMarginSettingsData
      );

      //5. intraday settings if allowed
      if (
        this.new_user_data.isIntradayAllowed == true &&
        this.parsed_new_user_data.intradayMarginData
      ) {
        await manager.insert(
          m_intradaytrademarginsetting,
          this.parsed_new_user_data.intradayMarginData
        );
      }

      //6. creating watchlist data
      await manager.insert(
        m_userwatchlist,
        this.parsed_new_user_data.watchlistData
      );

      //7. creating default function mapping
      await manager.insert(
        m_userfunctionmapping,
        this.parsed_new_user_data.functionsData
      );

      //8. bid stop loss
      await manager.insert(
        m_userbidstopsettings,
        this.parsed_new_user_data.userBidStopSettingData.userBidStopSettings
      );

      //9. mcx bid stop loss
      await manager.insert(
        m_usermcxbidstopsettings,
        this.parsed_new_user_data.userBidStopSettingData.userMcxBidStopSettings
      );

      //10. cutting settings
      await manager.insert(
        m_usercuttingsettings,
        this.parsed_new_user_data.userBidStopSettingData
          .finalUserCuttingSettings
      );

      //11. pl share data
      await manager.insert(
        m_userplsharing,
        this.parsed_new_user_data.plShareData
      );

      //12. save script brokerage settings
      await manager.insert(
        m_scriptbrokeragesetting,
        this.parsed_new_user_data.scriptBrokerageData
      );

      //13. save script intraday margin setting
      await manager.insert(
        m_scriptintradaymarginsetting,
        this.parsed_new_user_data.scriptIntradayMarginData
      );
      //14. save script trade margin setting
      await manager.insert(
        m_scripttrademarginsetting,
        this.parsed_new_user_data.scriptTradeMarginData
      );

      //14. save script quantity
      await manager.insert(
        m_scriptquantity,
        this.parsed_new_user_data.scriptQuantityData
      );

      //15. save user count settings
      await manager.insert(m_usercreationcount, {
        brokerCount: this.new_user_data.brokerCount,
        subBrokerCount: this.new_user_data.subBrokerCount,
        clientCount: this.new_user_data.clientCount,
        user: { id: this.new_user_id },
      });
    });
    return this.new_user_id;
  }
}

export default CreateUser;
