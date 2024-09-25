import Trade from 'entity/trade';
import { redisClient } from '../../lib/redis';
import { AppDataSource } from 'database/sql';
import { queue } from '../../lib/queue';
import { SquareOffWorkflow } from 'order';

class ExpiryScriptHandler {
  public static async squareOffExpireScripts(exchange: 'NSE' | 'MCX') {
    try {
      let trade = new Trade({ redisClient, userId: -1 });

      await AppDataSource.transaction(async (tmanager) => {
        trade.setTransactionManager(tmanager);
        let expiringOrders = await trade.getExpiringOrders(exchange);
        await Promise.all(
          expiringOrders.map(async (openOrder) => {
            let squareOffOrder = new SquareOffWorkflow(queue);
            await squareOffOrder.squareOffTrade(
              openOrder.scriptName,
              openOrder.user.id,
              openOrder.isIntraday,
              false,
              'system squareoff'
            );
            expiringOrders = expiringOrders.filter(
              (a) =>
                a.scriptName != openOrder.scriptName &&
                a.user.id != openOrder.user.id &&
                a.isIntraday != openOrder.isIntraday
            );
          })
        );
      });

      return true;
    } catch (e) {
      console.log('error in expiry square off ', e);
      return false;
    }
  }
}

export default ExpiryScriptHandler;
