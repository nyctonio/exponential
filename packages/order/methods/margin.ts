import Ledger from 'entity/ledger';
import Trade from 'entity/trade';
import MarginSetting from 'entity/margin-settings';
import redisClient from 'lib/redis';
import ProjectSetting from 'entity/project-settings';

type marginCalculationPayload = {
  userId: number;
  scriptData: {
    lotSize: number;
    sellPrice: number;
    buyPrice: number;
  };
  orderData: {
    tradeType: 'B' | 'S' | string;
    price: number | null;
    quantity: number;
    tradingSymbol: string;
    exchangeName: string;
    isIntraday: boolean;
  };
};

type releaseMarginCalculationPayload = {
  exchangeName: string;
  userId: number;
  tradingSymbol: string;
  tradeType: string;
};

type marginLedgerPayload = {
  userId: number;
  orderId: number;
  marginAmount: number;
  tmanager;
};

type deleteMarginPayload = {
  orderId: number;
  tmanager: any;
  userId: number;
};

class MarginHandler {
  private static async fetchUserMarginSettings(
    userId: number,
    exchangeName: string,
    instrumentName: string
  ) {
    const margin = new MarginSetting({ userId: userId });
    let [
      tradeMarginSettings,
      scriptMarginSettings,
      intradayMarginSettings,
      intradayScriptMarginSettings,
    ] = await Promise.all([
      margin.getTradeMarginSettingsByExchange(exchangeName), // 8
      margin.getScriptTradeMarginSettingsByName(instrumentName), // 9
      margin.getIntradayMarginSettingsByExchange(exchangeName), // 10
      margin.getScriptIntradayTradeMarginSettingsByName(instrumentName), // 11
    ]);

    return {
      tradeMarginSettings,
      scriptMarginSettings,
      intradayMarginSettings,
      intradayScriptMarginSettings,
    };
  }

  public static async calculateReleaseMargin({
    exchangeName,
    userId,
    tradingSymbol,
    tradeType,
  }: releaseMarginCalculationPayload) {
    let trade = new Trade({
      exchange: exchangeName,
      redisClient: redisClient,
      userId: userId,
    });
    let marginAmount = 0;
    let openOrders = await trade.getAllOpenOrders({
      exchange: exchangeName,
    }); // 3

    if (openOrders.length > 0) {
      let filteredOrders = openOrders.filter(
        (a) =>
          a.scriptName == tradingSymbol &&
          a.tradeType != tradeType &&
          a.transactionStatus == 'open'
      );
      if (filteredOrders.length > 0) {
        filteredOrders.map((a) => {
          marginAmount =
            marginAmount + (a.margin / a.quantity) * a.quantityLeft;
        });
      }
    }

    return marginAmount;
  }

