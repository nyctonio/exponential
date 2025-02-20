export type UserCreate = {
  id: number;
  userName: string;
  userType: number;
  email: string;
  firstName: string;
  lastName: string;
  mobile: string;
  password: string;
  retypePassword: string;
  city: number;
  remarks: string;
  tradeSquareOffLimit: number;
  onlySquareOff: boolean;
  validTill: string;
  demoId: boolean;
  creditBalance: number;
  creditRemarks: string;
  tradeAllowedInQuantityNSE: boolean;
  exchangeAllowedNSE: boolean;
  exchangeAllowedMCX: boolean;
  exchangeAllowedFX: boolean;
  exchangeAllowedOptions: boolean;
  maxExchangeNSE: number;
  maxExchangeMCX: number;
  maxExchangeFX: number;
  maxExchangeOptions: number;
  tradeAutoCut: boolean;
  brokerageNSE: number;
  brokerageMCX: number;
  brokerageFX: number;
  brokerageOptions: number;
  normalMarginNSE: number;
  normalMarginMCX: number;
  normalMarginFX: number;
  normalMarginOptions: number;
  intradayTrade: boolean;
  intradayMarginNSE: number;
  intradayMarginMCX: number;
  intradayMarginFX: number;
  intradayMarginOptions: number;
  maxQtyScriptNSE: number;
  maxQtyScriptMCX: number;
  maxQtyScriptFX: number;
  maxQtyScriptOptions: number;
};

export type toggleInput =
  | 'intradayTrade'
  | 'tradeAutoCut'
  | 'tradeAllowedInQuantityNSE'
  | 'exchangeAllowedNSE'
  | 'exchangeAllowedMCX'
  | 'exchangeAllowedFX'
  | 'exchangeAllowedOptions'
  | 'demoId'
  | 'onlySquareOff';

export type userInput =
  | 'userName'
  | 'userType'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'mobile'
  | 'password'
  | 'retypePassword'
  | 'city'
  | 'remarks'
  | 'tradeSquareOffLimit'
  | 'validTill'
  | 'creditBalance'
  | 'creditRemarks'
  | 'maxExchangeNSE'
  | 'maxExchangeMCX'
  | 'maxExchangeFX'
  | 'maxExchangeOptions'
  | 'brokerageNSE'
  | 'brokerageMCX'
  | 'brokerageFX'
  | 'brokerageOptions'
  | 'normalMarginNSE'
  | 'normalMarginMCX'
  | 'normalMarginFX'
  | 'normalMarginOptions'
  | 'intradayMarginNSE'
  | 'intradayMarginMCX'
  | 'intradayMarginFX'
  | 'intradayMarginOptions'
  | 'maxQtyScriptNSE'
  | 'maxQtyScriptMCX'
  | 'maxQtyScriptFX'
  | 'maxQtyScriptOptions';
