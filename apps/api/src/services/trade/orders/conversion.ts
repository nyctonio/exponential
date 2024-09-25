import { AppDataSource } from 'database/sql';
import {
  m_intradaytrademarginsetting,
  m_scriptintradaymarginsetting,
  m_scripttrademarginsetting,
  m_trademarginsetting,
  m_transaction,
} from 'database/sql/schema';
import Ledger from 'entity/ledger';
import MarginSettings from 'entity/margin-settings';
import Trade from 'entity/trade';
import redisClient from 'lib/redis';
// import { Orders, OrderProcessor } from 'order';
import OrdersService, { OrderPublishMsg } from '.';
import moment from 'moment';

class ConversionService {
  private userId: number | null = null;
  private conversionData: {
    orderId: number;
  };
  private orderData: m_transaction;
  private prefetchData: {
    marginSetting: m_trademarginsetting;
    scriptMarginSetting: m_scripttrademarginsetting;
    intradayMarginSetting: m_intradaytrademarginsetting;
    intradayScriptMarginSetting: m_scriptintradaymarginsetting;
  };
  private marginAmount: number;

  constructor({
    userId,
    conversionData,
  }: {
    userId: number;
    conversionData: { orderId: number };
  }) {
    this.conversionData = conversionData;
    this.userId = userId;
  }

  private async fetchData() {
    const margin = new MarginSettings({ userId: this.userId });
    const trade = new Trade({ userId: this.userId, redisClient: redisClient });
    this.orderData = await trade.getOrderById(this.conversionData.orderId);

    const [
      marginSetting,
      scriptMarginSetting,
      intradayMarginSetting,
      intradayScriptMarginSetting,
    ] = await Promise.all([
      margin.getTradeMarginSettingsByExchange(
        this.orderData.exchange == 'NFO' ? 'NSE' : this.orderData.exchange
      ), // 8
      margin.getScriptTradeMarginSettingsByName(
        this.orderData.scriptName.match(/^[A-Za-z]+/)![0]
      ), // 9
      margin.getIntradayMarginSettingsByExchange(
        this.orderData.exchange == 'NFO' ? 'NSE' : this.orderData.exchange
      ), // 10
      margin.getScriptIntradayTradeMarginSettingsByName(
        this.orderData.scriptName.match(/^[A-Za-z]+/)![0]
      ), // 11
    ]);

    this.prefetchData = {
      intradayMarginSetting,
      intradayScriptMarginSetting,
      marginSetting,
      scriptMarginSetting,
    };
    return;
  }

