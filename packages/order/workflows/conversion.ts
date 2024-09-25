import { AppDataSource } from 'database/sql';
import { m_transaction } from 'database/sql/schema';
import Ledger from 'entity/ledger';
import Trade from 'entity/trade';
import redisClient from 'lib/redis';
// import { Orders, OrderProcessor } from 'order';
import moment from 'moment';
import MarginHandler from '../methods/margin';
import { msgType } from './create';
import Instruments from 'entity/instruments';
import { env } from 'env';
import Validations from '../validations';
import SquareOffOrder from './square-off';
import User from 'entity/user';
import MarginSettings from 'entity/margin-settings';

class ConvertOrder {
  private userId: number | null = null;
  private conversionData: {
    orderId: number;
  };
  private orderData: m_transaction;
  private liveScriptData;
  private queue;

  constructor({
    userId,
    conversionData,
    queue,
  }: {
    userId: number;
    conversionData: { orderId: number };
    queue;
  }) {
    this.conversionData = conversionData;
    this.userId = userId;
    this.queue = queue;
  }

  private async fetchData() {
    const trade = new Trade({ userId: this.userId, redisClient: redisClient });
    let instruments = new Instruments();
    this.orderData = await trade.getOrderById(this.conversionData.orderId);

    this.liveScriptData = await instruments.getLiveScriptDataByTradingSymbol(
      this.orderData.scriptName,
      this.orderData.exchange == 'NSE' ? 'NFO' : this.orderData.exchange,
      redisClient
    );

    return;
  }

  private calculateMaxQuantity(
    price: number,
    lotSize: number,
    marginAvailable: number,
    marginChargedRate: number,
    marginType: 'crore' | 'lot' | string,
    quantityTrade: boolean
  ): { maxQuantity: number; marginExhausted: number } {
    const crore = 10000000; // 1 crore = 10 million

    const calculateMargin = (quantity: number): number => {
      let tradeAmount = quantity * price;
      if (marginType === 'crore') {
        return (marginChargedRate / crore) * tradeAmount;
      } else if (marginType === 'lot') {
        return (quantity / lotSize) * marginChargedRate;
      }
      return 0;
    };

    let maxQuantity = 0;
    let marginRequired = 0;
    const increment = quantityTrade ? 1 : lotSize;

    while (marginRequired <= marginAvailable) {
      maxQuantity += increment;
      marginRequired = calculateMargin(maxQuantity);
    }

    // Adjust maxQuantity and marginRequired to not exceed marginAvailable
    maxQuantity -= increment;
    marginRequired = calculateMargin(maxQuantity);

    // Ensure maxQuantity is a perfect lot if quantityTrade is false
    if (!quantityTrade) {
      maxQuantity -= maxQuantity % lotSize;
    }

    return {
      maxQuantity: maxQuantity,
      marginExhausted: marginRequired,
    };
  }

  private async validateNormalToIntradayOrder() {
    await Validations.qtyValidations(this.userId, null, {
      scriptName: this.orderData.scriptName,
      exchange: this.orderData.exchange,
      quantity: this.orderData.quantityLeft,
      lotSize: this.orderData.lotSize,
      orderType: this.orderData.orderType,
      type: this.orderData.tradeType,
    });

    await Validations.scenarioValidations(this.userId, null, {
      scriptName: this.orderData.scriptName,
      exchange: this.orderData.exchange,
      quantity: this.orderData.quantityLeft,
      orderType: this.orderData.orderType,
      type: this.orderData.tradeType,
    });

    return;
  }

