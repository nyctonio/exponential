export type CreateUserExchangeSettings = {
  NSE?: {
    exchangeMaxLotSize: number;
    scriptMaxLotSize: number;
    tradeMaxLotSize: number;
  };
  MCX?: {
    exchangeMaxLotSize: number;
    scriptMaxLotSize: number;
    tradeMaxLotSize: number;
  };
  FX?: {
    exchangeMaxLotSize: number;
    scriptMaxLotSize: number;
    tradeMaxLotSize: number;
  };
  Options?: {
    exchangeMaxLotSize: number;
    scriptMaxLotSize: number;
    tradeMaxLotSize: number;
  };
};

export type CreateUserBrokerageSettings = {
  NSE?: {
    brokerageType: 'lot' | 'crore' | null;
    brokeragePerLotAmt: number;
    brokeragePerCroreAmt: number;
  };
  MCX?: {
    brokerageType: 'lot' | 'crore' | null;
    brokeragePerLotAmt: number;
    brokeragePerCroreAmt: number;
  };
  FX?: {
    brokerageType: 'lot' | 'crore' | null;
    brokeragePerLotAmt: number;
    brokeragePerCroreAmt: number;
  };
  Options?: {
    brokerageType: 'lot' | 'crore' | null;
    brokeragePerLotAmt: number;
    brokeragePerCroreAmt: number;
  };
};

export type CreateUserTradeMarginSettings = {
  NSE?: {
    marginType: 'lot' | 'crore' | null;
    marginPerLot: number;
    marginPerCrore: number;
  };
  MCX?: {
    marginType: 'lot' | 'crore' | null;
    marginPerLot: number;
    marginPerCrore: number;
  };
  FX?: {
    marginType: 'lot' | 'crore' | null;
    marginPerLot: number;
    marginPerCrore: number;
  };
  Options?: {
    marginType: 'lot' | 'crore' | null;
    marginPerLot: number;
    marginPerCrore: number;
  };
};

export type CreateUserIntradayTradeMarginSettings = {
  NSE?: {
    marginType: 'lot' | 'crore' | null;
    marginPerLot: number;
    marginPerCrore: number;
  };
  MCX?: {
    marginType: 'lot' | 'crore' | null;
    marginPerLot: number;
    marginPerCrore: number;
  };
  FX?: {
    marginType: 'lot' | 'crore' | null;
    marginPerLot: number;
    marginPerCrore: number;
  };
  Options?: {
    marginType: 'lot' | 'crore' | null;
    marginPerLot: number;
    marginPerCrore: number;
  };
};

export type CreateUserPLShare = {
  NSE?: number;
  MCX?: number;
  FX?: number;
  Options?: number;
};

export type CreateUserBody = {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  remarks: string;
  mobileNumber: string;
  cityId: number;
  isCopyUser: boolean;
  copyUserId?: number;
  userTypeId: number;
  transactionLedger: {
    amount: number;
    remarks: string;
  };
  validTillDate: Date;
  isDemoId: boolean;
  onlySquareOff: boolean;
  tradeSquareOffLimit: number;
  isIntradayAllowed: boolean;
  m2mSquareOff: boolean;
  shortMarginSquareOff: boolean;
  m2mSquareOffLimit: number;
  maxLossCap: number;
  tradeAllowedInQty: boolean;
  marginType: string;
  brokerageType: string;
  exchangeSettings: CreateUserExchangeSettings;
  brokerageSettings: CreateUserBrokerageSettings;
  tradeMarginSettings: CreateUserTradeMarginSettings;
  intradayTradeMarginSettings: CreateUserIntradayTradeMarginSettings;
  plShare: CreateUserPLShare;
  createdOnBehalf: number | null;
  brokerCount: number | null;
  subBrokerCount: number | null;
  clientCount: number | null;
};
