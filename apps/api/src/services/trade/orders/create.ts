import {
  m_exchangesetting,
  m_instruments,
  m_intradaytrademarginsetting,
  m_scriptbrokeragesetting,
  m_scriptintradaymarginsetting,
  m_scriptquantity,
  m_scripttrademarginsetting,
  m_trademarginsetting,
  m_transaction,
  m_userbidstopsettings,
  m_userbrokeragesetting,
  m_usercuttingsettings,
  m_usermcxbidstopsettings,
} from 'database/sql/schema';
import OrdersService, { Order, OrderPublishMsg } from '.';
import Ledger from 'entity/ledger';
import Trade from 'entity/trade';
import ExchangeSetting from 'entity/exchange-settings';
import redisClient from 'lib/redis';
import BrokerageSettings from 'entity/brokerage-settings';
import MarginSettings from 'entity/margin-settings';
import AutoCutSetttings from 'entity/auto-cut-settings';
import Instruments from 'entity/instruments';
import { env } from 'env';
import { queue } from '../../../lib/queue';
import moment from 'moment';
import OrderUtils from './utils';
// import { Orders } from 'order';
import { AppDataSource } from 'database/sql';

class CreateOrderService {
  private orderData: Order | null = null;
  private squareOff: boolean = null;
  private userId: number | null = null;
  private tradingSymbol: string | null = null;
  private exchangeName: string | null = null;
  private instrumentName: string | null = null;
  private brokerageAmount: number | null = null;
  private marginAmount: number | null = null;
  private transactionType: '' | 'bid' | 'sl' | null = null; //bid | sl

  private prefetchData: {
    balance: number;
    unrealizedPL: number;
    openOrders: m_transaction[];
    exchangeSetting: m_exchangesetting;
    scriptExchangeSetting: m_scriptquantity;
    brokerageSetting: m_userbrokeragesetting;
    scriptBrokerageSetting: m_scriptbrokeragesetting;
    marginSetting: m_trademarginsetting;
    scriptMarginSetting: m_scripttrademarginsetting;
    intradayMarginSetting: m_intradaytrademarginsetting;
    intradayScriptMarginSetting: m_scriptintradaymarginsetting;
    autoBidStopSetting: {
      bidStopSettings: m_userbidstopsettings[];
      mcxBidStopSettings: m_usermcxbidstopsettings[];
      cuttingSettings: m_usercuttingsettings[];
    };
    scriptData: m_instruments;
    liveScriptData: any;
  };

  constructor(data: Order, userId: number, squareOff: boolean = false) {
    this.orderData = data;
    this.userId = userId;
    this.tradingSymbol = data.script.split(':')[1];
    this.exchangeName =
      data.script.split(':')[0] == 'NFO' ? 'NSE' : data.script.split(':')[0];
    this.instrumentName = this.tradingSymbol.match(/^[A-Za-z]+/)![0];
    this.squareOff = squareOff;
  }

  private async fetchUserData() {
    const ledger = new Ledger({
      userId: this.userId,
      redisClient: redisClient,
    });
    const trade = new Trade({ redisClient, userId: this.userId });
    const scriptQuantitySetting = new ExchangeSetting({ userId: this.userId });
    const brokerage = new BrokerageSettings({ userId: this.userId });
    const margin = new MarginSettings({ userId: this.userId });
    const autoBidStop = new AutoCutSetttings(this.userId);
    const instrument = new Instruments();
    let [
      balance, // 1
      unrealizedPL, // 2
      openOrders, // 3
      exchangeSetting, // 4
      scriptExchangeSetting, // 5
      brokerageSetting, // 6
      scriptBrokerageSetting, // 7
      marginSetting, // 8
      scriptMarginSetting, // 9
      intradayMarginSetting, // 10
      intradayScriptMarginSetting, // 11
      autoBidStopSetting, // 12
      scriptData, // 13
      liveScriptData, // 14
    ] = await Promise.all([
      ledger.getCreditBalance(), // 1
      ledger.getUnrealizedPL(), // 2
      trade.getAllOpenOrders({
        exchange: this.exchangeName,
      }), // 3
      scriptQuantitySetting.getCustomExchangeSetting({
        exchangeName: this.exchangeName,
        exchangeMaxLotSize: true,
        isExchangeActive: true,
        scriptMaxLotSize: true,
        tradeMaxLotSize: true,
      }), // 4
      scriptQuantitySetting.getCustomScriptExchangeSetting({
        scriptName: this.instrumentName,
      }), // 5
      brokerage.getBrokerageSettings(this.exchangeName), // 6
      brokerage.getScriptBrokerageSettingsByName({
        names: [this.instrumentName],
      }), // 7
      margin.getTradeMarginSettingsByExchange(this.exchangeName), // 8
      margin.getScriptTradeMarginSettingsByName(this.instrumentName), // 9
      margin.getIntradayMarginSettingsByExchange(this.exchangeName), // 10
      margin.getScriptIntradayTradeMarginSettingsByName(this.instrumentName), // 11
      autoBidStop.getAutoCutSettings(), // 12
      instrument.getInstrumentByTradingSymbol(this.tradingSymbol), // 13
      redisClient.get(`live-${this.orderData.script}`), // 14
    ]);

    this.prefetchData = {
      balance,
      autoBidStopSetting,
      brokerageSetting: brokerageSetting[0],
      exchangeSetting: exchangeSetting[0],
      intradayMarginSetting,
      intradayScriptMarginSetting,
      marginSetting,
      openOrders,
      scriptBrokerageSetting: scriptBrokerageSetting[0],
      scriptExchangeSetting: scriptExchangeSetting[0],
      scriptMarginSetting,
      unrealizedPL,
      scriptData,
      liveScriptData: JSON.parse(liveScriptData),
    };
    return;
  }

