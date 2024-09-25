import IntradaySquareOffHandler from './intraday-squareoff-handler';
import PendingOrdersHandler from './pending-orders-handler';
import PenaltyHandler from './penalty-handler';
import SmSquareOff from './sm-squareoff';
import ExpiryScriptHandler from './expiry-script-handler';

class DailySettlementService {
  public static async runDailySettlement(exchange: 'NSE' | 'MCX') {
    // await PendingOrdersHandler.cancelPendingOrders(exchange);
    // await IntradaySquareOffHandler.squareOffHandler(exchange);
    // await PenaltyHandler.processPenalty(exchange);
    // await SmSquareOff.squareOff(exchange);
    await ExpiryScriptHandler.squareOffExpireScripts(exchange);
  }
}
export default DailySettlementService;
