import { AppDataSource } from 'database/sql';
import { m_transaction } from 'database/sql/schema';
import Ledger from 'entity/ledger';
import Trade from 'entity/trade';
import Instruments from 'entity/instruments';
import redisClient from 'lib/redis';
import MarginHandler from '../methods/margin';
import BrokerageHandler from '../methods/brokerage';
import Validations from '../validations';

class EditOrder {
  orderData: m_transaction;
  orderId: number;
  quantity: number;
  price: number;
  userId: number;
  constructor({
    orderId,
    price,
    quantity,
    userId,
  }: {
    orderId: number;
    quantity: number;
    price: number;
    userId: number;
  }) {
    this.orderId = orderId;
    this.price = price;
    this.quantity = quantity;
    this.userId = userId;
  }

  public async editUserPendingOrder() {
    let trade = new Trade({ userId: this.userId, redisClient: redisClient });
    let ledger = new Ledger({ userId: this.userId, redisClient });

    await AppDataSource.transaction(async (tmanager) => {
      trade.setTransactionManager(tmanager);
      ledger.setTransactionManager(tmanager);
      let orderData = await trade.getOrderById(this.orderId);
      this.orderData = orderData;

      if (orderData.transactionStatus != 'pending') {
        throw new Error('Order is executed!!');
      }

      let instrument = new Instruments();
      let scriptData = await instrument.getInstrumentByTradingSymbol(
        orderData.scriptName
      );
      //bid sl checks & all trade scenarios check
      let liveScriptData = await instrument.getLiveScriptDataByTradingSymbol(
        this.orderData.scriptName,
        this.orderData.exchange == 'NSE' ? 'NFO' : this.orderData.exchange,
        redisClient
      );

      let limitType = await Validations.bidSlValidations(
        this.userId,
        {
          exchangeName: this.orderData.exchange,
          lotSize: this.orderData.lotSize,
          orderType: this.orderData.orderType,
          price: this.price,
          quantity: this.quantity,
          scriptName: this.orderData.scriptName,
          type: this.orderData.tradeType,
        },
        null,
        {
          buyPrice: liveScriptData.buyPrice,
          high: liveScriptData.high,
          low: liveScriptData.low,
          sellPrice: liveScriptData.sellPrice,
        }
      );

      await Validations.scenarioValidations(
        this.userId,
        (
          await trade.getAllOpenOrders({ exchange: this.orderData.exchange })
        ).filter((a) => a.id != this.orderData.id),
        {
          exchange: this.orderData.exchange,
          orderType: this.orderData.orderType,
          quantity: this.quantity,
          scriptName: this.orderData.scriptName,
          type: this.orderData.tradeType,
        }
      );

      await ledger.deleteLedgerByOrderId(this.orderId);

      let newMargin = await MarginHandler.calculateMargin({
        userId: this.userId,
        orderData: {
          exchangeName: this.orderData.exchange,
          isIntraday: this.orderData.isIntraday,
          price: this.price,
          quantity: this.quantity,
          tradeType: this.orderData.tradeType,
          tradingSymbol: this.orderData.scriptName,
        },
        scriptData: {
          buyPrice: this.price,
          sellPrice: this.price,
          lotSize: this.orderData.lotSize,
        },
      });

      let newBrokerage = await BrokerageHandler.calculateBrokerage({
        buyPrice: this.price,
        sellPrice: this.price,
        exchangeName: this.orderData.exchange,
        lotSize: this.orderData.lotSize,
        quantity: this.quantity,
        tradeType: this.orderData.tradeType,
        tradingSymbol: this.orderData.scriptName,
        userId: this.userId,
      });

      let currentBalance = await ledger.getCreditBalance();

      if (limitType == 'bid') {
        if (
          currentBalance + this.orderData.margin <
          newMargin.marginAmount + newBrokerage.brokerageAmount
        ) {
          throw new Error('Margin not available');
        }
      } else {
        if (currentBalance < newBrokerage.brokerageAmount) {
          throw new Error('Margin not available');
        }
      }

      if (limitType == 'bid') {
        //creating new margin entry
        await MarginHandler.holdMargin({
          marginAmount: newMargin.marginAmount,
          orderId: this.orderId,
          tmanager,
          userId: this.userId,
        });
      }

      await trade.updateOrder({
        id: this.orderId,
        quantityLeft: this.quantity,
        transactionStatus: 'pending',
        quantity: this.quantity,
        buyPrice: orderData.tradeType == 'B' ? this.price : null,
        sellPrice: orderData.tradeType == 'S' ? this.price : null,
        margin: newMargin.marginAmount,
      });

      await redisClient.hSet(
        `limit-${scriptData.instrument_token}-${orderData.tradeType}`,
        `${this.userId}-${orderData.id}`,
        JSON.stringify({
          userId: this.userId,
          tradeType: orderData.tradeType,
          quantity: this.quantity,
          price: this.price,
          instrumentToken: scriptData.instrument_token,
          exchange: scriptData.exchange,
          tradingsymbol: scriptData.tradingsymbol,
          orderId: this.orderData.id,
          margin: newMargin.marginAmount,
          brokerage: newBrokerage.brokerageAmount,
        })
      );

      return;
    });
    return;
  }

