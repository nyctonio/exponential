export type UserType = {
  id: number;
  userName: string;
  userType: {
    id: number;
    constant: 'Company' | 'Master' | 'Sub-Broker' | 'Client' | 'Broker';
    name: 'Company' | 'Sub-Broker' | 'Client' | 'Broker';
  };
  email: string;
  token: string;
} | null;

export type SettingsType = {
  sortBy: 'symbol' | 'exchange' | 'expiry' | 'ltp' | '%change' | null;
  orderBy: 'asc' | 'desc' | null;
  columns: {
    id: number;
    name: string;
    width: string;
  }[];
  fastTradeActive: boolean;
  fastTradeLotSize: number;
};

export type WatchListType = {
  id: number;
  name: string;
  settings: SettingsType;
  keys: string[];
};

export type MenuType = {
  isMenuActive: number;
  menuConstantText: string;
  menuId: number;
  menuText: string;
  menuUrl: string;
  subMenus: {
    isSubMenuActive: number;
    subMenuConstantText: string;
    subMenuId: number;
    subMenuText: string;
    subMenuUrl: string;
  }[];
}[];