  private exchangeLevelChecks() {
    // declaring limits
    const exch_max_lot_size =
      this.prefetchData.exchangeSetting.exchangeMaxLotSize;
    const script_max_lot_size = this.prefetchData.scriptExchangeSetting
      ? this.prefetchData.scriptExchangeSetting.scriptMaxLotSize
      : this.prefetchData.exchangeSetting.scriptMaxLotSize;
    const trade_max_lot_size = this.prefetchData.scriptExchangeSetting
      ? this.prefetchData.scriptExchangeSetting.tradeMaxLotSize
      : this.prefetchData.exchangeSetting.tradeMaxLotSize;
    const trade_min_lot_size =
      this.prefetchData.scriptExchangeSetting &&
      this.prefetchData.scriptExchangeSetting.tradeMinLotSize;
    // lots calculation
    let lots = Math.ceil(
      Number(this.orderData.quantity) /
        Number(this.prefetchData.scriptData.lot_size)
    );
    // min per shot validation
    if (trade_min_lot_size)
      if (lots < trade_min_lot_size) throw new Error('Min LotSize not reached');
    // per shot validation
    if (lots > trade_max_lot_size) throw new Error('Trade LotSize exceeded');
    // for open orders
    const allOrdersOfScript = this.prefetchData.openOrders.filter(
      (order) => order.scriptName == this.tradingSymbol
    );
    OrderUtils.checkAllTradeScenarios(allOrdersOfScript, {
      orderType: this.orderData.orderType,
      quantity: this.orderData.quantity,
      type: this.orderData.type,
    });
    // const allOrdersOfScriptAndPending = allOrdersOfScript.filter(
    //   (_order) =>
    //     _order.transactionStatus == 'pending' &&
    //     _order.scriptName == this.tradingSymbol &&
    //     _order.tradeType == this.orderData.type
    // );

    // console.log(order.type, order.orderType, order.quantity);

    // it means there are pending orders of the script

    if (this.prefetchData.openOrders.length > 0) {
      const openOrdersLots = this.prefetchData.openOrders.reduce(
        (acc, _order) => {
          const scriptLotSize = Math.ceil(_order.quantityLeft / _order.lotSize);
          // script qty checks
          if (_order.scriptName == this.orderData.script) {
            // if purchase type is different
            if (_order.tradeType != this.orderData.type) {
              return acc + Math.abs(scriptLotSize - lots);
            }
            if (scriptLotSize + lots > script_max_lot_size)
              throw new Error('Script LotSize exceeded');
          }
          return acc + scriptLotSize;
        },
        0
      );

      // exchange qty checks
      if (openOrdersLots + lots > exch_max_lot_size)
        throw new Error('Exch LotSize exceeded');
    }
    return true;
  }

