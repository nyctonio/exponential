export type ScriptQuantityInstrumentList = {
  id: number;
  tradeMaxLotSize: number;
  active: boolean;
  scriptMaxLotSize: number;
  updatedAt: Date;
};

export type ScriptQuantityInstrument = {
  name: string;
  exchange: string;
  uplineTradeMaxLotSize: number;
  uplineScriptMaxLotSize: number;
  userTradeMaxLotSize: number;
  userScriptMaxLotSize: number;
  userTradeMinLotSize: number;
  active: boolean;
  updatedAt: String;
  upline: 'EXCH' | 'SCRIPT';
  user: 'EXCH' | 'SCRIPT';
  valuesUpdated: boolean;
};

export type ScriptQuantityUplineData = {
  id: number;
  tradeMaxLotSize: number;
  scriptMaxLotSize: number;
  updatedAt: Date;
  exchange: {
    id: number;
    exchangeName: string;
  };
}[];

export type ScriptQuantityUserData = {
  id: number;
  tradeMaxLotSize: number;
  scriptMaxLotSize: number;
  updatedAt: Date;
  exchange: {
    id: number;
    exchangeName: string;
  };
}[];

export type ScriptQuantityFormData = {
  exchange: string;
  script: string;
  username: string;
};

export type EditedInstrument = {
  scriptMaxLotSize: number;
  tradeMaxLotSize: number;
  active: boolean;
  name: string;
  exchange: string;
  isUpdated: boolean;
};
