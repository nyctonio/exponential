import { m_transaction } from 'database/sql/schema';
import ExchangeSetting from 'entity/exchange-settings';
import AutoCutSettings from 'entity/auto-cut-settings';
import User from 'entity/user';
import Trade from 'entity/trade';
import { redisClient } from '../lib/redis';
import Ledger from 'entity/ledger';
import { m_instruments } from 'database/sql/schema';

class Validations {
  /**
   *
   * @param userId userId of the user
   * @param exchange exchange name
   * @param scriptName script name not the symbol eg :- GOLD
   * @param tradingSymbol trading symbol of the script eg :- GOLDM21JUNFUT
   */
  public static async tradeValidations(
    userId: number,
    exchange: string,
    scriptName: string,
    tradingSymbol: string
  ) {
    const user = new User({ userId: userId });
    const user_exchange = new ExchangeSetting({ userId });
    const user_ledger = new Ledger({ userId, redisClient });

    const NSE = await JSON.parse(await redisClient.get('NSE:TRADE'));
    const MCX = await JSON.parse(await redisClient.get('MCX:TRADE'));
    if (exchange == 'NSE' && NSE == 0) {
      throw new Error('NSE is closed');
    } else if (exchange == 'MCX' && MCX == 0) {
      throw new Error('MCX is closed');
    }

    let instrumentData = await m_instruments.findOne({
      where: {
        exchange: exchange == 'NSE' ? 'NFO' : exchange,
        tradingsymbol: tradingSymbol,
        isDeleted: false,
      },
      select: { instrument_token: true },
    });
    if (!instrumentData) {
      throw new Error('Instrument not active');
    }

    const [
      user_exchange_settings,
      user_script_exchange_settings,
      user_settings,
      user_balance,
    ] = await Promise.all([
      user_exchange.getExchangeSetting(),
      user_exchange.getScriptExchangeSetting(false),
      user.getUserData({
        userType: true,
      }),
      user_ledger.getCreditBalance(),
    ]);
    if (user_settings.userType.prjSettConstant != 'Client') {
      throw new Error('Only Client can trade');
    }
    user_exchange_settings.map((e) => {
      if (e.exchange.exchangeName == exchange && !e.exchange.isActive) {
        throw new Error('Exchange is not active for the user');
      }
    });
    user_script_exchange_settings.map((e) => {
      if (e.instrumentName == scriptName && !e.active) {
        throw new Error('Script is not active for the user');
      }
    });
    if (user_balance <= 0) {
      throw new Error('Margin not available');
    }
  }

  /**
   *
   * @param userId userId of the user
   * @param allOrdersOfUser all orders pending or open of the user or null to fetch data in the function
   * @param orderData order data of the new order that needs to be validated
   * @returns
   */
  public static async qtyValidations(
    userId: number,
    allOrdersOfUser: m_transaction[] | null, // allOrdersOfScript means all orders pending or open
    orderData: {
      scriptName: string;
      exchange: string;
      quantity: number;
      type: string;
      orderType: string;
      lotSize: number;
    }
  ) {
    const settings = new ExchangeSetting({
      userId: userId,
    });
    const trade = new Trade({
      userId: userId,
      redisClient,
    });

    const [exch, script, orders] = await Promise.all([
      settings.getCustomExchangeSetting({
        exchangeName: orderData.exchange,
        exchangeMaxLotSize: true,
        isExchangeActive: true,
        scriptMaxLotSize: true,
        tradeMaxLotSize: true,
      }),
      settings.getCustomScriptExchangeSetting({
        scriptName: orderData.scriptName,
      }),
      trade.getAllOpenOrders({
        exchange: orderData.exchange,
      }),
    ]);

    if (allOrdersOfUser == null) {
      allOrdersOfUser = orders;
    }

    const exch_max_lot_size = exch[0].exchangeMaxLotSize;
    const script_max_lot_size =
      script[0]?.scriptMaxLotSize || exch[0].scriptMaxLotSize;
    const trade_max_lot_size =
      script[0]?.tradeMaxLotSize || exch[0].tradeMaxLotSize;
    const trade_min_lot_size = script.length > 0 && script[0].tradeMinLotSize;
    // lots calculation
    let lots = Math.ceil(
      Number(orderData.quantity) / Number(orderData.lotSize)
    );
    // min per shot validation
    if (trade_min_lot_size)
      if (lots < trade_min_lot_size) throw new Error('Min LotSize not reached');
    // per shot validation
    if (lots > trade_max_lot_size) throw new Error('Trade LotSize exceeded');

    if (allOrdersOfUser.length > 0) {
      const openOrdersLots = allOrdersOfUser.reduce((acc, _order) => {
        const scriptLotSize = Math.ceil(_order.quantityLeft / _order.lotSize);
        // script qty checks
        if (_order.scriptName == orderData.scriptName) {
          // if purchase type is different
          if (_order.tradeType != orderData.type) {
            return acc + Math.abs(scriptLotSize - lots);
          }
          if (scriptLotSize + lots > script_max_lot_size)
            throw new Error('Script LotSize exceeded');
        }
        return acc + scriptLotSize;
      }, 0);

      // exchange qty checks
      if (openOrdersLots + lots > exch_max_lot_size)
        throw new Error('Exch LotSize exceeded');
    }
    return true;
  }