  private autoBidStopChecks() {
    if (this.orderData.orderType == 'market') return;
    // why???
    const open_order = this.prefetchData.openOrders.filter(
      (order) => order.transactionStatus == 'open'
    )[0];
    console.log('open order is ', open_order);
    // either there is no open and pending order or ig there is an open order then new order should be of same type and there should not be any pending order of same type
    let transactionType;
    if (
      !open_order ||
      (open_order && open_order.tradeType == this.orderData.type)
    ) {
      // fresh bid order
      transactionType = 'bid';
      const bid_Settings =
        this.prefetchData.autoBidStopSetting.bidStopSettings.filter(
          (setting) => setting.option == 'Bid Activate'
        );
      if (bid_Settings.length > 0) {
        const bid_setting = bid_Settings[0];
        // @ts-ignore
        if (
          this.orderData.price >
            parseFloat(this.prefetchData.liveScriptData.high) ||
          this.orderData.price <
            parseFloat(this.prefetchData.liveScriptData.low)
        ) {
          if (!bid_setting.outside) {
            throw new Error('Outside High Low not allowed');
          }
        } else {
          if (!bid_setting.between) {
            throw new Error('Between High Low not allowed');
          }
        }
        if (this.exchangeName == 'MCX') {
          const mcx_bid_setting =
            this.prefetchData.autoBidStopSetting.mcxBidStopSettings.filter(
              (setting) => setting.instrumentName == this.instrumentName
            )[0];
          if (!mcx_bid_setting) {
            throw new Error('MCX Bid Stop Settings not found');
          }
          const allowed_price = mcx_bid_setting.bidValue;
          if (this.orderData.type == 'B') {
            // buy bid  (if order is of type B then it will be executed on sell price)
            const cmp = parseFloat(this.prefetchData.liveScriptData.sellPrice);
            // @ts-ignore
            if (
              this.orderData.price > cmp + allowed_price ||
              this.orderData.price < cmp - allowed_price
            ) {
              throw new Error('Bid price is less or more than Allowed');
            }
          } else {
            // sell bid
            const cmp = parseFloat(this.prefetchData.liveScriptData.buyPrice);
            // @ts-ignore
            if (
              this.orderData.price > cmp + allowed_price ||
              this.orderData.price < cmp - allowed_price
            ) {
              throw new Error('Bid price is less or more than Allowed');
            }
          }
        } else {
          const percentage = bid_setting.cmp;
          if (this.orderData.type == 'B') {
            // buy bid
            const cmp = parseFloat(this.prefetchData.liveScriptData.sellPrice);
            // @ts-ignore
            if (
              this.orderData.price > cmp + (percentage * cmp) / 100 ||
              this.orderData.price < cmp - (percentage * cmp) / 100
            ) {
              throw new Error('Bid price is less or more than Allowed');
            }
          } else {
            // sell bid
            const cmp = parseFloat(this.prefetchData.liveScriptData.buyPrice);
            // @ts-ignore
            if (
              this.orderData.price > cmp + (percentage * cmp) / 100 ||
              this.orderData.price < cmp - (percentage * cmp) / 100
            ) {
              throw new Error('Bid price is less or more than Allowed');
            }
          }
        }
      } else {
        throw new Error('Bid Stop Settings not found');
      }
    } else {
      // check if already a pending order is there (reject this order if already a pending order is there)
      // stop loss order
      transactionType = 'sl';
      // if (pending_order && pending_order.tradeType == order.type) {
      //   throw new Error('Pending order already there');
      // }
      if (open_order) {
        if (this.orderData.quantity > open_order.quantityLeft) {
          throw new Error('Quantity is more than open order quantity');
        }
        const bid_Settings =
          this.prefetchData.autoBidStopSetting.bidStopSettings.filter(
            (setting) => setting.option == 'Stop Loss Activate'
          );
        if (bid_Settings.length > 0) {
          const bid_setting = bid_Settings[0];
          // @ts-ignore
          if (
            this.orderData.price >
              parseFloat(this.prefetchData.liveScriptData.high) ||
            this.orderData.price <
              parseFloat(this.prefetchData.liveScriptData.low)
          ) {
            if (!bid_setting.outside) {
              throw new Error('Outside High Low not allowed');
            }
          } else {
            if (!bid_setting.between) {
              throw new Error('Between High Low not allowed');
            }
          }
          if (this.exchangeName == 'MCX') {
            const mcx_bid_setting =
              this.prefetchData.autoBidStopSetting.mcxBidStopSettings.filter(
                (setting) => setting.instrumentName == this.instrumentName
              )[0];
            if (!mcx_bid_setting) {
              throw new Error('MCX Bid Stop Settings not found');
            }
            const allowed_price = mcx_bid_setting.stopLossValue;
            if (this.orderData.type == 'B') {
              // buy bid
              const cmp = parseFloat(
                this.prefetchData.liveScriptData.sellPrice
              );
              // @ts-ignore
              if (
                this.orderData.price > cmp + allowed_price ||
                this.orderData.price < cmp - allowed_price
              ) {
                throw new Error('Bid price is less or more than Allowed');
              }
            } else {
              // sell bid
              const cmp = parseFloat(this.prefetchData.liveScriptData.buyPrice);
              // @ts-ignore
              if (
                this.orderData.price > cmp + allowed_price ||
                this.orderData.price < cmp - allowed_price
              ) {
                throw new Error('Bid price is less or more than Allowed');
              }
            }
          } else {
            const percentage = bid_setting.cmp;
            if (this.orderData.type == 'B') {
              // buy bid
              const cmp = parseFloat(
                this.prefetchData.liveScriptData.sellPrice
              );
              // @ts-ignore
              if (
                this.orderData.price > cmp + (percentage * cmp) / 100 ||
                this.orderData.price < cmp - (percentage * cmp) / 100
              ) {
                throw new Error('Bid price is less or more than Allowed');
              }
            } else {
              // sell bid
              const cmp = parseFloat(this.prefetchData.liveScriptData.buyPrice);
              // @ts-ignore
              if (
                this.orderData.price > cmp + (percentage * cmp) / 100 ||
                this.orderData.price < cmp - (percentage * cmp) / 100
              ) {
                throw new Error('Bid price is less or more than Allowed');
              }
            }
          }
        } else {
          throw new Error('Bid Stop Settings not found');
        }
      } else {
        throw new Error('Already a pending order is there');
      }
    }
    this.transactionType = transactionType;
    return;
  }

