export type TableBidStopLossSetting = {
  id: number;
  option: string;
  isUpdated: boolean;
  outsideHL: boolean;
  betweenHL: boolean;
  cmp: number;
  lastUpdated: Date;
};

export type McxBidStopLossSetting = {
  id: number;
  instrumentName: string;
  bidValue: number;
  isUpdated: boolean;
  stopLossValue: number;
  updatedAt: Date;
};

export type UserCuttingSetting = {
  id: number;
  value: string;
  createdAt: Date;
  updatedAt: Date;
  isUpdated: boolean;
  option: string;
  constant: string;
};

export type UserCuttingSettingUpdate = {
  id: number;
  value: string;
  name: string;
};
