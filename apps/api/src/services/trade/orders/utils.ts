import { m_transaction } from 'database/sql/schema';

class OrderUtils {
  public static async checkAllTradeScenarios(
    allOrdersOfScript: m_transaction[],
    orderData: { quantity: number; type: string; orderType: string }
  ) {
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
          throw new Error('Cant buy more please cancel pending orders');
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
          throw new Error('Cant buy more please cancel pending orders');
        }
      }
      if (
        openOrdersQtyAndType.buy_open == 0 &&
        openOrdersQtyAndType.buy_pending == 0 &&
        openOrdersQtyAndType.sell_open > 0 &&
        openOrdersQtyAndType.sell_pending > 0
      ) {
        if (orderData.quantity > openOrdersQtyAndType.sell_open) {
          throw new Error('Cant buy more please cancel pending orders');
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
          throw new Error('Cant buy more please cancel pending orders');
        }
      }
      if (
        openOrdersQtyAndType.buy_open == 0 &&
        openOrdersQtyAndType.buy_pending == 0 &&
        openOrdersQtyAndType.sell_open == 0 &&
        openOrdersQtyAndType.sell_pending > 0
      ) {
        if (orderData.orderType == 'limit') {
          throw new Error('Cant buy more please cancel pending orders');
        }
        if (orderData.quantity < openOrdersQtyAndType.sell_pending) {
          throw new Error('Cant buy more please cancel pending orders');
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
}

export default OrderUtils;