  private calculateBrokerage() {
    const brokerage = this.prefetchData.brokerageSetting;
    const script_brokerage = this.prefetchData.scriptBrokerageSetting;

    console.log('brokerage is ', brokerage, ' and ', script_brokerage);

    let brokerageAmount: number;
    if (script_brokerage) {
      // script brokerage will be applicable
      const script_brokerage_settings = script_brokerage;
      if (script_brokerage_settings.brokerageType == 'lot') {
        brokerageAmount =
          script_brokerage_settings.brokeragePerLotAmt *
          (this.orderData.quantity /
            parseInt(this.prefetchData.liveScriptData.lotSize));
      } else {
        brokerageAmount =
          (script_brokerage_settings.brokeragePerCroreAmt / 10000000) *
          (this.orderData.type == 'B'
            ? this.orderData.orderType == 'market'
              ? Number(this.prefetchData.liveScriptData.sellPrice) *
                this.orderData.quantity
              : Number(this.orderData.price) * this.orderData.quantity
            : this.orderData.orderType == 'market'
              ? Number(this.prefetchData.liveScriptData.buyPrice) *
                this.orderData.quantity
              : Number(this.orderData.price) * this.orderData.quantity);
      }
    } else if (brokerage) {
      // exchange brokerage will be applicable
      const exchange_brokerage_settings = brokerage;
      if (exchange_brokerage_settings.brokerageType == 'lot') {
        brokerageAmount =
          exchange_brokerage_settings.brokeragePerLotAmt *
          (this.orderData.quantity /
            parseInt(this.prefetchData.liveScriptData.lotSize));
      } else {
        brokerageAmount =
          (exchange_brokerage_settings.brokeragePerCroreAmt / 10000000) *
          (this.orderData.type == 'B'
            ? this.orderData.orderType == 'market'
              ? Number(this.prefetchData.liveScriptData.sellPrice) *
                this.orderData.quantity
              : Number(this.orderData.price) * this.orderData.quantity
            : this.orderData.orderType == 'market'
              ? Number(this.prefetchData.liveScriptData.buyPrice) *
                this.orderData.quantity
              : Number(this.orderData.price) * this.orderData.quantity);
      }
    } else {
      throw new Error('Brokerage Settings not found');
    }
    console.log('brokerage amount is ', brokerageAmount);
    brokerageAmount = Number(Number(brokerageAmount).toFixed(2));
    console.log('brokerage amount is ', brokerageAmount);
    this.brokerageAmount = brokerageAmount;
    return;
  }

