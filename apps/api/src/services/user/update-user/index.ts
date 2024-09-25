import moment from 'moment';
import User from 'entity/user';
import Rent from 'entity/rent';
import ExchangeSetting from 'entity/exchange-settings';
import BrokerageSetting from 'entity/brokerage-settings';
import MarginSetting from 'entity/margin-settings';
import PlShare from 'entity/plshare';
import { ExchangeSettingsBody } from '../../../controllers/user/update-user/validations';
import { AppDataSource } from 'database/sql';
import { logger } from '../../../logger';
import redisClient from 'lib/redis';

class UpdateUserService {
  public static async basicDetails(
    data: {
      userId: number;
      firstName: string;
      lastName: string;
      email: string;
      mobileNumber: string;
      city: number;
      tradeSquareOffLimit: number;
      validTillDate: Date | null;
    },
    currUser: {
      id: number;
      username: string;
    }
  ) {
    const user = new User({ userId: data.userId });
    // new rent - prev rent
    await AppDataSource.transaction(async (tmanager) => {
      user.setTransactionManager(tmanager);
      await Promise.all([
        user.updateUserDetails({
          city: data.city,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          mobileNumber: data.mobileNumber,
          tradeSquareOffLimit: Number(data.tradeSquareOffLimit),
          updatedBy: currUser.id,
          validTillDate:
            data.validTillDate == null
              ? data.validTillDate
              : moment(data.validTillDate).toDate(),
        }),
      ]);
    });
  }

