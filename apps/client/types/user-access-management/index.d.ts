export type GetUserAccessFunction = {
  id: number;
  isAccess: boolean;
  func: {
    id: number;
    funName: string;
    funLevel: string;
    isFunActive: boolean;
    subMenu: {
      id: number;
      subMenuText: string;
      subMenuConstantText: string;
      isSubMenuActive: boolean;
      menu: {
        id: number;
        menuText: string;
        menuConstantText: string;
        isMenuActive: boolean;
      };
    };
  };
};
export type GetUserAccessData = {
  defaultFunctions: GetUserAccessFunction[];
  userFunctions: GetUserAccessFunction[];
};

export type ParsedUserAccessFunction = {
  funName: string;
  funcId: number;
  isFunActive: boolean;
  funLevel: string;
  isAccess: boolean;
};

export type ParsedUserAccessItem = {
  menuId: number;
  menuConstantText: string;
  menuText: string;
  isMenuActive: boolean;
  menuFuncId?: number;
  isMenuAccess?: boolean;
  functions: ParsedUserAccessFunction[];
};
