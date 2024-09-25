import PlSharing from 'entity/plshare';
import User from 'entity/user';
import BrokerageSettings from 'entity/brokerage-settings';
import {
  UpdateBrokerageSharingBodyType,
  UpdatePlSharingBodyType,
} from '../../../controllers/advance-settings/pl-brokerage-sharing/validation';
import ExchangeSetting from 'entity/exchange-settings';
import { AppDataSource } from 'database/sql';

import Rent from 'entity/rent';
class PlSharingService {
  public static async getPlSharingData({
    username,
    currUser,
  }: {
    username: string;
    currUser: {
      id: number;
      username: string;
    };
  }) {
    let plShare = new PlSharing({ userId: null });
    await plShare.setUserId({ username });
    let plShareData = await plShare.getPlShareData();
    const user = new User({ userName: username });
    const curr_user = new User({ userId: currUser.id });
    const [user_data, curr_user_data] = await Promise.all([
      user.getUserData({
        userType: true,
      }),
      curr_user.getUserData({
        userType: true,
      }),
    ]);
    const user_user_type = user_data.userType.prjSettConstant;
    const curr_user_user_type = curr_user_data.userType.prjSettConstant;
    if (curr_user_user_type == 'Company') {
      const data = plShareData.map((item) => {
        return {
          id: item.id,
          exchange: item.exchange.exchangeName,
          upline: null,
          self: item.companySharing,
          master: item.masterSharing,
          broker: item.brokerSharing,
          subbroker: item.subbrokerSharing,
          thirdparty:
            user_user_type != 'Client' ? null : item.thirdpartySharing,
          thirdpartyremarks:
            user_user_type != 'Client' ? null : item.thirdpartyRemarks,
        };
      });
      return data;
    } else if (curr_user_user_type == 'Master') {
      const data = plShareData.map((item) => {
        return {
          id: item.id,
          exchange: item.exchange.exchangeName,
          upline: item.companySharing,
          self: item.masterSharing,
          master: null,
          broker: item.brokerSharing,
          subbroker: item.subbrokerSharing,
          thirdparty:
            user_user_type != 'Client' ? null : item.thirdpartySharing,
          thirdpartyremarks:
            user_user_type != 'Client' ? null : item.thirdpartyRemarks,
        };
      });
      return data;
    } else if (curr_user_user_type == 'Broker') {
      const data = plShareData.map((item) => {
        return {
          id: item.id,
          exchange: item.exchange.exchangeName,
          upline: item.masterSharing + item.companySharing,
          self: item.brokerSharing,
          master: null,
          broker: null,
          subbroker: item.subbrokerSharing,
          thirdparty:
            user_user_type != 'Client' ? null : item.thirdpartySharing,
          thirdpartyremarks:
            user_user_type != 'Client' ? null : item.thirdpartyRemarks,
        };
      });
      return data;
    } else if (curr_user_user_type == 'Sub-Broker') {
      const data = plShareData.map((item) => {
        return {
          id: item.id,
          exchange: item.exchange.exchangeName,
          upline: item.masterSharing + item.companySharing + item.brokerSharing,
          self: item.subbrokerSharing,
          master: null,
          broker: null,
          subbroker: null,
          thirdparty:
            user_user_type != 'Client' ? null : item.thirdpartySharing,
          thirdpartyremarks:
            user_user_type != 'Client' ? null : item.thirdpartyRemarks,
        };
      });
      return data;
    }
  }