  public static async tradeSettings(
    data: ExchangeSettingsBody,
    currUser: {
      id: number;
      username: string;
    }
  ) {
    logger.info(`update user trade settings called ${data.userId}`);
    const user = new User({ userId: data.userId });
    const parent = await user.getParentUser();
    const parent_data = await parent.getUserData();
    const exchangeNames = ['NSE', 'MCX', 'FX', 'Options'];
    const allExchange = await new ExchangeSetting({}).getAllExchanges();
    // company settings cannot be updated
    if (!parent) {
      throw new Error(`Cannot Update Company Settings ${data.userId}`);
    }
    const parent_exchange = new ExchangeSetting({
      userId: parent.userId,
    });
    const parent_brokerage = new BrokerageSetting({ userId: parent.userId });
    const parent_margin = new MarginSetting({ userId: parent.userId });
    const parent_plshare = new PlShare({ userId: parent.userId });
    const [
      parent_exchange_data,
      parent_brokerage_settings,
      parent_trade_margin,
      parent_intraday_margin,
      parent_intraday,
      parent_plshare_data,
    ] = await Promise.all([
      parent_exchange.getExchangeSetting(),
      parent_brokerage.getBrokerageSettings(),
      parent_margin.getTradeMarginSettings(),
      parent_margin.getIntradayMarginSettings(),
      parent.getIsIntradayAllowed(),
      parent_plshare.getPlShareData(),
    ]);
    // check if user violates any parent exchange settings
    // get all exchanges allowed for that child
    // check rules in those exchanges
    exchangeNames.forEach((exchangeName) => {
      if (!data[exchangeName]) return;
      if (data[exchangeName].exchangeAllowed) {
        let _exchange = parent_exchange_data.filter((e) => {
          return e.exchange.exchangeName == exchangeName;
        });
        // checks for exchange settings
        if (_exchange.length > 0) {
          if (_exchange[0].isExchangeActive == false) {
            throw new Error(
              `You cannot set ${exchangeName} exchange settings as you are not allowed to trade in ${exchangeName} exchange`
            );
          } else {
            // allowed checks passed
            // exchnage settings checks starts
            if (
              data[exchangeName].exchangeMaxLotSize <
                data[exchangeName].scriptMaxLotSize ||
              data[exchangeName].exchangeMaxLotSize <
                data[exchangeName].tradeMaxLotSize ||
              data[exchangeName].scriptMaxLotSize <
                data[exchangeName].tradeMaxLotSize
            ) {
              throw new Error(
                `NSE Exchange Max Lot size, Script Max Lot size and Trade Max Lot size should be in ascending order`
              );
            }

            if (
              _exchange[0].exchangeMaxLotSize <
              data[exchangeName].exchangeMaxLotSize
            ) {
              throw new Error(
                `${exchangeName} Exchange Max Lot size child can't be greater than parent`
              );
            } else if (
              _exchange[0].scriptMaxLotSize <
              data[exchangeName].scriptMaxLotSize
            ) {
              throw new Error(
                `${exchangeName} Script Max Lot size child can't be greater than parent`
              );
            } else if (
              _exchange[0].tradeMaxLotSize < data[exchangeName].tradeMaxLotSize
            ) {
              throw new Error(
                `${exchangeName} Trade Max Lot size child can't be greater than parent`
              );
            }

            // exchange settings checks passed
            // brokerage settings checks starts
            const _brokerage = parent_brokerage_settings.filter((e) => {
              return e.exchange.exchangeName == exchangeName;
            });
            if (_brokerage.length > 0) {
              if (
                _brokerage[0].brokeragePerCroreAmt >
                data[exchangeName].brokeragePerCroreAmt
              ) {
                throw new Error(
                  `${exchangeName} Brokerage Per crore of child can't be less than parent`
                );
              }
              if (
                _brokerage[0].brokeragePerLotAmt >
                data[exchangeName].brokeragePerLotAmt
              ) {
                throw new Error(
                  `${exchangeName} Brokerage Per lot of child can't be less than parent`
                );
              }
            } else {
              throw new Error(
                `brokerage is not set for ${exchangeName} exchange`
              );
            }
            // brokerage settings checks passed

            // margin settings checks start
            const _margin = parent_trade_margin.filter((e) => {
              return e.exchange.exchangeName == exchangeName;
            });
            const _intraday_margin = parent_intraday_margin.filter((e) => {
              return e.exchange.exchangeName == exchangeName;
            });
            if (_margin.length > 0) {
              if (
                _margin[0].marginPerCrore > data[exchangeName].marginPerCrore
              ) {
                throw new Error(
                  `${exchangeName} Margin Per crore of child can't be less than parent`
                );
              }
              if (_margin[0].marginPerLot > data[exchangeName].marginPerLot) {
                throw new Error(
                  `${exchangeName} Margin Per lot of child can't be less than parent`
                );
              }
              if (data.isIntradayAllowed) {
                if (parent_intraday == false) {
                  throw new Error(
                    `You cannot allow intraday if parent is not allowed to trade in intraday`
                  );
                }
                if (_intraday_margin.length > 0) {
                  if (
                    _intraday_margin[0].marginPerCrore >
                    data[exchangeName].intraday.marginPerCrore
                  ) {
                    throw new Error(
                      `${exchangeName} Intraday Margin Per crore of child can't be less than parent`
                    );
                  }
                  if (
                    _intraday_margin[0].marginPerLot >
                    data[exchangeName].intraday.marginPerLot
                  ) {
                    throw new Error(
                      `${exchangeName} Intraday Margin Per lot of child can't be less than parent`
                    );
                  }
                } else {
                  throw new Error(
                    `Intraday margin is not set for ${exchangeName} exchange`
                  );
                }
              }
            } else {
              throw new Error(`margin is not set for ${exchangeName} exchange`);
            }
            // margin settings checks passed

            // other settings checks start
            if (
              !parent_data.tradeAllowedinQty &&
              data.tradeAllowedInQuantityNSE
            ) {
              throw new Error(
                `You cannot allow trade in quantity as parent is not allowed to trade in quantity`
              );
            }
            if (
              parent_data.shortMarginSquareOff &&
              !data.shortMarginSquareOff
            ) {
              throw new Error(
                `You cannot disallow short margin square off as parent is allowed to short margin square off`
              );
            }
            if (parent_data.maxLossCap < data.maximumLossPercentageCap) {
              throw new Error(
                `Maximum loss percentage cap of child can't be greater than parent`
              );
            }
            if (parent_data.m2mSquareOff && !data.m2mSquareOff) {
              throw new Error(
                `You cannot disallow m2m square off as parent is allowed to m2m square off`
              );
            }
            if (parent_data.m2mSquareOffLimit > data.m2mSquareOffLimit) {
              throw new Error(
                `M2M square off limit of child can't be less than parent`
              );
            }
            // other settings checks passed
            // pl share checks start
            if (data[exchangeName].plShare > 100) {
              throw new Error(`Pl share can't be greater than 100`);
            }
          }
        } else {
          throw new Error(
            `You cannot set ${exchangeName} exchange settings as you are not allowed to trade in ${exchangeName} exchange`
          );
        }
      }
    });
    logger.info(`update user trade settings rules passed ${data.userId}`);
    // rules passed
    // update exchange settings of user
    const user_exchange = new ExchangeSetting({
      userId: data.userId,
    });
    const user_brokerage = new BrokerageSetting({ userId: data.userId });
    const user_margin = new MarginSetting({ userId: data.userId });
    const user_plshare = new PlShare({ userId: data.userId });
    const [
      user_exchange_data,
      user_brokerage_settings,
      user_trade_margin,
      user_intraday_margin,
      user_plshare_data,
    ] = await Promise.all([
      user_exchange.getExchangeSetting(),
      user_brokerage.getBrokerageSettings(),
      user_margin.getTradeMarginSettings(),
      user_margin.getIntradayMarginSettings(),
      user_plshare.getPlShareData(),
    ]);
    // child users
    let child_users: any = await user.getAllChildUsers();
    child_users = [...child_users.map((e) => e.id)];
    // update exchange settings

    await AppDataSource.transaction(async (tmanager) => {
      user.setTransactionManager(tmanager);
      user_exchange.setTransactionManager(tmanager);
      user_brokerage.setTransactionManager(tmanager);
      user_margin.setTransactionManager(tmanager);
      user_plshare.setTransactionManager(tmanager);

      await Promise.all(
        exchangeNames.map(async (exchangeName) => {
          // get exchange id
          const exchangeId = allExchange.filter((e) => {
            return e.exchangeName == exchangeName;
          })[0].id;
          if (!data[exchangeName] || !data[exchangeName].exchangeAllowed) {
            logger.info(
              `disabling user exchange settings exchangeName: ${exchangeName} , exchangeId: ${exchangeId}`
            );
            // disable exchange of all childs and self as well
            let disableChilds = new ExchangeSetting({});
            disableChilds.setTransactionManager(tmanager);
            await disableChilds.disableAllChildsExchanges(
              [...child_users, data.userId],
              exchangeId
            );
            // To-Do off + other settings
          } else {
            // ---- exchange settings update starts
            let _data = user_exchange_data.filter((e) => {
              return e.exchange.exchangeName == exchangeName;
            });
            if (_data.length > 0) {
              logger.info(
                `updating user and its child exchange settings id: ${_data[0].id} , exchangeAllowed: ${data[exchangeName].exchangeAllowed},
              exchangeMaxLotSize: ${data[exchangeName].exchangeMaxLotSize},
              scriptMaxLotSize: ${data[exchangeName].scriptMaxLotSize}, exchangName: ${exchangeName}`
              );
              await user_exchange.updateExchangeSetting({
                id: _data[0].id,
                exchangeAllowed: data[exchangeName].exchangeAllowed,
                exchangeMaxLotSize: data[exchangeName].exchangeMaxLotSize,
                scriptMaxLotSize: data[exchangeName].scriptMaxLotSize,
                tradeMaxLotSize: data[exchangeName].tradeMaxLotSize,
              });
              if (child_users.length > 0) {
                await user_exchange.updateAllChildsExchangeSetting({
                  child: child_users,
                  exchangeMaxLotSize: data[exchangeName].exchangeMaxLotSize,
                  scriptMaxLotSize: data[exchangeName].scriptMaxLotSize,
                  tradeMaxLotSize: data[exchangeName].tradeMaxLotSize,
                  exchangeId,
                });
                await user_exchange.updateAllChildsScriptExchangeSetting({
                  child: child_users,
                  scriptMaxLotSize: data[exchangeName].scriptMaxLotSize,
                  tradeMaxLotSize: data[exchangeName].tradeMaxLotSize,
                  exchangeId,
                });
              }
            } else {
              logger.info(
                `creating user exchange settings exchangeAllowed: ${data[exchangeName].exchangeAllowed},
              exchangeMaxLotSize: ${data[exchangeName].exchangeMaxLotSize},
              scriptMaxLotSize: ${data[exchangeName].scriptMaxLotSize}, exchangName: ${exchangeName}`
              );
              // create
              await user_exchange.createExchangeSetting({
                exchangeId,
                exchangeAllowed: data[exchangeName].exchangeAllowed,
                exchangeMaxLotSize: data[exchangeName].exchangeMaxLotSize,
                scriptMaxLotSize: data[exchangeName].scriptMaxLotSize,
                tradeMaxLotSize: data[exchangeName].tradeMaxLotSize,
              });
            }
            // ----- exchange settings update ends

            // ----- brokerage settings update starts
            let _brokerage = user_brokerage_settings.filter((e) => {
              return e.exchange.exchangeName == exchangeName;
            });
            let _parent_brokerage = parent_brokerage_settings.filter((e) => {
              return e.exchange.exchangeName == exchangeName;
            });
            let {
              userType: { prjSettConstant: parent_user_type },
            } = await parent.getUserData({
              userType: true,
            });
            let {
              userType: { prjSettConstant: user_user_type },
            } = await user.getUserData({
              userType: true,
            });
            let childMinBrokerageGap = await new BrokerageSetting(
              {}
            ).minChildBrokerageOfParent({
              childIds: child_users,
              parentType: user_user_type,
              exchangeId: exchangeId,
            });

            if (_brokerage.length > 0) {
              let changeCrAmt =
                data[exchangeName].brokeragePerCroreAmt -
                _brokerage[0].brokeragePerCroreAmt;
              let changeLotAmt =
                data[exchangeName].brokeragePerLotAmt -
                _brokerage[0].brokeragePerLotAmt;
              if (
                childMinBrokerageGap.cr != null &&
                changeCrAmt > childMinBrokerageGap.cr
              ) {
                const message = `${exchangeName} can't increase brokerage to this amount ${childMinBrokerageGap.cr}`;
                throw new Error(message);
              }
              if (
                childMinBrokerageGap.lot != null &&
                changeLotAmt > childMinBrokerageGap.lot
              ) {
                const message = `${exchangeName} can't increase brokerage to this amount ${childMinBrokerageGap.cr}`;
                throw new Error(message);
              }
              // TODO: update user brokerage
              await user_brokerage.updateBrokerageSettings({
                id: _brokerage[0].id,
                brokerageType: data[exchangeName].brokerageType,
                brokeragePerCroreAmt: data[exchangeName].brokeragePerCroreAmt,
                oldBrokeragePerCroreAmt: _brokerage[0].brokeragePerCroreAmt,
                brokeragePerLotAmt: data[exchangeName].brokeragePerLotAmt,
                oldBrokeragePerLotAmt: _brokerage[0].brokeragePerLotAmt,
                parentUserType: parent_user_type,
                parentData: {
                  companyPerCroreAmt: _parent_brokerage[0].companyPerCroreAmt,
                  companyPerLotAmt: _parent_brokerage[0].companyPerLotAmt,
                  masterPerCroreAmt: _parent_brokerage[0].masterPerCroreAmt,
                  masterPerLotAmt: _parent_brokerage[0].masterPerLotAmt,
                  brokerPerCroreAmt: _parent_brokerage[0].brokerPerCroreAmt,
                  brokerPerLotAmt: _parent_brokerage[0].brokerPerLotAmt,
                  subBrokerPerCroreAmt:
                    _parent_brokerage[0].subBrokerPerCroreAmt,
                  subBrokerPerLotAmt: _parent_brokerage[0].subBrokerPerLotAmt,
                },
              });
              // TODO: update all childs brokerage
              if (child_users.length > 0) {
                await user_brokerage.updateAllChildsBrokerageSettings({
                  childIds: child_users,
                  exchangeId,
                  brokeragePerCroreAmt: data[exchangeName].brokeragePerCroreAmt,
                  brokeragePerLotAmt: data[exchangeName].brokeragePerLotAmt,
                  parentUserType: parent_user_type,
                  userUserType: user_user_type,
                  userData: {
                    brokeragePerCroreAmt: _brokerage[0].brokeragePerCroreAmt,
                    brokeragePerLotAmt: _brokerage[0].brokeragePerLotAmt,
                    companyPerCroreAmt: _brokerage[0].companyPerCroreAmt,
                    companyPerLotAmt: _brokerage[0].companyPerLotAmt,
                    masterPerCroreAmt: _brokerage[0].masterPerCroreAmt,
                    masterPerLotAmt: _brokerage[0].masterPerLotAmt,
                    brokerPerCroreAmt: _brokerage[0].brokerPerCroreAmt,
                    brokerPerLotAmt: _brokerage[0].brokerPerLotAmt,
                    subBrokerPerCroreAmt: _brokerage[0].subBrokerPerCroreAmt,
                    subBrokerPerLotAmt: _brokerage[0].subBrokerPerLotAmt,
                  },
                });
                // TODO: update all childs script brokerage
                await user_brokerage.updateAllChildsScriptBrokerageSettings({
                  childIds: child_users,
                  exchangeId,
                  brokeragePerCroreAmt: data[exchangeName].brokeragePerCroreAmt,
                  brokeragePerLotAmt: data[exchangeName].brokeragePerLotAmt,
                  parentUserType: parent_user_type,
                  userUserType: user_user_type,
                  userData: {
                    brokeragePerCroreAmt: _brokerage[0].brokeragePerCroreAmt,
                    brokeragePerLotAmt: _brokerage[0].brokeragePerLotAmt,
                    companyPerCroreAmt: _brokerage[0].companyPerCroreAmt,
                    companyPerLotAmt: _brokerage[0].companyPerLotAmt,
                    masterPerCroreAmt: _brokerage[0].masterPerCroreAmt,
                    masterPerLotAmt: _brokerage[0].masterPerLotAmt,
                    brokerPerCroreAmt: _brokerage[0].brokerPerCroreAmt,
                    brokerPerLotAmt: _brokerage[0].brokerPerLotAmt,
                    subBrokerPerCroreAmt: _brokerage[0].subBrokerPerCroreAmt,
                    subBrokerPerLotAmt: _brokerage[0].subBrokerPerLotAmt,
                  },
                });
              }
            } else {
              // create
              if (parent_user_type == 'Company') {
                await user_brokerage.createBrokerageSettings({
                  exchangeId,
                  brokerageType: data[exchangeName].brokerageType,
                  brokeragePerCroreAmt: data[exchangeName].brokeragePerCroreAmt,
                  brokeragePerLotAmt: data[exchangeName].brokeragePerLotAmt,
                  companyPerCroreAmt: data[exchangeName].brokeragePerCroreAmt,
                  companyPerLotAmt: data[exchangeName].brokeragePerLotAmt,
                  masterPerCroreAmt: null,
                  masterPerLotAmt: null,
                  brokerPerCroreAmt: null,
                  brokerPerLotAmt: null,
                  subBrokerPerCroreAmt: null,
                  subBrokerPerLotAmt: null,
                });
              } else if (parent_user_type == 'Master') {
                await user_brokerage.createBrokerageSettings({
                  exchangeId,
                  brokerageType: data[exchangeName].brokerageType,
                  brokeragePerCroreAmt: data[exchangeName].brokeragePerCroreAmt,
                  brokeragePerLotAmt: data[exchangeName].brokeragePerLotAmt,
                  companyPerCroreAmt:
                    parent_brokerage_settings[0].companyPerCroreAmt,
                  companyPerLotAmt:
                    parent_brokerage_settings[0].companyPerLotAmt,
                  masterPerCroreAmt:
                    data[exchangeName].brokeragePerCroreAmt -
                    parent_brokerage_settings[0].brokeragePerCroreAmt,
                  masterPerLotAmt:
                    data[exchangeName].brokeragePerLotAmt -
                    parent_brokerage_settings[0].brokeragePerLotAmt,
                  brokerPerCroreAmt: null,
                  brokerPerLotAmt: null,
                  subBrokerPerCroreAmt: null,
                  subBrokerPerLotAmt: null,
                });
              } else if (parent_user_type == 'Broker') {
                await user_brokerage.createBrokerageSettings({
                  exchangeId,
                  brokerageType: data[exchangeName].brokerageType,
                  brokeragePerCroreAmt: data[exchangeName].brokeragePerCroreAmt,
                  brokeragePerLotAmt: data[exchangeName].brokeragePerLotAmt,
                  companyPerCroreAmt:
                    parent_brokerage_settings[0].companyPerCroreAmt,
                  companyPerLotAmt:
                    parent_brokerage_settings[0].companyPerLotAmt,
                  masterPerCroreAmt:
                    parent_brokerage_settings[0].masterPerCroreAmt,
                  masterPerLotAmt: parent_brokerage_settings[0].masterPerLotAmt,
                  brokerPerCroreAmt:
                    data[exchangeName].brokeragePerCroreAmt -
                    parent_brokerage_settings[0].brokeragePerCroreAmt,
                  brokerPerLotAmt:
                    data[exchangeName].brokeragePerLotAmt -
                    parent_brokerage_settings[0].brokeragePerLotAmt,
                  subBrokerPerCroreAmt: null,
                  subBrokerPerLotAmt: null,
                });
              } else if (parent_user_type == 'Sub-Broker') {
                await user_brokerage.createBrokerageSettings({
                  exchangeId,
                  brokerageType: data[exchangeName].brokerageType,
                  brokeragePerCroreAmt: data[exchangeName].brokeragePerCroreAmt,
                  brokeragePerLotAmt: data[exchangeName].brokeragePerLotAmt,
                  companyPerCroreAmt:
                    parent_brokerage_settings[0].companyPerCroreAmt,
                  companyPerLotAmt:
                    parent_brokerage_settings[0].companyPerLotAmt,
                  masterPerCroreAmt:
                    parent_brokerage_settings[0].masterPerCroreAmt,
                  masterPerLotAmt: parent_brokerage_settings[0].masterPerLotAmt,
                  brokerPerCroreAmt:
                    parent_brokerage_settings[0].brokerPerCroreAmt,
                  brokerPerLotAmt: parent_brokerage_settings[0].brokerPerLotAmt,
                  subBrokerPerCroreAmt:
                    data[exchangeName].brokeragePerCroreAmt -
                    parent_brokerage_settings[0].brokeragePerCroreAmt,
                  subBrokerPerLotAmt:
                    data[exchangeName].brokeragePerLotAmt -
                    parent_brokerage_settings[0].brokeragePerLotAmt,
                });
              }
            }

            // ----- brokerage settings update ends
            // ----- margin settings update starts
            let _margin = user_trade_margin.filter((e) => {
              return e.exchange.exchangeName == exchangeName;
            });
            let _intraday_margin = user_intraday_margin.filter((e) => {
              return e.exchange.exchangeName == exchangeName;
            });
            if (_margin.length > 0) {
              // update user margin
              await user_margin.updateTradeMarginSettings({
                id: _margin[0].id,
                marginType: data[exchangeName].marginType,
                marginPerCrore: data[exchangeName].marginPerCrore,
                marginPerLot: data[exchangeName].marginPerLot,
              });
              // update all childs margin
              if (child_users.length > 0) {
                await Promise.all([
                  user_margin.updateAllChildsMarginSetting({
                    child: child_users,
                    marginPerCrore: data[exchangeName].marginPerCrore,
                    marginPerLot: data[exchangeName].marginPerLot,
                    exchangeId,
                  }),
                  user_margin.updateAllChildsScriptMarginSetting({
                    child: child_users,
                    marginPerCrore: data[exchangeName].marginPerCrore,
                    marginPerLot: data[exchangeName].marginPerLot,
                    exchangeId,
                  }),
                ]);
              }
            } else {
              // create
              await user_margin.createTradeMarginSettings({
                exchangeId,
                marginType: data[exchangeName].marginType,
                marginPerCrore: data[exchangeName].marginPerCrore,
                marginPerLot: data[exchangeName].marginPerLot,
                userId: data.userId,
              });
            }
            if (data.isIntradayAllowed) {
              await user.updateIsIntradayAllowed(true);
              if (_intraday_margin.length > 0) {
                // update
                await user_margin.updateIntradayMarginSettings({
                  id: _intraday_margin[0].id,
                  marginType: data[exchangeName].marginType,
                  marginPerCrore: data[exchangeName].intraday.marginPerCrore,
                  marginPerLot: data[exchangeName].intraday.marginPerLot,
                });
                // update all childs margin
                if (child_users.length > 0) {
                  await Promise.all([
                    user_margin.updateAllChildsIntradayMarginSetting({
                      child: child_users,
                      marginPerCrore:
                        data[exchangeName].intraday.marginPerCrore,
                      marginPerLot: data[exchangeName].intraday.marginPerLot,
                      exchangeId,
                    }),
                    user_margin.updateAllChildsScriptIntradayMarginSetting({
                      child: child_users,
                      marginPerCrore:
                        data[exchangeName].intraday.marginPerCrore,
                      marginPerLot: data[exchangeName].intraday.marginPerLot,
                      exchangeId,
                    }),
                  ]);
                }
              } else {
                // create
                await user_margin.createIntradayMarginSettings({
                  exchangeId,
                  marginPerCrore: data[exchangeName].intraday.marginPerCrore,
                  marginPerLot: data[exchangeName].intraday.marginPerLot,
                  userId: data.userId,
                });
                // turn on user intraday
              }
            } else {
              await user.updateIsIntradayAllowed(false);
            }
            // ----- margin settings update ends

            // ----- other settings update starts
            await user.updateUserDetails({
              m2mSquareOff: data.m2mSquareOff,
              m2mSquareOffLimit: data.m2mSquareOffLimit,
              shortMarginSquareOff: data.shortMarginSquareOff,
              tradeAllowedinQty: data.tradeAllowedInQuantityNSE,
            });
            // ----- other settings update ends

            // ----- PL Sharing update starts
            const _plshare = user_plshare_data.filter((e) => {
              return e.exchange.exchangeName == exchangeName;
            });
            if (_plshare.length > 0) {
              console.log('pl share update', _plshare);
              let _prevPlShare = null;
              if (user_user_type == 'Master') {
                _prevPlShare = _plshare[0].companySharing;
              } else if (user_user_type == 'Broker') {
                _prevPlShare = _plshare[0].masterSharing;
              } else if (user_user_type == 'Sub-Broker') {
                _prevPlShare = _plshare[0].brokerSharing;
              }
              if (user_user_type == 'Client') {
                _prevPlShare =
                  _plshare[0].subbrokerSharing ||
                  _plshare[0].brokerSharing ||
                  _plshare[0].masterSharing ||
                  _plshare[0].companySharing;
                // if(_plshare[0].companySharing + _plshare[0].masterSharing + _plshare[0].brokerSharing + _plshare[0].subbrokerSharing != 100)
                // throw new Error(
                //   'You cannot update pl of client you can only update sharing'
                // );
              }
              const minChildPlShare = await user_plshare.getMinChildPlShare({
                exchangeId,
                userType: user_user_type,
                childIds: child_users,
              });
              console.log('min child pl share', minChildPlShare);
              if (minChildPlShare < data[exchangeName].plShare - _prevPlShare) {
                throw new Error(
                  `Cant Increase PL Share more than ${
                    minChildPlShare + _prevPlShare
                  }`
                );
              } else {
                if (data[exchangeName].plShare == _prevPlShare) {
                  return;
                }
                await user_plshare.updatePlShare({
                  id: _plshare[0].id,
                  userType: user_user_type,
                  parentType: parent_user_type,
                  plShare: data[exchangeName].plShare,
                });
                // update all childs pl share
                if (child_users.length > 0) {
                  await user_plshare.updateAllChildsPlShare({
                    Ids: child_users,
                    newSharing: data[exchangeName].plShare,
                    parentType: parent_user_type,
                    prevSharing: _prevPlShare,
                    exchangeId,
                    userType: user_user_type,
                  });
                }
              }
              // update
            } else {
              // create
              await user_plshare.createPlShare({
                exchangeId,
                parentType: parent_user_type,
                userType: user_user_type,
                plShare: data[exchangeName].plShare,
                parentSharing: {
                  companySharing:
                    parent_plshare_data[0]?.companySharing || null,
                  masterSharing: parent_plshare_data[0]?.masterSharing || null,
                  brokerSharing: parent_plshare_data[0]?.brokerSharing || null,
                  subbrokerSharing:
                    parent_plshare_data[0]?.subbrokerSharing || null,
                },
              });
              // create acc to parent
            }
            // ----- PL Sharing update ends
          }
        })
      );
    });

    await redisClient.hSet(`m2m-user-${data.userId}`, {
      ['allowed']: data.m2mSquareOff ? 'true' : 'false',
      ['value']: data.m2mSquareOffLimit,
    });
  }