  private calculateMargin() {
    let marginAmount;
    if (this.orderData.isIntraday && this.prefetchData.intradayMarginSetting) {
      if (this.prefetchData.intradayScriptMarginSetting) {
        if (this.prefetchData.intradayScriptMarginSetting.marginType == 'lot') {
          marginAmount =
            (this.orderData.quantityLeft / Number(this.orderData.lotSize)) *
            this.prefetchData.intradayScriptMarginSetting.marginPerLot;
        } else {
          marginAmount =
            (this.prefetchData.intradayScriptMarginSetting.marginPerCrore /
              10000000) *
            (this.orderData.tradeType == 'B'
              ? this.orderData.buyPrice * this.orderData.quantityLeft
              : this.orderData.sellPrice * this.orderData.quantityLeft);
        }
      } else {
        if (this.prefetchData.intradayMarginSetting.marginType == 'lot') {
          marginAmount =
            (this.orderData.quantityLeft / Number(this.orderData.lotSize)) *
            this.prefetchData.intradayMarginSetting.marginPerLot;
        } else {
          marginAmount =
            (this.prefetchData.intradayMarginSetting.marginPerCrore /
              10000000) *
            (this.orderData.tradeType == 'B'
              ? this.orderData.buyPrice * this.orderData.quantityLeft
              : this.orderData.sellPrice * this.orderData.quantityLeft);
        }
      }
    } else {
      if (this.prefetchData.scriptMarginSetting) {
        if (this.prefetchData.scriptMarginSetting.marginType == 'lot') {
          marginAmount =
            (this.orderData.quantityLeft / Number(this.orderData.lotSize)) *
            this.prefetchData.scriptMarginSetting.marginPerLot;
        } else {
          marginAmount =
            (this.prefetchData.scriptMarginSetting.marginPerCrore / 10000000) *
            (this.orderData.tradeType == 'B'
              ? this.orderData.buyPrice * this.orderData.quantityLeft
              : this.orderData.sellPrice * this.orderData.quantityLeft);
        }
      } else {
        if (this.prefetchData.marginSetting.marginType == 'lot') {
          marginAmount =
            (this.orderData.quantityLeft / Number(this.orderData.lotSize)) *
            this.prefetchData.marginSetting.marginPerLot;
        } else {
          marginAmount =
            (this.prefetchData.marginSetting.marginPerCrore / 10000000) *
            (this.orderData.tradeType == 'B'
              ? this.orderData.buyPrice * this.orderData.quantityLeft
              : this.orderData.sellPrice * this.orderData.quantityLeft);
        }
      }
    }

    marginAmount = Number(Number(marginAmount).toFixed(2));
    this.marginAmount = marginAmount;
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

  private async validateNormalOrder(tmanager) {
    let ledger = new Ledger({ redisClient, userId: this.userId });
    ledger.setTransactionManager(tmanager);
    let tradeInQty =
      this.orderData.quantity % this.orderData.lotSize == 0 ? false : true;
    let releasedAmount =
      (this.orderData.margin / this.orderData.quantity) *
      this.orderData.quantityLeft;
    let currentBalance = await ledger.getCreditBalance();
    let actualMarginToTrade = 0;
    if (currentBalance < releasedAmount) {
      actualMarginToTrade = currentBalance;
    } else {
      actualMarginToTrade = releasedAmount;
    }
  }

  private async validateIntradayOrder() {}

  public async convertOrder() {
    await this.fetchData();
    let ledger = new Ledger({ redisClient, userId: this.userId });
    let trade = new Trade({ redisClient, userId: this.userId });
    let liveScriptData = JSON.parse(
      await redisClient.get(
        `live-${
          (this.orderData.exchange == 'NSE' ? 'NFO' : this.orderData.exchange) +
          ':' +
          this.orderData.scriptName
        }`
      )
    );
    await AppDataSource.transaction(async (tmanager) => {
      ledger.setTransactionManager(tmanager);
      trade.setTransactionManager(tmanager);
      if (this.orderData.isIntraday) {
        //converting to normal
        let tradeInQty =
          this.orderData.quantity % this.orderData.lotSize == 0 ? false : true;
        console.log('trade in quantity ', tradeInQty);

        //squaring off this order for evaluating PL
        // await Orders.createOrder(
        //   {
        //     brokerage: 0,
        //     brokerageChargedRate: this.orderData.brokerageChargedRate,
        //     brokerageChargedType: this.orderData.brokerageChargedType,
        //     isIntraday: true,
        //     margin: this.orderData.margin,
        //     marginChargedRate: this.orderData.marginChargedRate,
        //     marginChargedType: this.orderData.marginChargedType,
        //     orderCreationDate: moment().toDate(),
        //     orderType: this.orderData.orderType,
        //     quantity: this.orderData.quantityLeft,
        //     script:
        //       (this.orderData.exchange == 'NSE'
        //         ? 'NFO'
        //         : this.orderData.exchange) +
        //       ':' +
        //       this.orderData.scriptName,
        //     squareoff: 'system squareoff',
        //     price: null,
        //     transactionType: '',
        //     type: this.orderData.tradeType == 'B' ? 'S' : 'B',
        //     userId: this.userId,
        //     liveScriptData: {
        //       ...liveScriptData,
        //     },
        //   },
        //   tmanager,
        //   redisClient
        // );

        let releasedAmount =
          (this.orderData.margin / this.orderData.quantity) *
          this.orderData.quantityLeft;

        console.log('released amount ', releasedAmount);

        //getting current balance and released margin amount
        let currentBalance = await ledger.getCreditBalance();
        let actualMarginToTrade = 0;
        if (currentBalance < releasedAmount) {
          actualMarginToTrade = currentBalance;
        } else {
          actualMarginToTrade = releasedAmount;
        }

        // console.log(
        //   'current balance ',
        //   currentBalance,
        //   ' actual margin to trade ',
        //   actualMarginToTrade
        // );

        console.log('this order data ', this.orderData);
        let price =
          this.orderData.tradeType == 'B'
            ? this.orderData.buyPrice
            : this.orderData.sellPrice;

        console.log(
          'in func ',
          price,
          this.orderData.lotSize,
          actualMarginToTrade,
          this.orderData.marginChargedRate,
          this.orderData.marginChargedType,
          tradeInQty
        );

        let allowedQuantityData = this.calculateMaxQuantity(
          price,
          this.orderData.lotSize,
          actualMarginToTrade,
          this.orderData.marginChargedRate,
          this.orderData.marginChargedType,
          tradeInQty
        );

        console.log('allowed quantity data ', allowedQuantityData);

        // let OrderMsg: OrderPublishMsg = {
        //   brokerage: 0,
        //   brokerageChargedRate: this.orderData.brokerageChargedRate,
        //   brokerageChargedType: this.orderData.brokerageChargedType,
        //   isIntraday: false,
        //   margin: allowedQuantityData.marginExhausted,
        //   marginChargedRate: this.orderData.marginChargedRate,
        //   marginChargedType: this.orderData.marginChargedType,
        //   orderCreationDate: moment().toDate(),
        //   orderType: this.orderData.orderType,
        //   quantity: allowedQuantityData.maxQuantity,
        //   script:
        //     (this.orderData.exchange == 'NSE'
        //       ? 'NFO'
        //       : this.orderData.exchange) +
        //     ':' +
        //     this.orderData.scriptName,
        //   price: null,
        //   transactionType: '',
        //   type: this.orderData.tradeType,
        //   userId: this.userId,
        //   liveScriptData: {
        //     ...liveScriptData,
        //     buyPrice:
        //       this.orderData.tradeType == 'S'
        //         ? this.orderData.sellPrice
        //         : this.orderData.buyPrice,
        //     sellPrice:
        //       this.orderData.tradeType == 'B'
        //         ? this.orderData.buyPrice
        //         : this.orderData.sellPrice,
        //   },
        // };
        // console.log('=>>>>>>>>order msg ', OrderMsg);
        // await Orders.createOrder(OrderMsg, tmanager, redisClient);
      } else {
        //converting to intraday
        let previousHoldedMargin = await ledger.getLedgerByOrderIdAndParticular(
          {
            orderId: this.conversionData.orderId,
            particularName: 'Margin Hold',
          }
        );

        //checking released amount
        let releasedAmount = 0;
        if (this.orderData.quantity != this.orderData.quantityLeft) {
          let singleQtyMargin = this.orderData.margin / this.orderData.quantity;
          releasedAmount =
            (this.orderData.quantity - this.orderData.quantityLeft) *
            singleQtyMargin;
        }

        console.log('released amount ', releasedAmount);

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
        this.calculateMargin();
        //creating msg type and creating new order
        // let OrderMsg: OrderPublishMsg = {
        //   brokerage: 0,
        //   brokerageChargedRate: this.orderData.brokerageChargedRate,
        //   brokerageChargedType: this.orderData.brokerageChargedType,
        //   isIntraday: true,
        //   margin: this.marginAmount,
        //   marginChargedRate: this.orderData.marginChargedRate,
        //   marginChargedType: this.orderData.marginChargedType,
        //   orderCreationDate: moment().toDate(),
        //   orderType: this.orderData.orderType,
        //   quantity: this.orderData.quantityLeft,
        //   script:
        //     (this.orderData.exchange == 'NSE'
        //       ? 'NFO'
        //       : this.orderData.exchange) +
        //     ':' +
        //     this.orderData.scriptName,
        //   price: null,
        //   transactionType: '',
        //   type: this.orderData.tradeType,
        //   userId: this.userId,
        //   liveScriptData: {
        //     ...liveScriptData,
        //     buyPrice:
        //       this.orderData.tradeType == 'S'
        //         ? this.orderData.sellPrice
        //         : this.orderData.buyPrice,
        //     sellPrice:
        //       this.orderData.tradeType == 'B'
        //         ? this.orderData.buyPrice
        //         : this.orderData.sellPrice,
        //   },
        // };
        // console.log('=>>>>>>>>order msg ', OrderMsg);
        // await Orders.createOrder(OrderMsg, tmanager, redisClient);
      }
      return;
    });
    return;
  }
}

export default ConversionService;