  private async validateIntradayToNormal(tmanager) {
    let ledger = new Ledger({ redisClient, userId: this.userId });
    let margin = new MarginSettings({ userId: this.userId });
    let tradeInQty =
      this.orderData.quantity % this.orderData.lotSize == 0 ? false : true;
    ledger.setTransactionManager(tmanager);
    let releasedAmount =
      (this.orderData.margin / this.orderData.quantity) *
      this.orderData.quantityLeft;
    let currentPL =
      this.orderData.tradeType == 'B'
        ? (this.liveScriptData.buyPrice - this.orderData.buyPrice) *
          this.orderData.quantityLeft
        : (this.orderData.sellPrice - this.liveScriptData.sellPrice) *
          this.orderData.quantityLeft;

    console.log('released amount ', releasedAmount, currentPL);
    if (currentPL < 0) {
      releasedAmount = releasedAmount + currentPL;
    }
    let currentBalance = await ledger.getCreditBalance();
    let actualMarginToTrade = 0;
    console.log('current balance ', currentBalance, releasedAmount);
    actualMarginToTrade = currentBalance + releasedAmount;
    if (actualMarginToTrade < 0) {
      throw new Error('Insufficient balance');
    }

    let price =
      this.orderData.tradeType == 'B'
        ? // @ts-ignore
          parseFloat(this.orderData.buyPrice)
        : // @ts-ignore
          parseFloat(this.orderData.sellPrice);

    let userMarginSetting = await margin.getTradeMarginSettingsByExchange(
      this.orderData.exchange
    );
    let scriptMarginSetting = await margin.getScriptTradeMarginSettingsByName(
      this.orderData.scriptName.match(/^[A-Za-z]+/)![0]
    );

    let marginType = scriptMarginSetting
      ? scriptMarginSetting.marginType
      : userMarginSetting.marginType;

    let marginRate = scriptMarginSetting
      ? scriptMarginSetting.marginType == 'crore'
        ? scriptMarginSetting.marginPerCrore
        : scriptMarginSetting.marginPerLot
      : userMarginSetting.marginType == 'crore'
        ? userMarginSetting.marginPerCrore
        : userMarginSetting.marginPerLot;

    let perUnitMargin = 0;
    let newMargin = 0;
    if (marginType === 'crore') {
      perUnitMargin =
        (marginRate / 10000000) * price -
        // @ts-ignore
        parseFloat(this.orderData.margin / this.orderData.quantity);
      newMargin = (marginRate / 10000000) * price;
    } else {
      perUnitMargin =
        (marginRate / this.orderData.lotSize) * price -
        // @ts-ignore
        parseFloat(this.orderData.margin / this.orderData.quantity);
      newMargin = (marginRate / this.orderData.lotSize) * price;
    }
    console.log(
      'per unit margin ',
      perUnitMargin,
      newMargin,
      actualMarginToTrade
    );
    const maxUnits = Math.floor(actualMarginToTrade / perUnitMargin);
    const maxLots = Math.floor(maxUnits / this.orderData.lotSize);

    // console.log(
    //   'margin rate reqq ',
    //   maxUnits,
    //   maxLots,
    //   actualMarginToTrade,
    //   perUnitMargin,
    //   this.orderData.lotSize
    // );
    // throw new Error('Conversion test');

    // let allowedQuantityData = this.calculateMaxQuantity(
    //   price,
    //   this.orderData.lotSize,
    //   actualMarginToTrade,
    //   scriptMarginSetting
    //     ? scriptMarginSetting.marginType == 'crore'
    //       ? scriptMarginSetting.marginPerCrore
    //       : scriptMarginSetting.marginPerLot
    //     : userMarginSetting.marginType == 'crore'
    //       ? userMarginSetting.marginPerCrore
    //       : userMarginSetting.marginPerLot,
    //   scriptMarginSetting
    //     ? scriptMarginSetting.marginType
    //     : userMarginSetting.marginType,
    //   tradeInQty
    // );

    // if (allowedQuantityData.maxQuantity < 1) {
    //   throw new Error('Conversion not possible');
    // }
    // console.log(
    //   'allowed quantity data ',
    //   allowedQuantityData,
    //   marginType,
    //   marginRate
    // );
    // throw new Error('Conversion test');
    const maxQuantity = tradeInQty
      ? maxUnits
      : maxLots * this.orderData.lotSize;
    if (maxQuantity < 1) {
      throw new Error('Conversion not possible');
    }
    return {
      maxQuantity,
      marginExhausted: maxQuantity * newMargin,
      marginRate,
      marginType,
    };
  }

