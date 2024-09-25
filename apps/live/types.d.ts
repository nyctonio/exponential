type SingleScript = {
  tradable: boolean;
  mode: string;
  instrumentToken: number;
  lastPrice: number;
  lastTradedQuantity: number;
  averageTradedPrice: number;
  volumeTraded: number;
  totalBuyQuantity: number;
  totalSellQuantity: number;
  ohlc: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  change: number;
  lastTradeTime: Date;
  exchangeTimestamp: Date;
  oi: number;
  oiDayHigh: number;
  oiDayLow: number;
  depth: {
    buy: [
      {
        quantity: number;
        price: number;
        orders: number;
      },
    ];
    sell: [
      {
        quantity: number;
        price: number;
        orders: number;
      },
    ];
  };
};

type RoomDataType = {
  instrumentToken: number;
  buyQty: number;
  buyPrice: string;
  sellPrice: string;
  sellQty: number;
  ltp: string;
  change: string;
  open: string;
  high: string;
  low: string;
  close: string;
};

export { SingleScript, RoomDataType };