  /**
   * @param {
   *  userId: number,
   *  orderData: {
   *    tradeType: 'B' | 'S' | string;
   *    price: number | null;
   *    quantity: number;
   *    tradingSymbol: string;
   *    exchangeName: string;
   *    isIntraday: boolean;
   *  },
   *  scriptData: {
   *    lotSize: number;
   *    sellPrice: number;
   *    buyPrice: number;
   *  }
   * }
   * @returns
   */
  public static async calculateMargin({
    userId,
    orderData,
    scriptData,
  }: marginCalculationPayload) {
    let marginAmount;
    let marginType;
    let marginChargedRate;
    let {
      tradeMarginSettings,
      scriptMarginSettings,
      intradayMarginSettings,
      intradayScriptMarginSettings,
    } = await this.fetchUserMarginSettings(
      userId,
      orderData.exchangeName,
      orderData.tradingSymbol.match(/^[A-Za-z]+/)![0]
    );
    if (orderData.isIntraday && intradayMarginSettings) {
      if (intradayScriptMarginSettings) {
        if (intradayScriptMarginSettings.marginType == 'lot') {
          marginAmount =
            (orderData.quantity / scriptData.lotSize) *
            intradayScriptMarginSettings.marginPerLot;
          marginType = 'lot';
          marginChargedRate = intradayScriptMarginSettings.marginPerLot;
        } else {
          marginAmount =
            (intradayScriptMarginSettings.marginPerCrore / 10000000) *
            (orderData.tradeType == 'B'
              ? orderData.quantity * scriptData.sellPrice
              : orderData.quantity * scriptData.buyPrice);
          marginType = 'crore';
          marginChargedRate = intradayScriptMarginSettings.marginPerCrore;
        }
      } else {
        if (intradayMarginSettings.marginType == 'lot') {
          marginAmount =
            (orderData.quantity / scriptData.lotSize) *
            intradayMarginSettings.marginPerLot;
          marginType = 'lot';
          marginChargedRate = intradayMarginSettings.marginPerLot;
        } else {
          marginAmount =
            (intradayMarginSettings.marginPerCrore / 10000000) *
            (orderData.tradeType == 'B'
              ? orderData.quantity * scriptData.sellPrice
              : orderData.quantity * scriptData.buyPrice);
          marginType = 'crore';
          marginChargedRate = intradayMarginSettings.marginPerCrore;
        }
      }
    } else {
      if (scriptMarginSettings) {
        if (scriptMarginSettings.marginType == 'lot') {
          marginAmount =
            (orderData.quantity / scriptData.lotSize) *
            scriptMarginSettings.marginPerLot;
          marginType = 'lot';
          marginChargedRate = scriptMarginSettings.marginPerLot;
        } else {
          marginAmount =
            (scriptMarginSettings.marginPerCrore / 10000000) *
            (orderData.tradeType == 'B'
              ? orderData.quantity * scriptData.sellPrice
              : orderData.quantity * scriptData.buyPrice);
          marginType = 'crore';
          marginChargedRate = scriptMarginSettings.marginPerCrore;
        }
      } else {
        if (tradeMarginSettings.marginType == 'lot') {
          marginAmount =
            (orderData.quantity / scriptData.lotSize) *
            tradeMarginSettings.marginPerLot;
          marginType = 'lot';
          marginChargedRate = tradeMarginSettings.marginPerLot;
        } else {
          marginAmount =
            (tradeMarginSettings.marginPerCrore / 10000000) *
            (orderData.tradeType == 'B'
              ? orderData.quantity * scriptData.sellPrice
              : orderData.quantity * scriptData.buyPrice);
          marginType = 'crore';
          marginChargedRate = tradeMarginSettings.marginPerCrore;
        }
      }
    }
    marginAmount = Number(Number(marginAmount).toFixed(2));

    return { marginAmount, marginType, marginChargedRate };
  }

  public static async holdMargin({
    marginAmount,
    orderId,
    tmanager,
    userId,
  }: marginLedgerPayload) {
    const ledger = new Ledger({ redisClient, userId: userId });
    const projectSetting = new ProjectSetting([]);
    let transactionParticularData =
      await projectSetting.getProjectSettingByKeyAndConstant(
        'TRXNPRT',
        'Margin Hold'
      );
    ledger.setTransactionManager(tmanager);
    await ledger.debitBalance({
      amount: marginAmount,
      currUserId: null,
      orderId,
      transactionParticularId: transactionParticularData.id,
      transactionRemarks: `Margin Hold for ${orderId}`,
    });
    return;
  }

  public static async releaseMargin({
    marginAmount,
    orderId,
    tmanager,
    userId,
  }: marginLedgerPayload) {
    const ledger = new Ledger({ redisClient, userId: userId });
    const projectSetting = new ProjectSetting([]);
    let transactionParticularData =
      await projectSetting.getProjectSettingByKeyAndConstant(
        'TRXNPRT',
        'Margin Released'
      );
    ledger.setTransactionManager(tmanager);
    await ledger.creditBalance({
      amount: marginAmount,
      currUserId: null,
      orderId,
      transactionParticularId: transactionParticularData.id,
      transactionRemarks: `Margin Released for ${orderId}`,
    });
    return;
  }

  public static async deleteMargin({
    orderId,
    tmanager,
    userId,
  }: deleteMarginPayload) {
    const ledger = new Ledger({ userId, redisClient });
    ledger.setTransactionManager(tmanager);
    const projectSetting = new ProjectSetting();
    let particularData = await projectSetting.getProjectSettingByKeyAndConstant(
      'TRXNPRT',
      'Margin Hold'
    );
    await ledger.deleteLedgerByOrderAndParticular(orderId, particularData.id);
    return;
  }
}

export default MarginHandler;