  public async editOpenOrder() {
    await AppDataSource.transaction(async (tmanager) => {
      let ledger = new Ledger({ userId: this.userId, redisClient });
      let trade = new Trade({ userId: this.userId, redisClient });
      let instrument = new Instruments();
      ledger.setTransactionManager(tmanager);
      trade.setTransactionManager(tmanager);

      this.orderData = await trade.getOrderById(this.orderId);
      if (this.orderData.order && this.orderData.order.id) {
        throw new Error(`Limit orders can't be edited.`);
      }
      if (this.orderData.quantity != this.orderData.quantityLeft) {
        throw new Error(`Partial Quantity is sold`);
      }

      // bid sl checks & all trade scenarios check
      console.log('this.orderData ', this.orderData);
      let liveScriptData = await instrument.getLiveScriptDataByTradingSymbol(
        this.orderData.scriptName,
        this.orderData.exchange == 'NSE' ? 'NFO' : this.orderData.exchange,
        redisClient
      );

      console.log('live script data ', liveScriptData);

      await Validations.qtyValidations(
        this.userId,
        (
          await trade.getAllOpenOrders({ exchange: this.orderData.exchange })
        ).filter((a) => a.id != this.orderData.id),
        {
          exchange: this.orderData.exchange,
          orderType: this.orderData.orderType,
          quantity: this.quantity,
          scriptName: this.orderData.scriptName,
          type: this.orderData.tradeType,
          lotSize: this.orderData.lotSize,
        }
      );

      let limitType = await Validations.bidSlValidations(
        this.userId,
        {
          exchangeName: this.orderData.exchange,
          lotSize: this.orderData.lotSize,
          orderType: this.orderData.orderType,
          price: this.price,
          quantity: this.quantity,
          scriptName: this.orderData.scriptName,
          type: this.orderData.tradeType,
        },
        null,
        {
          buyPrice: liveScriptData.buyPrice,
          high: liveScriptData.high,
          low: liveScriptData.low,
          sellPrice: liveScriptData.sellPrice,
        }
      );

      await Validations.scenarioValidations(this.userId, null, {
        exchange: this.orderData.exchange,
        orderType: this.orderData.orderType,
        quantity: this.quantity,
        scriptName: this.orderData.scriptName,
        type: this.orderData.tradeType,
      });

      //calculating updated margin
      let updatedMargin = await MarginHandler.calculateMargin({
        userId: this.userId,
        orderData: {
          exchangeName: this.orderData.exchange,
          isIntraday: this.orderData.isIntraday,
          price: this.price,
          quantity: this.quantity,
          tradeType: this.orderData.tradeType,
          tradingSymbol: this.orderData.scriptName,
        },
        scriptData: {
          lotSize: this.orderData.lotSize,
          buyPrice: this.price,
          sellPrice: this.price,
        },
      });
      //calculating updated brokerage
      let updatedBrokerage = await BrokerageHandler.calculateBrokerage({
        buyPrice: this.price,
        sellPrice: this.price,
        exchangeName: this.orderData.exchange,
        lotSize: this.orderData.lotSize,
        quantity: this.quantity,
        tradeType: this.orderData.tradeType,
        tradingSymbol: this.orderData.scriptName,
        userId: this.userId,
      });

      //checking margin availability for updated amounts
      let currentBalance = await ledger.getCreditBalance();

      if (
        currentBalance + this.orderData.margin + this.orderData.brokerage <
        updatedMargin.marginAmount + updatedBrokerage.brokerageAmount
      ) {
        throw new Error('Margin not available');
      }

      await ledger.deleteLedgerByOrderId(this.orderId);

      //holding updated margin
      await MarginHandler.holdMargin({
        marginAmount: updatedMargin.marginAmount,
        orderId: this.orderId,
        tmanager,
        userId: this.userId,
      });

      //collecting updated brokerage
      await BrokerageHandler.debitBrokerage({
        brokerageAmount: updatedBrokerage.brokerageAmount,
        orderId: this.orderId,
        tmanager,
        userId: this.userId,
      });

      //editing trade
      await trade.editOrderById(
        this.orderId,
        this.orderData.tradeType == 'B' ? this.price : null,
        this.orderData.tradeType == 'S' ? this.price : null,
        this.quantity,
        updatedMargin.marginAmount,
        updatedBrokerage.brokerageAmount
      );

      //fetching instrument token details for this trade
      let instrumentData = await instrument.getInstrumentByTradingSymbol(
        this.orderData.scriptName
      );
      await redisClient.hSet(`margin-user-${this.userId}`, {
        [`${instrumentData.instrument_token}-P`]: this.price,
        [`${instrumentData.instrument_token}-Q`]: this.quantity,
      });

      return;
    });

    return;
  }
}

export default EditOrder;
