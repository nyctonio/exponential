import { m_scriptbrokeragesetting } from 'database/sql/schema';
import BrokerageSettings from 'entity/brokerage-settings';
import Instruments from 'entity/instruments';
import ExchangeSetting from 'entity/exchange-settings';
import Watchlist from 'entity/watchlist';
import User from 'entity/user';
import { AppDataSource } from 'database/sql';
import { UpdateBrokerage } from '../../../controllers/advance-settings/brokerage/validation';
import { redisClient } from '../../../lib/redis';

class BrokerageService {
  public static async getScriptBrokerageSettings(user_id: number) {
    let userBrokerageSettings = new BrokerageSettings({ userId: user_id });
    let user = new User({ userId: user_id });
    let userData = await user.getUserData({ createdByUser: true });
    let allowedExchanges = await user.getAllowedExchanges();
    let allowedExchangesName = allowedExchanges.data.exchange.map((a) =>
      a.exchange.exchangeName == 'NSE' ? 'NFO' : a.exchange.exchangeName
    );
    // console.log('user data is ', userData);
    let uplineBrokerageSettings = new BrokerageSettings({
      userId: userData.createdByUser.id,
    });
    let instruments = await new Watchlist(
      null,
      redisClient
    ).getMasterInstrumentsGroupedByName(allowedExchangesName);

    let [
      userDefaultBrokerageData,
      uplineDefaultBrokerageData,
      uplineScriptBrokerageSettings,
      userScriptBrokerageSettings,
    ] = await Promise.all([
      userBrokerageSettings.getBrokerageSettings(),
      uplineBrokerageSettings.getBrokerageSettings(),
      uplineBrokerageSettings.getScriptBrokerageSettings(),
      userBrokerageSettings.getScriptBrokerageSettings(),
    ]);

    let finalData = [];
    instruments.map((item) => {
      let tempObj = { ...item };
      tempObj['selfBrokerage'] = userScriptBrokerageSettings.find(
        (a) => a.instrumentName == item.name
      );
      tempObj['uplineBrokerage'] = uplineScriptBrokerageSettings.find(
        (a) => a.instrumentName == item.name
      );
      finalData.push(tempObj);
    });
    return {
      instrumentData: finalData,
      uplineDefaultBrokerage: uplineDefaultBrokerageData,
      selfDefaultBrokerage: userDefaultBrokerageData,
    };
  }

