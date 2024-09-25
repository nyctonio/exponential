export type UserLoginResponseType = {
  userName: string;
  userId: number;
  token: string;
  resettoken: string?;
  email: string;
  watchListData: {
    id: number;
    index: number;
    name: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
    watchlistItems: {
      id: number;
      index: number;
      instrumentToken: string;
      watchListId: number;
      createdAt: string;
      updatedAt: string;
    }[];
  }[];
};

export type WatchListResponseType = {
  id: number;
  index: number;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  scripts: string[];
  columns: {
    id: number;
    width: string;
  }[];
}[];

export type ColumnDataResponseType = {
  id: number;
  name: string;
}[];

export type MenuResponseType = {
  subMenuId: number;
  subMenuText: string;
  subMenuConstantText: string;
  isSubMenuActive: number;
  subMenuUrl: string;
  menuId: number;
  menuText: string;
  menuConstantText: string;
  isMenuActive: number;
  menuUrl: string;
}[];
