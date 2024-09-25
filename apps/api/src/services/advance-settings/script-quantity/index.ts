import ExchangeSetting from 'entity/exchange-settings';
import User from 'entity/user';
import Watchlist from 'entity/watchlist';
import { redisClient } from '../../../lib/redis';

export type UpdateScriptQuantityInstrument = {
  name: string;
  exchange: string;
  scriptMaxLotSize: number;
  tradeMinLotSize: number;
  tradeMaxLotSize: number;
  active: boolean;
  isUpdated: boolean;
};
export type UpdateScriptQuantity = {
  userId: number;
  instruments: UpdateScriptQuantityInstrument[];
};
class ScriptQuantityService {
  public static async getScriptQuantitySettings(userId: number) {
    let userExchangeSettings = new ExchangeSetting({ userId });
    let watchlist = new Watchlist(userId, redisClient);
    let user = new User({ userId });
    let userData = await user.getUserData({ createdByUser: true });
    let parentExchangeSettings = new ExchangeSetting({
      userId: userData.createdByUser.id,
    });
    let allowedExchanges = await user.getAllowedExchanges();
    console.log('allowed exchanges are ', allowedExchanges);
    let allowedExchangesName = allowedExchanges.data.exchange.map((a) =>
      a.exchange.exchangeName == 'NSE' ? 'NFO' : a.exchange.exchangeName
    );
    let masterInstruments =
      await watchlist.getMasterInstrumentsGroupedByName(allowedExchangesName);
    let userScriptQuantitySettings =
      await userExchangeSettings.getScriptExchangeSetting();
    let userDefaultQuantitySettings =
      await userExchangeSettings.getExchangeSetting();
    let parentScriptQuantitySettings =
      await parentExchangeSettings.getScriptExchangeSetting();
    let parentDefaultQuantitySettings =
      await parentExchangeSettings.getExchangeSetting();

    let finalScripts = [];

    masterInstruments.map((item) => {
      finalScripts.push({
        ...item,
        parentScriptSetting: parentScriptQuantitySettings.find(
          (a) => a.instrumentName == item.name
        ),
        userScriptSetting: userScriptQuantitySettings.find(
          (a) => a.instrumentName == item.name
        ),
      });
    });

    return {
      instruments: finalScripts,
      parentDefaultQuantitySettings,
      userDefaultQuantitySettings,
    };
  }

  private static async updateScriptQuantityValidator(
    data: UpdateScriptQuantity,
    user: User
  ) {
    let userData = await user.getUserData({ createdByUser: true });
    let scriptQuantity = new ExchangeSetting({
      userId: userData.createdByUser.id,
    });
    let parentScriptSettings = await scriptQuantity.getScriptExchangeSetting();
    let parentDefaultSettings = await scriptQuantity.getExchangeSetting();

    let result = {
      status: true,
      msg: '',
    };
    data.instruments.map((item) => {
      let scriptCheck = parentScriptSettings.find(
        (a) => a.instrumentName == item.name
      );

      if (scriptCheck) {
        if (scriptCheck.tradeMaxLotSize < item.tradeMaxLotSize) {
          result = {
            status: false,
            msg: `Trade Max Lot Size for ${item.name} can't be greater than ${scriptCheck.tradeMaxLotSize}`,
          };
        }
        if (scriptCheck.scriptMaxLotSize < item.scriptMaxLotSize) {
          result = {
            status: false,
            msg: `Script Max Lot Size for ${item.name} can't be greater than ${scriptCheck.scriptMaxLotSize}`,
          };
        }
        if (!scriptCheck.active && item.active) {
          result = {
            status: false,
            msg: `${scriptCheck.instrumentName} can't be active.`,
          };
        }
      } else {
        let parentCheck = parentDefaultSettings.find((a) =>
          item.exchange == 'NFO'
            ? a.exchange.exchangeName == 'NSE'
            : item.exchange == a.exchange.exchangeName
        );
        if (parentCheck.tradeMaxLotSize < item.tradeMaxLotSize) {
          result = {
            status: false,
            msg: `Trade Max Lot Size for ${item.name} can't be greater than ${parentCheck.tradeMaxLotSize}`,
          };
        }
        if (parentCheck.scriptMaxLotSize < item.scriptMaxLotSize) {
          result = {
            status: false,
            msg: `Script Max Lot Size for ${item.name} can't be greater than ${parentCheck.scriptMaxLotSize}`,
          };
        }
      }
    });

    return result;
  }

