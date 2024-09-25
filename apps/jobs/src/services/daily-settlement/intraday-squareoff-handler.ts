import Trade from 'entity/trade';
import { redisClient } from '../../lib/redis';
import { AppDataSource } from 'database/sql';
import { queue } from '../../lib/queue';
import { SquareOffWorkflow } from 'order';

class IntradaySquareOffHandler {
  public static async squareOffHandler(exchange: 'NSE' | 'MCX') {
    try {
      let trade = new Trade({ redisClient, userId: -1 });

      await AppDataSource.transaction(async (tmanager) => {
        trade.setTransactionManager(tmanager);
        let openIntradayOrders = await trade.getAllIntradayOpenOrders(exchange);
        await Promise.all(
          openIntradayOrders.map(async (openOrder) => {
            let squareOffOrder = new SquareOffWorkflow(queue);
            await squareOffOrder.squareOffTrade(
              openOrder.scriptName,
              openOrder.user.id,
              openOrder.isIntraday,
              false,
              'system squareoff'
            );
            openIntradayOrders = openIntradayOrders.filter(
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
      console.log('error in intraday square off ', e);
      return false;
    }
  }
}

export default IntradaySquareOffHandler;
