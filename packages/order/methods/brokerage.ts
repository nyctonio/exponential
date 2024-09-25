import BrokerageSetting from 'entity/brokerage-settings';
import Ledger from 'entity/ledger';
import ProjectSetting from 'entity/project-settings';
import redisClient from 'lib/redis';

type brokerageCalculatePayload = {
  userId: number;
  exchangeName: string;
  tradingSymbol: string;
  buyPrice: number;
  sellPrice: number;
  tradeType: 'B' | 'S' | string;
  quantity: number;
  lotSize: number;
};

type brokerageLedgerPayload = {
  userId: number;
  orderId: number;
  brokerageAmount: number;
  tmanager;
};

type deleteBrokeragePayload = {
  orderId: number;
  tmanager: any;
  userId: number;
};

class BrokerageHandler {
  private static async fetchUserBrokerageSettings(
    userId: number,
    exchangeName: string,
    instrumentName: string
  ) {
    const brokerage = new BrokerageSetting({ userId: userId });
    let [scriptBrokerageSetting, brokerageSetting] = await Promise.all([
      brokerage.getBrokerageSettings(exchangeName), // 6
      brokerage.getScriptBrokerageSettingsByName({
        names: [instrumentName],
      }), // 7
    ]);

    return {
      scriptBrokerageSetting:
        scriptBrokerageSetting.length > 0 ? scriptBrokerageSetting[0] : null,
      brokerageSetting:
        brokerageSetting.length > 0 ? brokerageSetting[0] : null,
    };
  }

  public static async calculateBrokerage({
    userId,
    exchangeName,
    tradingSymbol,
    buyPrice,
    lotSize,
    quantity,
    sellPrice,
    tradeType,
  }: brokerageCalculatePayload) {
    let { scriptBrokerageSetting, brokerageSetting } =
      await this.fetchUserBrokerageSettings(
        userId,
        exchangeName,
        tradingSymbol.match(/^[A-Za-z]+/)![0]
      );

    let brokerageAmount: number;
    let brokerageType;
    let brokerageRate;
    if (scriptBrokerageSetting) {
      // script brokerage will be applicable
      const script_brokerage_settings = scriptBrokerageSetting;
      if (script_brokerage_settings.brokerageType == 'lot') {
        brokerageAmount =
          script_brokerage_settings.brokeragePerLotAmt * (quantity / lotSize);
        brokerageType = 'lot';
        brokerageRate = script_brokerage_settings.brokeragePerLotAmt;
      } else {
        brokerageAmount =
          (script_brokerage_settings.brokeragePerCroreAmt / 10000000) *
          (tradeType == 'B' ? sellPrice * quantity : buyPrice * quantity);
        brokerageType = 'crore';
        brokerageRate = script_brokerage_settings.brokeragePerCroreAmt;
      }
    } else if (brokerageSetting) {
      // exchange brokerage will be applicable
      const exchange_brokerage_settings = brokerageSetting;
      if (exchange_brokerage_settings.brokerageType == 'lot') {
        brokerageAmount =
          exchange_brokerage_settings.brokeragePerLotAmt * (quantity / lotSize);
        brokerageType = 'lot';
        brokerageRate = exchange_brokerage_settings.brokeragePerLotAmt;
      } else {
        brokerageAmount =
          (exchange_brokerage_settings.brokeragePerCroreAmt / 10000000) *
          (tradeType == 'B' ? sellPrice * quantity : buyPrice * quantity);
        brokerageType = 'crore';
        brokerageRate = exchange_brokerage_settings.brokeragePerCroreAmt;
      }
    } else {
      throw new Error('Brokerage Settings not found');
    }
    console.log('brokerage amount is ', brokerageAmount);
    brokerageAmount = Number(Number(brokerageAmount).toFixed(2));
    console.log('brokerage amount is ', brokerageAmount);
    return { brokerageAmount, brokerageType, brokerageRate };
  }

  public static async debitBrokerage({
    brokerageAmount,
    orderId,
    tmanager,
    userId,
  }: brokerageLedgerPayload) {
    const ledger = new Ledger({ redisClient, userId: userId });
    const projectSetting = new ProjectSetting([]);
    let transactionParticularData =
      await projectSetting.getProjectSettingByKeyAndConstant(
        'TRXNPRT',
        'Brokerage Collected'
      );
    ledger.setTransactionManager(tmanager);
    await ledger.debitBalance({
      amount: brokerageAmount,
      currUserId: null,
      orderId,
      transactionParticularId: transactionParticularData.id,
      transactionRemarks: `Brokerage collected for ${orderId}`,
    });
    return;
  }

  public static async creditBrokerage({
    brokerageAmount,
    orderId,
    tmanager,
    userId,
  }: brokerageLedgerPayload) {
    const ledger = new Ledger({ redisClient: redisClient, userId: userId });
    const projectSetting = new ProjectSetting([]);
    let transactionParticularData =
      await projectSetting.getProjectSettingByKeyAndConstant(
        'TRXNPRT',
        'Brokerage Received'
      );
    ledger.setTransactionManager(tmanager);
    await ledger.creditBalance({
      amount: brokerageAmount,
      currUserId: null,
      orderId,
      transactionParticularId: transactionParticularData.id,
      transactionRemarks: `Brokerage Received for ${orderId}`,
    });
    return;
  }

  public static async deleteBrokerage({
    orderId,
    tmanager,
    userId,
  }: deleteBrokeragePayload) {
    const ledger = new Ledger({ userId, redisClient });
    ledger.setTransactionManager(tmanager);
    const projectSetting = new ProjectSetting();
    let particularData = await projectSetting.getProjectSettingByKeyAndConstant(
      'TRXNPRT',
      'Brokerage Collected'
    );
    await ledger.deleteLedgerByOrderAndParticular(orderId, particularData.id);
    return;
  }
}

export default BrokerageHandler;