  public static async updatePlSharingData({
    data,
    currUser,
  }: {
    data: UpdatePlSharingBodyType;
    currUser: {
      id: number;
      username: string;
    };
  }) {
    const user = new User({ userName: data.username });
    const curr_user = new User({ userId: currUser.id });
    await Promise.all([
      user.setUserId({ userName: data.username }),
      curr_user.setUserId({ userName: currUser.username }),
    ]);
    const exchanges = new ExchangeSetting({ userId: user.userId });
    const user_pl_share = new PlSharing({ userId: user.userId });
    const [user_pl_share_data, user_data, curr_user_data, childs] =
      await Promise.all([
        user_pl_share.getPlShareData(),
        user.getUserData({ userType: true }),
        curr_user.getUserData({ userType: true }),
        user.getAllChildUsers(),
      ]);
    const user_user_type = user_data.userType.prjSettConstant;
    const curr_user_user_type = curr_user_data.userType.prjSettConstant;
    console.log(user_pl_share_data);
    data.updatedSharing.forEach((exch) => {
      const _pl_share = user_pl_share_data.filter((item) => {
        return exch.exchange == item.exchange.exchangeName;
      });
      if (_pl_share.length == 0) {
        throw new Error('Invalid Exchange Name');
      }
      const _upline = exch.upline || 0;
      const _self = exch.self || 0;
      const _master = exch.master || 0;
      const _broker = exch.broker || 0;
      const _subbroker = exch.subbroker || 0;
      const _thirdparty = exch.thirdparty || 0;
      const data_total =
        _upline + _self + _master + _broker + _subbroker + _thirdparty;
      const companySharing = _pl_share[0].companySharing || 0;
      const masterSharing = _pl_share[0].masterSharing || 0;
      const brokerSharing = _pl_share[0].brokerSharing || 0;
      const subbrokerSharing = _pl_share[0].subbrokerSharing || 0;
      const thirdpartySharing = _pl_share[0].thirdpartySharing || 0;
      const total =
        companySharing +
        masterSharing +
        brokerSharing +
        subbrokerSharing +
        thirdpartySharing;
      if (data_total != total) {
        throw new Error('Total Sharing Should be Same');
      }
      if (user_user_type == 'Client') {
        if (data_total != 100) {
          throw new Error('Total Sharing Should be 100');
        }
      } else {
        // third party sharing should only be with client
        if (exch.thirdparty != null) {
          throw new Error('Thirdparty Sharing Should be 0');
        }
      }
      if (curr_user_user_type == 'Master') {
        if (exch.upline != companySharing) {
          throw new Error("Can't Update upline sharing");
        }
      } else if (curr_user_user_type == 'Broker') {
        if (exch.upline != companySharing + masterSharing) {
          throw new Error("Can't Update upline sharing");
        }
      } else if (curr_user_user_type == 'Sub-Broker') {
        throw new Error("You Can't Update Sharing");
      }
    });
    await AppDataSource.transaction(async (tmanager) => {
      await Promise.all(
        data.updatedSharing.map(async (exch) => {
          const _pl_share = user_pl_share_data.filter((item) => {
            return exch.exchange == item.exchange.exchangeName;
          });
          user_pl_share.setTransactionManager(tmanager);
          await user_pl_share.updatePlSharing({
            childIds: [
              ...childs.map((item) => {
                return item.id;
              }),
              user.userId,
            ],
            exchangeId: _pl_share[0].exchange.id,
            newData: {
              upline: exch.upline,
              self: exch.self,
              master: exch.master,
              broker: exch.broker,
              subbroker: exch.subbroker,
              thirdparty: exch.thirdparty,
            },
            parentType: curr_user_user_type,
            userType: user_user_type,
            prevData: {
              companySharing: _pl_share[0].companySharing,
              masterSharing: _pl_share[0].masterSharing,
              brokerSharing: _pl_share[0].brokerSharing,
              subbrokerSharing: _pl_share[0].subbrokerSharing,
              thirdpartySharing: _pl_share[0].thirdpartySharing,
            },
          });
        })
      );
    });
  }
}
class BrokerageSharingService {
  public static async getBrokerageSharingData({
    username,
    currUser,
  }: {
    username: string;
    currUser: {
      id: number;
      username: string;
    };
  }) {
    const user = new User({ userName: username });
    const user_brokerage = new BrokerageSettings({ userId: null });
    await user_brokerage.setUserId({ username });

    const [user_data, user_brokerage_data] = await Promise.all([
      user.getUserData({
        userType: true,
      }),
      user_brokerage.getBrokerageSettings(),
    ]);
    const curr_user = new User({ userId: currUser.id });
    const curr_user_data = await curr_user.getUserData({
      userType: true,
    });
    const user_user_type = user_data.userType.prjSettConstant;
    const curr_user_user_type = curr_user_data.userType.prjSettConstant;
    if (curr_user_user_type == 'Company') {
      const data = [];
      user_brokerage_data.forEach((item) => {
        data.push({
          id: item.id + '-crore',
          exchange: item.exchange.exchangeName,
          brokerageType: 'crore',
          upline: null,
          total: item.brokeragePerCroreAmt,
          self: item.companyPerCroreAmt,
          master: item.masterPerCroreAmt,
          broker: item.brokerPerCroreAmt,
          subbroker: item.subBrokerPerCroreAmt,
          thirdparty:
            user_user_type != 'Client' ? null : item.thirdpartyPerCroreAmt,
          thirdpartyremarks:
            user_user_type != 'Client' ? null : item.thirdpartyPerCroreRemarks,
        });
        data.push({
          id: item.id + '-lot',
          exchange: item.exchange.exchangeName,
          brokerageType: 'lot',
          upline: null,
          total: item.brokeragePerLotAmt,
          self: item.companyPerLotAmt,
          master: item.masterPerLotAmt,
          broker: item.brokerPerLotAmt,
          subbroker: item.subBrokerPerLotAmt,
          thirdparty:
            user_user_type != 'Client' ? null : item.thirdpartyPerLotAmt,
          thirdpartyremarks:
            user_user_type != 'Client' ? null : item.thirdpartyPerLotRemarks,
        });
      });
      return data;
    } else if (curr_user_user_type == 'Master') {
      const data = [];
      user_brokerage_data.forEach((item) => {
        data.push({
          id: item.id + '-crore',
          exchange: item.exchange.exchangeName,
          brokerageType: 'crore',
          upline: item.companyPerCroreAmt,
          total: item.brokeragePerCroreAmt,
          self: item.masterPerCroreAmt,
          master: null,
          broker: item.brokerPerCroreAmt,
          subbroker: item.subBrokerPerCroreAmt,
          thirdparty:
            user_user_type != 'Client' ? null : item.thirdpartyPerCroreAmt,
          thirdpartyremarks:
            user_user_type != 'Client' ? null : item.thirdpartyPerCroreRemarks,
        });
        data.push({
          id: item.id + '-lot',
          exchange: item.exchange.exchangeName,
          brokerageType: 'lot',
          upline: item.companyPerLotAmt,
          total: item.brokeragePerLotAmt,
          self: item.masterPerLotAmt,
          master: null,
          broker: item.brokerPerLotAmt,
          subbroker: item.subBrokerPerLotAmt,
          thirdparty:
            user_user_type != 'Client' ? null : item.thirdpartyPerLotAmt,
          thirdpartyremarks:
            user_user_type != 'Client' ? null : item.thirdpartyPerLotRemarks,
        });
      });
      return data;
    } else if (curr_user_user_type == 'Broker') {
      const data = [];
      user_brokerage_data.forEach((item) => {
        data.push({
          id: item.id + '-crore',
          exchange: item.exchange.exchangeName,
          brokerageType: 'crore',
          upline: item.companyPerCroreAmt + item.masterPerCroreAmt,
          total: item.brokeragePerCroreAmt,
          self: item.brokerPerCroreAmt,
          master: null,
          broker: null,
          subbroker: item.subBrokerPerCroreAmt,
          thirdparty:
            user_user_type != 'Client' ? null : item.thirdpartyPerCroreAmt,
          thirdpartyremarks:
            user_user_type != 'Client' ? null : item.thirdpartyPerCroreRemarks,
        });
        data.push({
          id: item.id + '-lot',
          exchange: item.exchange.exchangeName,
          brokerageType: 'lot',
          upline: item.companyPerLotAmt + item.masterPerLotAmt,
          total: item.brokeragePerLotAmt,
          self: item.brokerPerLotAmt,
          master: null,
          broker: null,
          subbroker: item.subBrokerPerLotAmt,
          thirdparty:
            user_user_type != 'Client' ? null : item.thirdpartyPerLotAmt,
          thirdpartyremarks:
            user_user_type != 'Client' ? null : item.thirdpartyPerLotRemarks,
        });
      });
      return data;
    } else if (curr_user_user_type == 'Sub-Broker') {
      const data = [];
      user_brokerage_data.forEach((item) => {
        data.push({
          id: item.id + '-crore',
          exchange: item.exchange.exchangeName,
          brokerageType: 'crore',
          upline:
            item.companyPerCroreAmt +
            item.masterPerCroreAmt +
            item.brokerPerCroreAmt,
          total: item.brokeragePerCroreAmt,
          self: item.subBrokerPerCroreAmt,
          master: null,
          broker: null,
          subbroker: null,
          thirdparty:
            user_user_type != 'Client' ? null : item.thirdpartyPerCroreAmt,
          thirdpartyremarks:
            user_user_type != 'Client' ? null : item.thirdpartyPerCroreRemarks,
        });
        data.push({
          id: item.id + '-lot',
          exchange: item.exchange.exchangeName,
          brokerageType: 'lot',
          upline:
            item.companyPerLotAmt + item.masterPerLotAmt + item.brokerPerLotAmt,
          total: item.brokeragePerLotAmt,
          self: item.subBrokerPerLotAmt,
          master: null,
          broker: null,
          subbroker: null,
          thirdparty:
            user_user_type != 'Client' ? null : item.thirdpartyPerLotAmt,
          thirdpartyremarks:
            user_user_type != 'Client' ? null : item.thirdpartyPerLotRemarks,
        });
      });
      return data;
    } else {
      throw new Error('Invalid User Type');
    }
  }

