type InstrumentType = {
  name: string;
  exchange: string;
  uplineNormalMarginLot: number;
  uplineIntradayMarginLot: number;
  uplineNormalMarginCrore: number;
  uplineIntradayMarginCrore: number;
  marginType: 'lot' | 'crore';
  userNormalMarginLot: number;
  userIntradayMarginLot: number;
  userNormalMarginCrore: number;
  userIntradayMarginCrore: number;
  userNormalMarginUpdated: boolean;
  userIntradayMarginUpdated: boolean;
  marginTypeUpdated: boolean;
  uplineNormalMarginType: 'SCRIPT' | 'EXCH';
  uplineIntraDayMarginType: 'SCRIPT' | 'EXCH';
  userNormalMarginType: 'SCRIPT' | 'EXCH';
  userIntraDayMarginType: 'SCRIPT' | 'EXCH';
  updatedAt: string;
};

export { InstrumentType };