  private calculateMargin() {
    let marginAmount;
    if (this.orderData.isIntraday && this.prefetchData.intradayMarginSetting) {
      if (this.prefetchData.intradayScriptMarginSetting) {
        if (this.prefetchData.intradayScriptMarginSetting.marginType == 'lot') {
          marginAmount =
            (this.orderData.quantity /
              Number(this.prefetchData.scriptData.lot_size)) *
            this.prefetchData.intradayScriptMarginSetting.marginPerLot;
        } else {
          marginAmount =
            (this.prefetchData.intradayScriptMarginSetting.marginPerCrore /
              10000000) *
            (this.orderData.type == 'B'
              ? this.orderData.orderType == 'market'
                ? Number(this.prefetchData.liveScriptData.sellPrice) *
                  this.orderData.quantity
                : Number(this.orderData.price) * this.orderData.quantity
              : this.orderData.orderType == 'market'
                ? Number(this.prefetchData.liveScriptData.buyPrice) *
                  this.orderData.quantity
                : Number(this.orderData.price) * this.orderData.quantity);
        }
      } else {
        if (this.prefetchData.intradayMarginSetting.marginType == 'lot') {
          marginAmount =
            (this.orderData.quantity /
              Number(this.prefetchData.scriptData.lot_size)) *
            this.prefetchData.intradayMarginSetting.marginPerLot;
        } else {
          marginAmount =
            (this.prefetchData.intradayMarginSetting.marginPerCrore /
              10000000) *
            (this.orderData.type == 'B'
              ? this.orderData.orderType == 'market'
                ? Number(this.prefetchData.liveScriptData.buyPrice) *
                  this.orderData.quantity
                : Number(this.orderData.price) * this.orderData.quantity
              : this.orderData.orderType == 'market'
                ? Number(this.prefetchData.liveScriptData.sellPrice) *
                  this.orderData.quantity
                : Number(this.orderData.price) * this.orderData.quantity);
        }
      }
    } else {
      if (this.prefetchData.scriptMarginSetting) {
        if (this.prefetchData.scriptMarginSetting.marginType == 'lot') {
          marginAmount =
            (this.orderData.quantity /
              Number(this.prefetchData.scriptData.lot_size)) *
            this.prefetchData.scriptMarginSetting.marginPerLot;
        } else {
          marginAmount =
            (this.prefetchData.scriptMarginSetting.marginPerCrore / 10000000) *
            (this.orderData.type == 'B'
              ? this.orderData.orderType == 'market'
                ? Number(this.prefetchData.liveScriptData.sellPrice) *
                  this.orderData.quantity
                : Number(this.orderData.price) * this.orderData.quantity
              : this.orderData.orderType == 'market'
                ? Number(this.prefetchData.liveScriptData.buyPrice) *
                  this.orderData.quantity
                : Number(this.orderData.price) * this.orderData.quantity);
        }
      } else {
        if (this.prefetchData.marginSetting.marginType == 'lot') {
          marginAmount =
            (this.orderData.quantity /
              Number(this.prefetchData.scriptData.lot_size)) *
            this.prefetchData.marginSetting.marginPerLot;
        } else {
          marginAmount =
            (this.prefetchData.marginSetting.marginPerCrore / 10000000) *
            (this.orderData.type == 'B'
              ? this.orderData.orderType == 'market'
                ? Number(this.prefetchData.liveScriptData.sellPrice) *
                  this.orderData.quantity
                : Number(this.orderData.price) * this.orderData.quantity
              : this.orderData.orderType == 'market'
                ? Number(this.prefetchData.liveScriptData.buyPrice) *
                  this.orderData.quantity
                : Number(this.orderData.price) * this.orderData.quantity);
        }
      }
    }

    marginAmount = Number(Number(marginAmount).toFixed(2));

    if (this.prefetchData.openOrders.length > 0) {
      let balQuantity = this.orderData.quantity;
      let filteredOrders = this.prefetchData.openOrders.filter(
        (a) =>
          a.scriptName == this.orderData.script &&
          a.tradeType != this.orderData.orderType &&
          a.transactionStatus == 'open'
      );
      if (filteredOrders.length > 0) {
        filteredOrders.map((a) => {
          if (balQuantity > 0) {
            if (a.quantityLeft <= balQuantity) {
              marginAmount =
                marginAmount - (a.margin / a.quantity) * a.quantityLeft;
              balQuantity = balQuantity - a.quantityLeft;
            } else {
              marginAmount =
                marginAmount - (a.margin / a.quantity) * balQuantity;
              balQuantity = 0;
            }
          }
        });
      }
    }

    this.marginAmount = marginAmount;
    return;
  }