  public static async updateBrokerageSharingData({
    data,
    currUser,
  }: {
    data: UpdateBrokerageSharingBodyType;
    currUser: {
      id: number;
      username: string;
    };
  }) {
    const user = new User({ userName: data.username });
    const curr_user = new User({ userId: currUser.id });
    await Promise.all([
      user.setUserId({ userName: data.username }),
      curr_user.setUserId({ userName: currUser.username }),
    ]);
    const exchanges = new ExchangeSetting({ userId: user.userId });
    const user_brokerage = new BrokerageSettings({ userId: user.userId });
    const curr_user_brokerage = new BrokerageSettings({
      userId: curr_user.userId,
    });
    const [user_brokerage_data, user_data, curr_user_data, childs] =
      await Promise.all([
        user_brokerage.getBrokerageSettings(),
        user.getUserData({ userType: true }),
        curr_user.getUserData({ userType: true }),
        user.getAllChildUsers(),
      ]);
    const user_user_type = user_data.userType.prjSettConstant;
    const curr_user_user_type = curr_user_data.userType.prjSettConstant;
    console.log(user_brokerage_data);
    data.updatedSharing.forEach((exch) => {
      const _brokerage = user_brokerage_data.filter((item) => {
        return exch.exchange == item.exchange.exchangeName;
      });
      console.log(_brokerage);
      if (exch.brokerageType == 'crore') {
        if (
          exch.upline +
            exch.self +
            exch.master +
            exch.broker +
            exch.subbroker +
            exch.thirdparty !=
          _brokerage[0].brokeragePerCroreAmt
        ) {
          throw new Error(
            `Total Sharing Should be ${_brokerage[0].brokeragePerCroreAmt}`
          );
        }
        if (curr_user_user_type == 'Master') {
          if (exch.upline != _brokerage[0].companyPerCroreAmt) {
            throw new Error("Can't Update upline sharing");
          }
        } else if (curr_user_user_type == 'Broker') {
          if (
            exch.upline !=
            _brokerage[0].companyPerCroreAmt + _brokerage[0].masterPerCroreAmt
          ) {
            throw new Error("Can't Update upline sharing");
          }
        } else if (curr_user_user_type == 'Sub-Broker') {
          throw new Error("You Can't Update Sharing");
        }
      } else if (exch.brokerageType == 'lot') {
        if (
          exch.upline +
            exch.self +
            exch.master +
            exch.broker +
            exch.subbroker +
            exch.thirdparty !=
          _brokerage[0].brokeragePerLotAmt
        ) {
          throw new Error(
            `Total Sharing Should be ${_brokerage[0].brokeragePerLotAmt}`
          );
        }
        if (curr_user_user_type == 'Master') {
          if (exch.upline != _brokerage[0].companyPerLotAmt) {
            throw new Error("Can't Update upline sharing");
          }
        } else if (curr_user_user_type == 'Broker') {
          if (
            exch.upline !=
            _brokerage[0].companyPerLotAmt + _brokerage[0].masterPerLotAmt
          ) {
            throw new Error("Can't Update upline sharing");
          }
        } else if (curr_user_user_type == 'Sub-Broker') {
          throw new Error("You Can't Update Sharing");
        }
      }
    });
    AppDataSource.transaction(async (tmanager) => {
      await Promise.all(
        data.updatedSharing.map(async (exch) => {
          const _brokerage = user_brokerage_data.filter((item) => {
            return exch.exchange == item.exchange.exchangeName;
          });
          user_brokerage.updateBrokerageSharing({
            userType: user_user_type,
            childIds: [
              ...childs.map((item) => {
                return item.id;
              }),
              user.userId,
            ],
            exchangeId: _brokerage[0].exchange.id,
            newData: {
              brokerageType: exch.brokerageType,
              upline: exch.upline,
              self: exch.self,
              master: exch.master,
              broker: exch.broker,
              subbroker: exch.subbroker,
              thirdparty: exch.thirdparty,
            },
            parentType: curr_user_user_type,
            prevData: {
              companyPerCroreAmt: _brokerage[0].companyPerCroreAmt,
              masterPerCroreAmt: _brokerage[0].masterPerCroreAmt,
              brokerPerCroreAmt: _brokerage[0].brokerPerCroreAmt,
              subBrokerPerCroreAmt: _brokerage[0].subBrokerPerCroreAmt,
              thirdpartyPerCroreAmt: _brokerage[0].thirdpartyPerCroreAmt,
              companyPerLotAmt: _brokerage[0].companyPerLotAmt,
              masterPerLotAmt: _brokerage[0].masterPerLotAmt,
              brokerPerLotAmt: _brokerage[0].brokerPerLotAmt,
              subBrokerPerLotAmt: _brokerage[0].subBrokerPerLotAmt,
              thirdpartyPerLotAmt: _brokerage[0].thirdpartyPerLotAmt,
            },
          });
        })
      );
    });
  }
}