  public async convertOrder() {
    await this.fetchData();
    let ledger = new Ledger({ redisClient, userId: this.userId });
    let trade = new Trade({ redisClient, userId: this.userId });

    await AppDataSource.transaction(async (tmanager) => {
      ledger.setTransactionManager(tmanager);
      trade.setTransactionManager(tmanager);
      if (this.orderData.isIntraday) {
        //converting to normal
        let allowedQuantity = await this.validateIntradayToNormal(tmanager);

        console.log('allowed quantity ', allowedQuantity);

        //squaring off prev order
        let squareoffmsg: msgType = {
          brokerage: 0,
          brokerageChargedRate: this.orderData.brokerageChargedRate,
          brokerageChargedType: this.orderData.brokerageChargedType,
          isIntraday: true,
          margin: this.orderData.margin,
          marginChargedRate: this.orderData.marginChargedRate,
          marginChargedType: this.orderData.marginChargedType,
          orderCreationDate: moment().toDate(),
          orderType: this.orderData.orderType,
          price: null,
          quantity: allowedQuantity.maxQuantity,
          script:
            this.orderData.exchange == 'NSE'
              ? 'NFO' + ':' + this.orderData.scriptName
              : this.orderData.exchange + ':' + this.orderData.scriptName,
          squareoff: '',
          transactionType: '',
          type: this.orderData.tradeType == 'B' ? 'S' : 'B',
          userId: this.userId,
          execData: this.liveScriptData,
        };

        await this.queue.publish(env.ORDER_QUEUE, JSON.stringify(squareoffmsg));

        //creating new order for normal
        let newOrderMsg: msgType = {
          brokerage: 0,
          brokerageChargedRate: this.orderData.brokerageChargedRate,
          brokerageChargedType: this.orderData.brokerageChargedType,
          isIntraday: false,
          margin: allowedQuantity.marginExhausted,
          marginChargedRate: allowedQuantity.marginRate,
          marginChargedType: allowedQuantity.marginType,
          orderCreationDate: moment().toDate(),
          orderType: this.orderData.orderType,
          price: null,
          quantity: allowedQuantity.maxQuantity,
          script:
            this.orderData.exchange == 'NSE'
              ? 'NFO' + ':' + this.orderData.scriptName
              : this.orderData.exchange + ':' + this.orderData.scriptName,
          squareoff: '',
          transactionType: '',
          type: this.orderData.tradeType,
          userId: this.userId,
          execData: {
            ...this.liveScriptData,
            buyPrice: this.orderData.sellPrice,
            sellPrice: this.orderData.buyPrice,
          },
        };

        await this.queue.publish(env.ORDER_QUEUE, JSON.stringify(newOrderMsg));
        return;
      } else {
        //converting to intraday
        await this.validateNormalToIntradayOrder();
        console.log('=>>>>>>>>>>>>>>validated order ');
        let previousHoldedMargin = await ledger.getLedgerByOrderIdAndParticular(
          {
            orderId: this.conversionData.orderId,
            particularName: 'Margin Hold',
          }
        );
        console.log(
          '=>>>>>>>>>>>>>>previous holded margin ',
          previousHoldedMargin
        );

        //checking released amount
        let releasedAmount = 0;
        if (this.orderData.quantity != this.orderData.quantityLeft) {
          let singleQtyMargin = this.orderData.margin / this.orderData.quantity;
          releasedAmount =
            (this.orderData.quantity - this.orderData.quantityLeft) *
            singleQtyMargin;
        }

        console.log('=>>>>>>>>>>>>>>released amount ', releasedAmount);

        //removing previous holded margin
        await ledger.deleteLedgerById(previousHoldedMargin.id);

        if (releasedAmount > 0) {
          //debiting margin for released amount
          await ledger.debitBalance({
            amount: releasedAmount,
            transactionParticularId:
              previousHoldedMargin.transactionParticular.id,
            currUserId: this.userId,
            transactionRemarks: previousHoldedMargin.transactionRemarks,
            orderId: this.orderData.id,
          });
        }

        //editing or removing previous transaction (edit in case if partial quantity is released, deleted in case if balance quantity is equal to order quantity)
        if (this.orderData.quantity == this.orderData.quantityLeft) {
          //marking order as deleted
          await trade.updateOrder({
            id: this.orderData.id,
            quantityLeft: 0,
            transactionStatus: 'deleted',
          });
        } else {
          await trade.updateOrder({
            id: this.orderData.id,
            quantityLeft: 0,
            transactionStatus: 'closed',
          });
        }
        //calculating new margin
        this.orderData.isIntraday = true;
        let newMargin = await MarginHandler.calculateMargin({
          userId: this.userId,
          orderData: {
            exchangeName: this.orderData.exchange,
            isIntraday: true,
            price: null,
            quantity: this.orderData.quantityLeft,
            tradeType: this.orderData.tradeType,
            tradingSymbol: this.orderData.scriptName,
          },
          scriptData: {
            buyPrice: this.orderData.sellPrice,
            sellPrice: this.orderData.buyPrice,
            lotSize: this.orderData.lotSize,
          },
        });

        let msg: msgType = {
          brokerage: 0,
          brokerageChargedRate: this.orderData.brokerageChargedRate,
          brokerageChargedType: this.orderData.brokerageChargedType,
          isIntraday: true,
          margin: newMargin.marginAmount,
          marginChargedRate: newMargin.marginChargedRate,
          marginChargedType: newMargin.marginType,
          orderCreationDate: moment().toDate(),
          orderType: this.orderData.orderType,
          price: null,
          quantity: this.orderData.quantityLeft,
          script:
            this.orderData.exchange == 'NSE'
              ? 'NFO' + ':' + this.orderData.scriptName
              : this.orderData.exchange + ':' + this.orderData.scriptName,
          squareoff: '',
          transactionType: '',
          type: this.orderData.tradeType,
          userId: this.userId,
          execData: {
            ...this.liveScriptData,
            buyPrice: this.orderData.sellPrice,
            sellPrice: this.orderData.buyPrice,
          },
        };

        console.log('publishing ', msg);
        await this.queue.publish(env.ORDER_QUEUE, JSON.stringify(msg));
      }
      return;
    });
    return;
  }
}

export default ConvertOrder;