  private static instrumentDataParser(
    data: UpdateScriptQuantity,
    currUserId: number
  ) {
    let parsedData = [];
    data.instruments.map((item) => {
      let tempObj = {
        tradeMaxLotSize: item.tradeMaxLotSize,
        scriptMaxLotSize: item.scriptMaxLotSize,
        tradeMinLotSize: item.tradeMinLotSize,
        active: item.active,
        instrumentName: item.name,
        user: {
          id: data.userId,
        },
        exchange: {
          exchangeName: item.exchange,
        },
      };
      if (item.isUpdated) {
        // tempObj['id'] = item.id;
        tempObj['updatedBy'] = {
          id: currUserId,
        };
      } else {
        tempObj['updatedBy'] = {
          id: currUserId,
        };
        tempObj['createdBy'] = {
          id: currUserId,
        };
      }
      parsedData.push(tempObj);
    });
    return parsedData;
  }

  private static async childDataHandler(
    user: User,
    currUserId: number,
    data: UpdateScriptQuantity
  ) {
    let childUsers = await user.getAllChildUsers();
    let childIds = childUsers.map((item) => item.id);
    console.log('child ids are ', childIds);
    let scriptQuantity = new ExchangeSetting({ userId: data.userId });
    let childDefaultSettings =
      await scriptQuantity.getAllUsersExchangeSetting(childIds);
    let childScriptSettings =
      await scriptQuantity.getAllUsersScriptExchangeSetting(childIds);
    let finalData = [];
    childIds.map((id: number) => {
      data.instruments.map((instrument) => {
        let exchangeSetting = childDefaultSettings.find(
          (a) =>
            a.exchange.exchangeName == instrument.exchange && a.user.id == id
        );

        let scriptSetting = childScriptSettings.find(
          (a) => a.instrumentName == instrument.name && a.user.id == id
        );

        if (scriptSetting) {
          if (
            instrument.scriptMaxLotSize < scriptSetting.scriptMaxLotSize ||
            instrument.tradeMaxLotSize < scriptSetting.tradeMaxLotSize
          ) {
            finalData.push({
              tradeMaxLotSize: instrument.tradeMaxLotSize,
              scriptMaxLotSize: instrument.scriptMaxLotSize,
              active: instrument.active,
              instrumentName: instrument.name,
              user: {
                id: id,
              },
              updatedBy: {
                id: currUserId,
              },
              exchange: {
                exchangeName: instrument.exchange,
              },
            });
          } else if (
            instrument.active == false &&
            scriptSetting.active == true
          ) {
            finalData.push({
              tradeMaxLotSize: instrument.tradeMaxLotSize,
              scriptMaxLotSize: instrument.scriptMaxLotSize,
              active: instrument.active,
              instrumentName: instrument.name,
              user: {
                id: id,
              },
              updatedBy: {
                id: currUserId,
              },
              exchange: {
                exchangeName: instrument.exchange,
              },
            });
          }
        } else if (exchangeSetting) {
          console.log('exchange settings available');
          if (
            exchangeSetting.tradeMaxLotSize > instrument.tradeMaxLotSize ||
            exchangeSetting.scriptMaxLotSize > instrument.scriptMaxLotSize
          ) {
            console.log('creating new with edit value');
            finalData.push({
              tradeMaxLotSize: instrument.tradeMaxLotSize,
              scriptMaxLotSize: instrument.scriptMaxLotSize,
              active: instrument.active,
              instrumentName: instrument.name,
              user: {
                id: id,
              },
              updatedBy: {
                id: currUserId,
              },
              createdBy: {
                id: currUserId,
              },
              exchange: {
                exchangeName: instrument.exchange,
              },
            });
          } else if (instrument.active == false) {
            console.log('creating new without edit');
            finalData.push({
              tradeMaxLotSize: exchangeSetting.tradeMaxLotSize,
              scriptMaxLotSize: exchangeSetting.scriptMaxLotSize,
              active: instrument.active,
              instrumentName: instrument.name,
              user: {
                id: id,
              },
              updatedBy: {
                id: currUserId,
              },
              createdBy: {
                id: currUserId,
              },
              exchange: {
                exchangeName: instrument.exchange,
              },
            });
          }
        }
      });
    });

    return finalData;
  }

  public static async updateScriptQuantitySettings(
    data: UpdateScriptQuantity,
    currUserId: number
  ): Promise<{ status: boolean; msg?: string; data?: any }> {
    let user = new User({ userId: data.userId });

    let validation = await this.updateScriptQuantityValidator(data, user);
    if (validation.status == false) {
      return validation;
    }

    let userParsedInstruments = this.instrumentDataParser(data, currUserId);
    let childParsedInstruments = await this.childDataHandler(
      user,
      currUserId,
      data
    );

    let scriptQuantity = new ExchangeSetting({ userId: data.userId });
    await scriptQuantity.upsertExchangeSetting([
      ...userParsedInstruments,
      ...childParsedInstruments,
    ]);
    return {
      status: true,
      data: { userParsedInstruments, childParsedInstruments },
    };
  }
}

export default ScriptQuantityService;