  /**
   *
   * @param userId userId of the user
   * @param allOrdersOfScript all orders pending or open
   * @param orderData data of the new order that needs to be validated
   */
  public static async scenarioValidations(
    userId: number,
    allOrdersOfScript: m_transaction[] | null, // allOrdersOfScript means all orders pending or open
    orderData: {
      quantity: number;
      type: string;
      orderType: string;
      exchange: string;
      scriptName: string;
    }
  ) {
    const trade = new Trade({
      userId,
      redisClient,
    });
    const orders = await trade.getAllOpenOrders({
      exchange: orderData.exchange,
    });
    if (allOrdersOfScript == null) {
      allOrdersOfScript = orders.filter((o) => {
        return o.scriptName == orderData.scriptName;
      });
    }
    const openOrdersQtyAndType = allOrdersOfScript.reduce(
      (acc, _order) => {
        if (_order.tradeType == 'B' && _order.transactionStatus == 'open') {
          acc.buy_open += Number(_order.quantityLeft);
        } else if (
          _order.tradeType == 'B' &&
          _order.transactionStatus == 'pending'
        ) {
          acc.buy_pending += Number(_order.quantityLeft);
        } else if (
          _order.tradeType == 'S' &&
          _order.transactionStatus == 'open'
        ) {
          acc.sell_open += Number(_order.quantityLeft);
        } else if (
          _order.tradeType == 'S' &&
          _order.transactionStatus == 'pending'
        ) {
          acc.sell_pending += Number(_order.quantityLeft);
        }
        return acc;
      },
      { buy_open: 0, buy_pending: 0, sell_open: 0, sell_pending: 0 }
    );
    // checks for all possible cases of open and pending orders
    console.log('scenario -->', openOrdersQtyAndType);
    if (orderData.type == 'B') {
      // for buy
      if (
        openOrdersQtyAndType.buy_open == 0 &&
        openOrdersQtyAndType.buy_pending > 0 &&
        openOrdersQtyAndType.sell_open > 0 &&
        openOrdersQtyAndType.sell_pending > 0
      ) {
        if (
          orderData.quantity + openOrdersQtyAndType.buy_pending >
          openOrdersQtyAndType.sell_open
        ) {
          throw new Error(
            'Cant buy more please check your pending/open orders'
          );
        }
      }
      if (
        openOrdersQtyAndType.buy_open == 0 &&
        openOrdersQtyAndType.buy_pending > 0 &&
        openOrdersQtyAndType.sell_open > 0 &&
        openOrdersQtyAndType.sell_pending == 0
      ) {
        if (
          orderData.quantity + openOrdersQtyAndType.buy_pending >
          openOrdersQtyAndType.sell_open
        ) {
          throw new Error(
            'Cant buy more please check your pending/open orders'
          );
        }
      }
      if (
        openOrdersQtyAndType.buy_open == 0 &&
        openOrdersQtyAndType.buy_pending == 0 &&
        openOrdersQtyAndType.sell_open > 0 &&
        openOrdersQtyAndType.sell_pending > 0
      ) {
        if (orderData.quantity > openOrdersQtyAndType.sell_open) {
          throw new Error(
            'Cant buy more please check your pending/open orders'
          );
        }
      }
      if (
        openOrdersQtyAndType.buy_open == 0 &&
        openOrdersQtyAndType.buy_pending == 0 &&
        openOrdersQtyAndType.sell_open > 0 &&
        openOrdersQtyAndType.sell_pending == 0
      ) {
        if (
          orderData.orderType == 'limit' &&
          orderData.quantity > openOrdersQtyAndType.sell_open
        ) {
          throw new Error(
            'Cant buy more please check your pending/open orders'
          );
        }
      }
      if (
        openOrdersQtyAndType.buy_open == 0 &&
        openOrdersQtyAndType.buy_pending == 0 &&
        openOrdersQtyAndType.sell_open == 0 &&
        openOrdersQtyAndType.sell_pending > 0
      ) {
        if (orderData.orderType == 'limit') {
          throw new Error(
            'Cant buy more please check your pending/open orders'
          );
        }
        if (orderData.quantity < openOrdersQtyAndType.sell_pending) {
          throw new Error(
            'Cant buy more please check your pending/open orders'
          );
        }
      }
    } else {
      // for sell
      if (
        openOrdersQtyAndType.buy_open > 0 &&
        openOrdersQtyAndType.buy_pending > 0 &&
        openOrdersQtyAndType.sell_open == 0 &&
        openOrdersQtyAndType.sell_pending > 0
      ) {
        if (
          orderData.quantity + openOrdersQtyAndType.sell_pending >
          openOrdersQtyAndType.buy_open
        ) {
          throw new Error('Cant sell more please cancel pending orders');
        }
      }
      if (
        openOrdersQtyAndType.buy_open > 0 &&
        openOrdersQtyAndType.buy_pending > 0 &&
        openOrdersQtyAndType.sell_open == 0 &&
        openOrdersQtyAndType.sell_pending == 0
      ) {
        if (orderData.quantity > openOrdersQtyAndType.buy_open) {
          throw new Error('Cant sell more please cancel pending orders');
        }
      }
      if (
        openOrdersQtyAndType.buy_open > 0 &&
        openOrdersQtyAndType.buy_pending == 0 &&
        openOrdersQtyAndType.sell_open == 0 &&
        openOrdersQtyAndType.sell_pending > 0
      ) {
        if (
          orderData.quantity + openOrdersQtyAndType.sell_pending >
          openOrdersQtyAndType.buy_open
        ) {
          throw new Error('Cant sell more please cancel pending orders');
        }
      }
      if (
        openOrdersQtyAndType.buy_open > 0 &&
        openOrdersQtyAndType.buy_pending == 0 &&
        openOrdersQtyAndType.sell_open == 0 &&
        openOrdersQtyAndType.sell_pending == 0
      ) {
        if (
          orderData.orderType == 'limit' &&
          orderData.quantity > openOrdersQtyAndType.buy_open
        ) {
          throw new Error('Cant sell more please cancel pending orders');
        }
      }
      if (
        openOrdersQtyAndType.buy_open == 0 &&
        openOrdersQtyAndType.buy_pending > 0 &&
        openOrdersQtyAndType.sell_open == 0 &&
        openOrdersQtyAndType.sell_pending == 0
      ) {
        if (orderData.orderType == 'limit') {
          throw new Error('Cancel pending buy orders');
        }
        if (orderData.quantity < openOrdersQtyAndType.buy_pending) {
          throw new Error('Cant sell more please cancel pending orders');
        }
      }
    }
  }