  public static async updateBrokerageSettings(data: UpdateBrokerage) {
    const user = new User({ userId: data.userId });
    const user_data = await user.getUserData({
      createdByUser: true,
      userType: true,
    });
    const parent = new User({
      userId: user_data.createdByUser.id,
    });
    const parent_data = await parent.getUserData({
      userType: true,
    });
    const child_users = await user.getAllChildUsers();
    const instruments = new Instruments();
    const instruments_data = await instruments.getInstruments({
      names: data.instruments.map((d) => {
        return d.name;
      }),
    });
    const exchange = new ExchangeSetting({ userId: data.userId });
    const all_exchanges = await exchange.getAllExchanges();

    const user_brokerage = new BrokerageSettings({ userId: data.userId });
    const user_brokerage_data = await user_brokerage.getBrokerageSettings();
    const user_script_brokerage_data =
      await user_brokerage.getScriptBrokerageSettingsByName({
        names: data.instruments.map((a) => a.name),
      });
    const parent_brokerage = new BrokerageSettings({
      userId: user_data.createdByUser.id,
    });
    const parent_brokerage_data = await parent_brokerage.getBrokerageSettings();
    const parent_script_brokerage_data =
      await parent_brokerage.getScriptBrokerageSettingsByName({
        names: data.instruments.map((a) => a.name),
      });
    const parent_user_type = parent_data.userType.prjSettConstant;
    const user_user_type = user_data.userType.prjSettConstant;

    // check if any instrument is not found
    console.log('data', data.instruments);
    if (instruments_data.length != data.instruments.length) {
      throw new Error('Some instruments are invalid');
    }
    // add exchange names in instruments
    const instruments_with_exchange = data.instruments.map((item) => {
      let tempObj: {
        name: string;
        brokerage: {
          brokeragePerCroreAmt: number;
          brokeragePerLotAmt: number;
          brokerageType: 'lot' | 'crore';
          exchange: string;
        };
      } = {
        name: item.name,
        brokerage: {
          brokeragePerCroreAmt: item.brokerage.brokeragePerCroreAmt,
          brokeragePerLotAmt: item.brokerage.brokeragePerLotAmt,
          brokerageType: item.brokerage.brokerageType,
          exchange: null,
        },
      };
      tempObj.brokerage['exchange'] = instruments_data.find(
        (a) => a.name == item.name
      ).exchange;
      return tempObj;
    });

    let all_exchanges_with_instruments = [];
    all_exchanges.forEach((exchange) => {
      // if any name in a exchange which is not active then throw error
      let exchange_instruments = instruments_data.filter(
        (a) => a.exchange == exchange.exchangeName
      );
      if (exchange_instruments.length != 0) {
        all_exchanges_with_instruments.push(exchange);
      }
      if (exchange_instruments.length != 0 && exchange.isActive == false) {
        throw new Error(`Exchange ${exchange.exchangeName} is not active`);
      }
      let _parent_brokerage = parent_brokerage_data.filter(
        (a) => a.exchange.exchangeName == exchange.exchangeName
      );
      // check if any instrument have less brokerage than parent
      instruments_with_exchange.forEach((instrument) => {
        if (instrument.brokerage.exchange == exchange.exchangeName) {
          if (
            instrument.brokerage.brokeragePerCroreAmt <
            _parent_brokerage[0].brokeragePerCroreAmt
          ) {
            throw new Error(
              `Brokerage per crore cannot be less than ${_parent_brokerage[0].brokeragePerCroreAmt} for ${instrument.name}`
            );
          }
          if (
            instrument.brokerage.brokeragePerLotAmt <
            _parent_brokerage[0].brokeragePerLotAmt
          ) {
            throw new Error(
              `Brokerage per lot cannot be less than ${_parent_brokerage[0].brokeragePerLotAmt} for ${instrument.name}`
            );
          }
        }
      });
    });

    // TO-DO - update
    await AppDataSource.transaction(async (tmanager) => {
      user.setTransactionManager(tmanager);
      user_brokerage.setTransactionManager(tmanager);
      await Promise.all(
        all_exchanges_with_instruments.map(async (exchange) => {
          console.log('exchange is ', exchange);
          const _exchange_instruments = instruments_with_exchange.filter(
            (a) => a.brokerage.exchange == exchange.exchangeName
          );
          const _parent_brokerage = parent_brokerage_data.filter(
            (a) => a.exchange.exchangeName == exchange.exchangeName
          );
          const _parent_script_brokerage = parent_script_brokerage_data.filter(
            (a) => a.exchange.exchangeName == exchange.exchangeName
          );
          const _user_brokerage = user_brokerage_data.filter(
            (a) => a.exchange.exchangeName == exchange.exchangeName
          );
          const _user_script_brokerage = user_script_brokerage_data.filter(
            (a) => a.exchange.exchangeName == exchange.exchangeName
          );

          // console.log(
          //   'exchange is ',
          //   _exchange_instruments,
          //   _parent_brokerage,
          //   _user_brokerage,
          //   _user_script_brokerage
          // );

          if (_user_script_brokerage.length == 0) {
            // create script brokerage with the childs
            let maxInc = await user_brokerage.minChildBrokerageOfParent({
              childIds: child_users.map((a) => a.id),
              parentType: user_data.userType.prjSettConstant,
              exchangeId: exchange.id,
            });
            console.log('max inc', maxInc);
            if (maxInc.cr == null && maxInc.lot == null) {
              // do nothing
            } else if (
              _exchange_instruments[0].brokerage.brokeragePerCroreAmt -
                _user_brokerage[0].brokeragePerCroreAmt >
              maxInc.cr
            ) {
              throw new Error(
                `Brokerage per crore cannot be more than ${
                  _user_brokerage[0].brokeragePerCroreAmt + maxInc.cr
                } for ${_exchange_instruments[0].name}`
              );
            } else if (
              _exchange_instruments[0].brokerage.brokeragePerLotAmt -
                _user_brokerage[0].brokeragePerLotAmt >
              maxInc.lot
            ) {
              throw new Error(
                `Brokerage per lot cannot be more than ${
                  _user_brokerage[0].brokeragePerLotAmt + maxInc.lot
                } for ${_exchange_instruments[0].name}`
              );
            }
            // get all child users brokerage and then bulk create script brokerage records
            let allChildsBrokerage =
              await user_brokerage.getBrokerageOfMultipleUsers({
                userIds: child_users.map((a) => a.id),
                exchangeId: exchange.id,
              });
            const newUserScriptBrokerage = {
              brokeragePerCroreAmt:
                _exchange_instruments[0].brokerage.brokeragePerCroreAmt,
              brokeragePerLotAmt:
                _exchange_instruments[0].brokerage.brokeragePerLotAmt,
              brokerageType: _exchange_instruments[0].brokerage.brokerageType,
              companyPerCroreAmt: null,
              companyPerLotAmt: null,
              masterPerCroreAmt: null,
              masterPerLotAmt: null,
              brokerPerCroreAmt: null,
              brokerPerLotAmt: null,
              subBrokerPerCroreAmt: null,
              subBrokerPerLotAmt: null,
              exchange: { id: exchange.id },
              instrumentName: _exchange_instruments[0].name,
              user: {
                id: data.userId,
              },
            };
            console.log(parent_user_type, user_user_type);
            if (
              parent_user_type == 'Company' &&
              (user_user_type == 'Master' || user_user_type == 'Client')
            ) {
              newUserScriptBrokerage['companyPerCroreAmt'] =
                _exchange_instruments[0].brokerage.brokeragePerCroreAmt;
              newUserScriptBrokerage['companyPerLotAmt'] =
                _exchange_instruments[0].brokerage.brokeragePerLotAmt;

              // all childs brokerage
              allChildsBrokerage = allChildsBrokerage.map((child) => {
                child['companyPerCroreAmt'] =
                  _exchange_instruments[0].brokerage.brokeragePerCroreAmt;
                child['companyPerLotAmt'] =
                  _exchange_instruments[0].brokerage.brokeragePerLotAmt;
                child['masterPerCroreAmt'] =
                  child.masterPerCroreAmt -
                  (_exchange_instruments[0].brokerage.brokeragePerCroreAmt -
                    user_brokerage_data[0].brokeragePerCroreAmt);
                child['masterPerLotAmt'] =
                  child.masterPerLotAmt -
                  (_exchange_instruments[0].brokerage.brokeragePerLotAmt -
                    user_brokerage_data[0].brokeragePerLotAmt);
                return child;
              });
            } else if (
              parent_user_type == 'Master' &&
              (user_user_type == 'Broker' || user_user_type == 'Client')
            ) {
              newUserScriptBrokerage['companyPerCroreAmt'] =
                _user_brokerage[0].companyPerCroreAmt;
              newUserScriptBrokerage['companyPerLotAmt'] =
                _user_brokerage[0].companyPerLotAmt;
              newUserScriptBrokerage['masterPerCroreAmt'] =
                _exchange_instruments[0].brokerage.brokeragePerCroreAmt -
                _user_brokerage[0].companyPerCroreAmt;
              newUserScriptBrokerage['masterPerLotAmt'] =
                _exchange_instruments[0].brokerage.brokeragePerLotAmt -
                _user_brokerage[0].companyPerLotAmt;

              // all childs brokerage
              allChildsBrokerage = allChildsBrokerage.map((child) => {
                child['masterPerCroreAmt'] =
                  _exchange_instruments[0].brokerage.brokeragePerCroreAmt -
                  child.companyPerCroreAmt;
                child['masterPerLotAmt'] =
                  _exchange_instruments[0].brokerage.brokeragePerLotAmt -
                  child.companyPerLotAmt;
                child['brokerPerCroreAmt'] =
                  child.brokerPerCroreAmt -
                  (_exchange_instruments[0].brokerage.brokeragePerCroreAmt -
                    user_brokerage_data[0].brokeragePerCroreAmt);
                child['brokerPerLotAmt'] =
                  child.brokerPerLotAmt -
                  (_exchange_instruments[0].brokerage.brokeragePerLotAmt -
                    user_brokerage_data[0].brokeragePerLotAmt);
                return child;
              });
            } else if (
              parent_user_type == 'Broker' &&
              (user_user_type == 'Client' || user_user_type == 'Sub-Broker')
            ) {
              newUserScriptBrokerage['companyPerCroreAmt'] =
                _user_brokerage[0].companyPerCroreAmt;
              newUserScriptBrokerage['companyPerLotAmt'] =
                _user_brokerage[0].companyPerLotAmt;
              newUserScriptBrokerage['masterPerCroreAmt'] =
                _user_brokerage[0].masterPerCroreAmt;
              newUserScriptBrokerage['masterPerLotAmt'] =
                _user_brokerage[0].masterPerLotAmt;
              newUserScriptBrokerage['brokerPerCroreAmt'] =
                _exchange_instruments[0].brokerage.brokeragePerCroreAmt -
                _user_brokerage[0].companyPerCroreAmt -
                _user_brokerage[0].masterPerCroreAmt;
              newUserScriptBrokerage['brokerPerLotAmt'] =
                _exchange_instruments[0].brokerage.brokeragePerLotAmt -
                _user_brokerage[0].companyPerLotAmt -
                _user_brokerage[0].masterPerLotAmt;

              allChildsBrokerage = allChildsBrokerage.map((child) => {
                child['brokerPerCroreAmt'] =
                  _exchange_instruments[0].brokerage.brokeragePerCroreAmt -
                  child.companyPerCroreAmt -
                  child.masterPerCroreAmt;
                child['brokerPerLotAmt'] =
                  _exchange_instruments[0].brokerage.brokeragePerLotAmt -
                  child.companyPerLotAmt -
                  child.masterPerLotAmt;
                child['subBrokerPerCroreAmt'] =
                  child.subBrokerPerCroreAmt -
                  (_exchange_instruments[0].brokerage.brokeragePerCroreAmt -
                    user_brokerage_data[0].brokeragePerCroreAmt);
                child['subBrokerPerLotAmt'] =
                  child.subBrokerPerLotAmt -
                  (_exchange_instruments[0].brokerage.brokeragePerLotAmt -
                    user_brokerage_data[0].brokeragePerLotAmt);
                return child;
              });
            } else if (
              parent_user_type == 'Sub-Broker' &&
              user_user_type == 'Client'
            ) {
              newUserScriptBrokerage['companyPerCroreAmt'] =
                _user_brokerage[0].companyPerCroreAmt;
              newUserScriptBrokerage['companyPerLotAmt'] =
                _user_brokerage[0].companyPerLotAmt;
              newUserScriptBrokerage['masterPerCroreAmt'] =
                _user_brokerage[0].masterPerCroreAmt;
              newUserScriptBrokerage['masterPerLotAmt'] =
                _user_brokerage[0].masterPerLotAmt;
              newUserScriptBrokerage['brokerPerCroreAmt'] =
                _user_brokerage[0].brokerPerCroreAmt;
              newUserScriptBrokerage['brokerPerLotAmt'] =
                _user_brokerage[0].brokerPerLotAmt;
              newUserScriptBrokerage['subBrokerPerCroreAmt'] =
                _exchange_instruments[0].brokerage.brokeragePerCroreAmt -
                _user_brokerage[0].companyPerCroreAmt -
                _user_brokerage[0].masterPerCroreAmt -
                _user_brokerage[0].brokerPerCroreAmt;
              newUserScriptBrokerage['subBrokerPerLotAmt'] =
                _exchange_instruments[0].brokerage.brokeragePerLotAmt -
                _user_brokerage[0].companyPerLotAmt -
                _user_brokerage[0].masterPerLotAmt -
                _user_brokerage[0].brokerPerLotAmt;
            } else {
              throw new Error('Invalid user type');
            }
            // create this record
            const newChildUserScriptBrokerages = allChildsBrokerage.map(
              (child) => {
                return {
                  brokeragePerCroreAmt: child.brokeragePerCroreAmt,
                  brokeragePerLotAmt: child.brokeragePerLotAmt,
                  brokerageType: child.brokerageType,
                  companyPerCroreAmt: child.companyPerCroreAmt,
                  companyPerLotAmt: child.companyPerLotAmt,
                  masterPerCroreAmt: child.masterPerCroreAmt,
                  masterPerLotAmt: child.masterPerLotAmt,
                  brokerPerCroreAmt: child.brokerPerCroreAmt,
                  brokerPerLotAmt: child.brokerPerLotAmt,
                  subBrokerPerCroreAmt: child.subBrokerPerCroreAmt,
                  subBrokerPerLotAmt: child.subBrokerPerLotAmt,
                  exchange: { id: exchange.id },
                  instrumentName: _exchange_instruments[0].name,
                  user: {
                    id: child.user.id,
                  },
                };
              }
            );
            const childScriptBrokerageCreation = new BrokerageSettings({});
            childScriptBrokerageCreation.setTransactionManager(tmanager);
            console.log(newChildUserScriptBrokerages, newUserScriptBrokerage);
            await childScriptBrokerageCreation.createScriptBrokerageSettings([
              ...newChildUserScriptBrokerages,
              newUserScriptBrokerage,
            ]);
          } else {
            // update script brokerage with the childs
            const maxInc = await user_brokerage.minChildScriptBrokerageOfParent(
              {
                childIds: child_users.map((a) => a.id),
                parentType: user_data.userType.prjSettConstant,
                name: _user_script_brokerage[0].instrumentName,
              }
            );
            console.log('max inc - else', maxInc);
            if (maxInc.cr == null && maxInc.lot == null) {
              // do nothing
            } else if (
              _exchange_instruments[0].brokerage.brokeragePerCroreAmt -
                _user_script_brokerage[0].brokeragePerCroreAmt >
              maxInc.cr
            ) {
              throw new Error(
                `Brokerage per crore cannot be more than ${
                  _user_script_brokerage[0].brokeragePerCroreAmt + maxInc.cr
                } for ${_exchange_instruments[0].name}`
              );
            } else if (
              _exchange_instruments[0].brokerage.brokeragePerLotAmt -
                _user_script_brokerage[0].brokeragePerLotAmt >
              maxInc.lot
            ) {
              throw new Error(
                `Brokerage per lot cannot be more than ${
                  _user_script_brokerage[0].brokeragePerLotAmt + maxInc.lot
                } for ${_exchange_instruments[0].name}`
              );
            }
            //  update script brokerage records
            if (_parent_script_brokerage.length == 0) {
              console.log(_user_script_brokerage, _exchange_instruments[0]);
              await user_brokerage.updateScriptBrokerageSettings({
                id: _user_script_brokerage[0].id,
                brokerageType: _exchange_instruments[0].brokerage.brokerageType,
                brokeragePerCroreAmt:
                  _exchange_instruments[0].brokerage.brokeragePerCroreAmt,
                brokeragePerLotAmt:
                  _exchange_instruments[0].brokerage.brokeragePerLotAmt,
                oldBrokeragePerCroreAmt:
                  _user_script_brokerage[0].brokeragePerCroreAmt,
                oldBrokeragePerLotAmt:
                  _user_script_brokerage[0].brokeragePerLotAmt,
                parentUserType: parent_user_type,
                parentData: {
                  brokerPerCroreAmt: _parent_brokerage[0].brokerPerCroreAmt,
                  brokerPerLotAmt: _parent_brokerage[0].brokerPerLotAmt,
                  masterPerCroreAmt: _parent_brokerage[0].masterPerCroreAmt,
                  masterPerLotAmt: _parent_brokerage[0].masterPerLotAmt,
                  companyPerCroreAmt: _parent_brokerage[0].companyPerCroreAmt,
                  companyPerLotAmt: _parent_brokerage[0].companyPerLotAmt,
                  subBrokerPerCroreAmt:
                    _parent_brokerage[0].subBrokerPerCroreAmt,
                  subBrokerPerLotAmt: _parent_brokerage[0].subBrokerPerLotAmt,
                },
              });
            } else {
              console.log(
                'checkk',
                _user_script_brokerage,
                _exchange_instruments[0]
              );
              await user_brokerage.updateScriptBrokerageSettings({
                id: _user_script_brokerage[0].id,
                brokerageType: _exchange_instruments[0].brokerage.brokerageType,
                brokeragePerCroreAmt:
                  _exchange_instruments[0].brokerage.brokeragePerCroreAmt,
                brokeragePerLotAmt:
                  _exchange_instruments[0].brokerage.brokeragePerLotAmt,
                oldBrokeragePerCroreAmt:
                  _user_script_brokerage[0].brokeragePerCroreAmt,
                oldBrokeragePerLotAmt:
                  _user_script_brokerage[0].brokeragePerLotAmt,
                parentUserType: parent_user_type,
                parentData: {
                  brokerPerCroreAmt:
                    _parent_script_brokerage[0].brokerPerCroreAmt,
                  brokerPerLotAmt: _parent_script_brokerage[0].brokerPerLotAmt,
                  masterPerCroreAmt:
                    _parent_script_brokerage[0].masterPerCroreAmt,
                  masterPerLotAmt: _parent_script_brokerage[0].masterPerLotAmt,
                  companyPerCroreAmt:
                    _parent_script_brokerage[0].companyPerCroreAmt,
                  companyPerLotAmt:
                    _parent_script_brokerage[0].companyPerLotAmt,
                  subBrokerPerCroreAmt:
                    _parent_script_brokerage[0].subBrokerPerCroreAmt,
                  subBrokerPerLotAmt:
                    _parent_script_brokerage[0].subBrokerPerLotAmt,
                },
              });
            }
            // update all childs brokerage
            await user_brokerage.updateAllChildsScriptBrokerageSettings({
              childIds: child_users.map((a) => a.id),
              exchangeId: exchange.id,
              parentUserType: parent_user_type,
              userUserType: user_user_type,
              brokeragePerCroreAmt:
                _exchange_instruments[0].brokerage.brokeragePerCroreAmt,
              brokeragePerLotAmt:
                _exchange_instruments[0].brokerage.brokeragePerLotAmt,
              userData: {
                brokeragePerCroreAmt:
                  _user_script_brokerage[0].brokeragePerCroreAmt,
                brokeragePerLotAmt:
                  _user_script_brokerage[0].brokeragePerLotAmt,
                brokerPerCroreAmt: _user_script_brokerage[0].brokerPerCroreAmt,
                brokerPerLotAmt: _user_script_brokerage[0].brokerPerLotAmt,
                masterPerCroreAmt: _user_script_brokerage[0].masterPerCroreAmt,
                masterPerLotAmt: _user_script_brokerage[0].masterPerLotAmt,
                companyPerCroreAmt:
                  _user_script_brokerage[0].companyPerCroreAmt,
                companyPerLotAmt: _user_script_brokerage[0].companyPerLotAmt,
                subBrokerPerCroreAmt:
                  _user_script_brokerage[0].subBrokerPerCroreAmt,
                subBrokerPerLotAmt:
                  _user_script_brokerage[0].subBrokerPerLotAmt,
              },
            });
          }
        })
      );
    });
  }
}

export default BrokerageService;