  public async createOrder() {
    //fetching user default data
    await this.fetchUserData();
    if (!this.squareOff) {
      this.exchangeLevelChecks();
      console.log('passed');
    }
    this.autoBidStopChecks();
    this.calculateBrokerage();
    this.calculateMargin();

    if (!this.squareOff) {
      // check for unrealized pl
      if (
        this.prefetchData.unrealizedPL > 0
          ? this.brokerageAmount + this.marginAmount > this.prefetchData.balance
          : this.brokerageAmount +
              this.marginAmount +
              this.prefetchData.unrealizedPL >
            this.prefetchData.balance
      ) {
        throw new Error('Margin not available');
      }
    }

    // TODO - send brokerage and margin applied in the queue naming (schema)
    let msg = {
      userId: this.userId,
      type: this.orderData.type,
      script: this.orderData.script,
      orderType: this.orderData.orderType,
      quantity: this.orderData.quantity,
      price: this.orderData.price,
      isIntraday: this.orderData.isIntraday,
      orderCreationDate: moment().utc().toDate(),
      margin: this.marginAmount,
      brokerage: this.brokerageAmount,
      transactionType: this.transactionType,
      marginChargedType: this.orderData.isIntraday
        ? this.prefetchData.intradayScriptMarginSetting
          ? this.prefetchData.intradayScriptMarginSetting.marginType
          : this.prefetchData.intradayMarginSetting.marginType
        : this.prefetchData.scriptMarginSetting
          ? this.prefetchData.scriptMarginSetting.marginType
          : this.prefetchData.marginSetting.marginType,
      marginChargedRate: -1,
      brokerageChargedType: '',
      brokerageChargedRate: -1,
      squareoff: null,
      liveScriptData: JSON.parse(
        await redisClient.get(`live-${this.orderData.script}`)
      ),
    };

    if (this.orderData.isIntraday) {
      if (this.prefetchData.intradayScriptMarginSetting) {
        msg.marginChargedType =
          this.prefetchData.intradayScriptMarginSetting.marginType;
        msg.marginChargedRate =
          this.prefetchData.intradayScriptMarginSetting.marginType == 'lot'
            ? this.prefetchData.intradayScriptMarginSetting.marginPerLot
            : this.prefetchData.intradayScriptMarginSetting.marginPerCrore;
      } else {
        msg.marginChargedType =
          this.prefetchData.intradayMarginSetting.marginType;
        msg.marginChargedRate =
          this.prefetchData.intradayMarginSetting.marginType == 'lot'
            ? this.prefetchData.intradayMarginSetting.marginPerLot
            : this.prefetchData.intradayMarginSetting.marginPerCrore;
      }
    } else {
      if (this.prefetchData.scriptMarginSetting) {
        msg.marginChargedType =
          this.prefetchData.scriptMarginSetting.marginType;
        msg.marginChargedRate =
          this.prefetchData.scriptMarginSetting.marginType == 'lot'
            ? this.prefetchData.scriptMarginSetting.marginPerLot
            : this.prefetchData.scriptMarginSetting.marginPerCrore;
      } else {
        msg.marginChargedType = this.prefetchData.marginSetting.marginType;
        msg.marginChargedRate =
          this.prefetchData.marginSetting.marginType == 'lot'
            ? this.prefetchData.marginSetting.marginPerLot
            : this.prefetchData.marginSetting.marginPerCrore;
      }
    }

    if (this.prefetchData.scriptBrokerageSetting) {
      msg.brokerageChargedType =
        this.prefetchData.scriptBrokerageSetting.brokerageType;
      msg.brokerageChargedRate =
        this.prefetchData.scriptBrokerageSetting.brokerageType == 'lot'
          ? this.prefetchData.scriptBrokerageSetting.brokeragePerLotAmt
          : this.prefetchData.scriptBrokerageSetting.brokeragePerCroreAmt;
    } else {
      msg.brokerageChargedType =
        this.prefetchData.brokerageSetting.brokerageType;
      msg.brokerageChargedRate =
        this.prefetchData.brokerageSetting.brokerageType == 'lot'
          ? this.prefetchData.brokerageSetting.brokeragePerLotAmt
          : this.prefetchData.brokerageSetting.brokeragePerCroreAmt;
    }

    if (this.squareOff) {
      msg.squareoff = 'user squareoff';
    } else if (
      this.prefetchData.openOrders.filter(
        (a) => a.tradeType != this.orderData.type
      ).length > 0
    ) {
      msg.squareoff = 'trade squareoff';
    }

    if (this.squareOff) {
      // await AppDataSource.transaction(async (tmanager) => {
      //   await Orders.createOrder(msg, tmanager, redisClient);
      // });
    } else {
      await OrdersService.publishOrderMsg(msg);
    }

    return;
  }
}

export default CreateOrderService;