class RentSharingService {
  public static async getRentData(username: string, currUser: { id: number }) {
    const user = new User({ userName: username });
    const user_data = await user.getUserData({ userType: true });
    const rent = new Rent(user_data.id);
    const user_rent_data = await rent.getRentSharingData();

    const curr_user = new User({ userId: currUser.id });
    const curr_user_data = await curr_user.getUserData({
      userType: true,
    });
    const user_user_type = user_data.userType.prjSettConstant;
    const curr_user_user_type = curr_user_data.userType.prjSettConstant;
    if (curr_user_user_type == 'Company') {
      return {
        id: user_rent_data.id,
        upline: null,
        total: user_rent_data.totalRent,
        self: user_rent_data.companySharing,
        master: user_rent_data.masterSharing,
        broker: user_rent_data.brokerSharing,
        subbroker: user_rent_data.subbrokerSharing,
        thirdparty:
          user_user_type != 'Client' ? 0 : user_rent_data.thirdpartySharing,
        thirdpartyremarks:
          user_user_type != 'Client' ? '' : user_rent_data.thirdpartyRemarks,
      };
    } else if (curr_user_user_type == 'Master') {
      return {
        id: user_rent_data.id,
        upline: user_rent_data.companySharing,
        total: user_rent_data.totalRent,
        self: user_rent_data.masterSharing,
        master: null,
        broker: user_rent_data.brokerSharing,
        subbroker: user_rent_data.subbrokerSharing,
        thirdparty:
          user_user_type != 'Client' ? 0 : user_rent_data.thirdpartySharing,
        thirdpartyremarks:
          user_user_type != 'Client' ? '' : user_rent_data.thirdpartyRemarks,
      };
    } else if (curr_user_user_type == 'Broker') {
      return {
        id: user_rent_data.id,
        upline: user_rent_data.companySharing + user_rent_data.masterSharing,
        total: user_rent_data.totalRent,
        self: user_rent_data.brokerSharing,
        master: null,
        broker: null,
        subbroker: user_rent_data.subbrokerSharing,
        thirdparty:
          user_user_type != 'Client' ? 0 : user_rent_data.thirdpartySharing,
        thirdpartyremarks:
          user_user_type != 'Client' ? '' : user_rent_data.thirdpartyRemarks,
      };
    } else if (curr_user_user_type == 'Sub-Broker') {
      return {
        id: user_rent_data.id,
        upline:
          user_rent_data.companySharing +
          user_rent_data.masterSharing +
          user_rent_data.brokerSharing,
        total: user_rent_data.totalRent,
        self: user_rent_data.subbrokerSharing,
        master: null,
        broker: null,
        subbroker: null,
        thirdparty:
          user_user_type != 'Client' ? 0 : user_rent_data.thirdpartySharing,
        thirdpartyremarks:
          user_user_type != 'Client' ? '' : user_rent_data.thirdpartyRemarks,
      };
    } else {
      throw new Error('Invalid User Type');
    }
  }
}

export { PlSharingService, BrokerageSharingService, RentSharingService };
