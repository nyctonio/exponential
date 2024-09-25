type UpdateClientDetailsType = {
  userId: number;
  firstName: string;
  lastName: string;
  cityId: number;
  email: string;
  mobileNumber: string;
  validTillDate: string;
  remarks: string;
};

type UserResponseDataType = {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    userType: {
      userTypeId: number;
      name: string;
    };
  };
};

type UpdateTradeAutoCutType = {
  userId: number;
  tradeAutoCut: boolean;
};

type UpdateExchangeInfoType = {
  userId: number;
  tradeAllowedinQty: boolean;
  exchangeSettings: {
    exchangeId: number;
    isExchangeActive: boolean;
    exchangeMaxLotSize: number;
    scriptMaxQty: number;
  }[];
};

type UpdateBrokerageType = {
  userId: number;
  brokerageSettings: {
    exchangeId: number;
    brokerageAmt: number;
  }[];
};

type UpdateNormalMarginType = {
  userId: number;
  tradeMarginSettings: {
    exchangeId: number;
    marginValue: number;
  }[];
};

type UpdateIntraDayMarginType = {
  userId: number;
  intratradeMarginSettings: {
    exchangeId: number;
    marginValue: number;
  }[];
};

export {
  UserResponseDataType,
  UpdateClientDetailsType,
  UpdateTradeAutoCutType,
  UpdateExchangeInfoType,
  UpdateBrokerageType,
  UpdateNormalMarginType,
  UpdateIntraDayMarginType,
};