  /**
   *
   * @param userId userId of the user
   * @param orderData order data of the new order that needs to be validated
   * @param openOrders all open orders of the user or null to fetch data in the function
   * @param liveScriptData live data of the script or null to fetch data in the function
   */
  public static async bidSlValidations(
    userId: number,
    orderData: {
      type: string;
      orderType: string;
      price: number;
      quantity: number;
      lotSize: number;
      exchangeName: string;
      scriptName: string;
    },
    openOrders: m_transaction[] | null,
    liveScriptData: {
      high: string;
      low: string;
      buyPrice: string;
      sellPrice: string;
    }
  ): Promise<'bid' | 'sl'> {
    if (orderData.orderType == 'market') return;
    const autoBidStop = new AutoCutSettings(userId);
    const trade = new Trade({
      userId,
      redisClient,
    });
    const [settings, orders] = await Promise.all([
      autoBidStop.getAutoCutSettings(),
      trade.getAllOpenOrders({
        exchange: orderData.exchangeName,
      }),
    ]);
    if (openOrders == null) {
      openOrders = orders;
    }
    const open_order = openOrders.filter(
      (order) =>
        order.transactionStatus == 'open' &&
        order.scriptName == orderData.scriptName
    )[0];
    let bidsl: 'bid' | 'sl' = 'bid';
    // either there is no open and pending order or ig there is an open order then new order should be of same type and there should not be any pending order of same type
    if (!open_order || (open_order && open_order.tradeType == orderData.type)) {
      // fresh bid order
      const bid_Settings = settings.bidStopSettings.filter(
        (setting) => setting.option == 'Bid Activate'
      );
      if (bid_Settings.length > 0) {
        const bid_setting = bid_Settings[0];
        // @ts-ignore
        if (
          orderData.price > parseFloat(liveScriptData.high) ||
          orderData.price < parseFloat(liveScriptData.low)
        ) {
          if (!bid_setting.outside) {
            throw new Error('Outside High Low not allowed');
          }
        } else {
          if (!bid_setting.between) {
            throw new Error('Between High Low not allowed');
          }
        }
        if (orderData.exchangeName == 'MCX') {
          const mcx_bid_setting = settings.mcxBidStopSettings.filter(
            (setting) =>
              setting.instrumentName ==
              orderData.scriptName.match(/^[A-Za-z]+/)![0]
          )[0];
          if (!mcx_bid_setting) {
            throw new Error('MCX Bid Stop Settings not found');
          }
          const allowed_price = mcx_bid_setting.bidValue;
          if (orderData.type == 'B') {
            // buy bid  (if order is of type B then it will be executed on sell price)
            const cmp = parseFloat(liveScriptData.sellPrice);
            // @ts-ignore
            if (
              orderData.price > cmp + allowed_price ||
              orderData.price < cmp - allowed_price
            ) {
              throw new Error('Bid price is less or more than Allowed');
            }
          } else {
            // sell bid
            const cmp = parseFloat(liveScriptData.buyPrice);
            // @ts-ignore
            if (
              orderData.price > cmp + allowed_price ||
              orderData.price < cmp - allowed_price
            ) {
              throw new Error('Bid price is less or more than Allowed');
            }
          }
        } else {
          const percentage = bid_setting.cmp;
          if (orderData.type == 'B') {
            // buy bid
            const cmp = parseFloat(liveScriptData.sellPrice);
            // @ts-ignore
            if (
              orderData.price > cmp + (percentage * cmp) / 100 ||
              orderData.price < cmp - (percentage * cmp) / 100
            ) {
              throw new Error('Bid price is less or more than Allowed');
            }
          } else {
            // sell bid
            const cmp = parseFloat(liveScriptData.buyPrice);
            // @ts-ignore
            if (
              orderData.price > cmp + (percentage * cmp) / 100 ||
              orderData.price < cmp - (percentage * cmp) / 100
            ) {
              throw new Error('Bid price is less or more than Allowed');
            }
          }
        }
      } else {
        throw new Error('Bid Stop Settings not found');
      }
    } else {
      bidsl = 'sl';
      // stop loss order
      if (open_order) {
        if (orderData.quantity > open_order.quantityLeft) {
          throw new Error('Quantity is more than open order quantity');
        }
        const bid_Settings = settings.bidStopSettings.filter(
          (setting) => setting.option == 'Stop Loss Activate'
        );
        if (bid_Settings.length > 0) {
          const bid_setting = bid_Settings[0];
          // @ts-ignore
          if (
            orderData.price > parseFloat(liveScriptData.high) ||
            orderData.price < parseFloat(liveScriptData.low)
          ) {
            if (!bid_setting.outside) {
              throw new Error('Outside High Low not allowed');
            }
          } else {
            if (!bid_setting.between) {
              throw new Error('Between High Low not allowed');
            }
          }
          if (orderData.exchangeName == 'MCX') {
            const mcx_bid_setting = settings.mcxBidStopSettings.filter(
              (setting) =>
                setting.instrumentName ==
                orderData.scriptName.match(/^[A-Za-z]+/)![0]
            )[0];
            if (!mcx_bid_setting) {
              throw new Error('MCX Bid Stop Settings not found');
            }
            const allowed_price = mcx_bid_setting.stopLossValue;
            if (orderData.type == 'B') {
              // buy bid
              const cmp = parseFloat(liveScriptData.sellPrice);
              // @ts-ignore
              if (
                orderData.price > cmp + allowed_price ||
                orderData.price < cmp - allowed_price
              ) {
                throw new Error('Bid price is less or more than Allowed');
              }
            } else {
              // sell bid
              const cmp = parseFloat(liveScriptData.buyPrice);
              // @ts-ignore
              if (
                orderData.price > cmp + allowed_price ||
                orderData.price < cmp - allowed_price
              ) {
                throw new Error('Bid price is less or more than Allowed');
              }
            }
          } else {
            const percentage = bid_setting.cmp;
            if (orderData.type == 'B') {
              // buy bid
              const cmp = parseFloat(liveScriptData.sellPrice);
              // @ts-ignore
              if (
                orderData.price > cmp + (percentage * cmp) / 100 ||
                orderData.price < cmp - (percentage * cmp) / 100
              ) {
                throw new Error('Bid price is less or more than Allowed');
              }
            } else {
              // sell bid
              const cmp = parseFloat(liveScriptData.buyPrice);
              // @ts-ignore
              if (
                orderData.price > cmp + (percentage * cmp) / 100 ||
                orderData.price < cmp - (percentage * cmp) / 100
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
    return bidsl;
  }
}

export default Validations;
