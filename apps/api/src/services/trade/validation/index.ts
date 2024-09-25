import AutoCutSetttings from 'entity/auto-cut-settings';
import { UserRequest } from '../../../types/common/req';
import ExchangeSettings from 'entity/exchange-settings';
import User from 'entity/user';

class ValidationService {
  public static async getPreTradeValidation({ userId }) {
    const user = new User({ userId: userId });
    const user_exchange = new ExchangeSettings({ userId });
    let user_auto_cut = new AutoCutSetttings(userId);
    const [
      user_exchange_settings,
      user_script_exchange_settings,
      user_settings,
      user_auto_cut_settings,
    ] = await Promise.all([
      user_exchange.getExchangeSetting(),
      user_exchange.getScriptExchangeSetting(false),
      user.getUserData(),
      user_auto_cut.getAutoCutSettings(),
    ]);

    console.log(
      'user_script_exchange_settings =====> ',
      user_script_exchange_settings,
      user_exchange_settings,
      user_settings
    );
    const data = {
      user: {
        isDemoId: user_settings.isDemoId,
        isIntradayAllowed: user_settings.isIntradayAllowed,
        tradeAllowedinQty: user_settings.tradeAllowedinQty,
      },
      exchange: user_exchange_settings
        .filter((e) => e.isExchangeActive)
        .map((e) => {
          return {
            id: e.exchange.id,
            exchangeName: e.exchange.exchangeName,
            exchangeMaxLotSize: e.exchangeMaxLotSize,
            scriptMaxLotSize: e.scriptMaxLotSize,
            tradeMaxLotSize: e.tradeMaxLotSize,
          };
        }),
      scriptQuantity: user_script_exchange_settings.map((e) => {
        return {
          script: e.instrumentName,
          scriptMaxLotSize: e.scriptMaxLotSize,
          tradeMaxLotSize: e.tradeMaxLotSize,
          active: e.active,
        };
      }),
      autoCutSettings: user_auto_cut_settings,
    };
    return data;
  }
}

export default ValidationService;
