export type SettingsType = {
  sortBy: 'symbol' | 'exchange' | 'expiry' | 'ltp' | '%change' | null;
  orderBy: 'asc' | 'desc' | null;
  columns: {
    id: number;
    name: string;
    width: string;
  }[];
};

export type WatchListType = {
  id: number;
  name: string;
  settings: SettingsType;
  instrument_tokens: string[];
}[];

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

export type UserType = {
  id: number;
  username: string;
  userType: {
    id: number;
    constant: 'Company' | 'Sub-Broker' | 'Client' | 'Broker';
    name: 'Company' | 'Sub-Broker' | 'Client' | 'Broker';
  };
  email: string;
  token: string;
  menus: MenuType;
  watchlist: WatchListType;
  activeWatchlist: number;
} | null;
