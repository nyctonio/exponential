// import { SingleScript, RoomDataType } from '../../types';

// class QueueUtils {
//   public static dataFormatter(queueData: Array<Object>) {
//     let finalData: Array<SingleScript> = [];
//     queueData.map((data: any) => {
//       let tempObj: SingleScript = {
//         instrumentToken: data.instrument_token,
//         change: data.change,
//         ltp: data.last_price.toFixed(2),
//         buyQty: data.depth && data.depth.buy[0].quantity,
//         buyPrice: data.depth && data.depth.buy[0].price.toFixed(2),
//         sellPrice: data.depth && data.depth.sell[0].price.toFixed(2),
//         sellQty: data.depth && data.depth.sell[0].quantity,
//         // averageTradedPrice: data.average_traded_price,
//         // depth: data.depth,
//         exchangeTimestamp: data.exchange_timestamp,
//         volumeTraded: data.volume_traded,
//         tbq: data.total_buy_quantity,
//         tsq: data.total_sell_quantity,
//         // lastPrice: data.last_price,
//         // lastTradedQuantity: data.last_traded_quantity,
//         // lastTradeTime: data.last_trade_time,
//         // mode: data.mode,
//         oi: data.oi,
//         open: data.ohlc.open.toFixed(2),
//         high: data.ohlc.high.toFixed(2),
//         low: data.ohlc.low.toFixed(2),
//         close: data.ohlc.close.toFixed(2),
//         // oiDayHigh: data.oi_day_high,
//         // oiDayLow: data.oi_day_low,
//         // totalBuyQuantity: data.total_buy_quantity,
//         // totalSellQuantity: data.total_sell_quantity,
//         tradable: data.tradable,
//       };
//       finalData.push(tempObj);
//     });
//     return finalData;
//   }

//   public static roomDataFilter(data: SingleScript[]) {
//     let finalData: RoomDataType[] = [];
//     data.map((script: SingleScript) => {
//       if (!script.depth) {
//         // console.log('script is ', script);
//       }
//       const requiredObj = {
//         instrumentToken: script.instrumentToken,
//         change: script.change && script.change.toFixed(2),
//         ltp: script.lastPrice.toFixed(2),
//         buyQty: script.depth && script.depth.buy[0].quantity,
//         buyPrice: script.depth && script.depth.buy[0].price.toFixed(2),
//         sellPrice: script.depth && script.depth.sell[0].price.toFixed(2),
//         sellQty: script.depth && script.depth.sell[0].quantity,
//         volumeTraded: script.volumeTraded,
//         tbq: script.totalBuyQuantity,
//         tsq: script.totalSellQuantity,
//         oi: script.oi,
//         open: script.ohlc.open.toFixed(2),
//         high: script.ohlc.high.toFixed(2),
//         low: script.ohlc.low.toFixed(2),
//         close: script.ohlc.close.toFixed(2),
//       };
//       // if (script.tradable) {
//       finalData.push(requiredObj);
//       // }
//     });
//     return finalData;
//   }
// }

// export default QueueUtils;