  public static async smSquareOff(
    data: { userId: number; smSquareOff: boolean },
    currUserId: number
  ) {
    let user = new User({ userId: data.userId });
    let userParent = await user.getParentUser();

    if (data.smSquareOff == true) {
      let childUsers = await user.getAllChildUsers();
      let childIds = childUsers.map((a) => a.id);

      await user.updateUserDetails({ shortMarginSquareOff: data.smSquareOff });
      await user.updateChildIdsFlags({
        childIds,
        smSquareOff: data.smSquareOff,
      });
    } else {
      let userParentData = await userParent.getUserData();
      if (userParentData.shortMarginSquareOff == true) {
        throw new Error('Short Margin Sqaure Off enabled for parent.');
      }
      await user.updateUserDetails({ shortMarginSquareOff: data.smSquareOff });
    }
    return;
  }

  public static async onlySquareOff(
    data: { userId: number; onlySquareOff: boolean },
    currUserId: number
  ) {
    let user = new User({ userId: data.userId });
    let userParent = await user.getParentUser();

    if (data.onlySquareOff == true) {
      let childUsers = await user.getAllChildUsers();
      let childIds = childUsers.map((a) => a.id);

      await user.updateUserDetails({ onlySquareOff: data.onlySquareOff });
      await user.updateChildIdsFlags({
        childIds,
        smSquareOff: data.onlySquareOff,
      });
    } else {
      let userParentData = await userParent.getUserData();
      if (userParentData.onlySquareOff == true) {
        throw new Error('Only Sqaure Off enabled for parent.');
      }
      await user.updateUserDetails({ onlySquareOff: data.onlySquareOff });
    }
    return;
  }

  public static async m2mSquareOff(
    data: { userId: number; m2mSquareOff: boolean },
    currUserId: number
  ) {
    let user = new User({ userId: data.userId });
    let userParent = await user.getParentUser();

    if (data.m2mSquareOff == true) {
      let childUsers = await user.getAllChildUsers();
      let childIds = childUsers.map((a) => a.id);

      await user.updateUserDetails({ m2mSquareOff: data.m2mSquareOff });
      await user.updateChildIdsFlags({
        childIds,
        m2mSquareOff: data.m2mSquareOff,
      });
    } else {
      let userParentData = await userParent.getUserData();
      if (userParentData.m2mSquareOff == true) {
        throw new Error('M2M Sqaure Off enabled for parent.');
      }
      await user.updateUserDetails({ m2mSquareOff: data.m2mSquareOff });
    }
    return;
  }
}

export default UpdateUserService;
