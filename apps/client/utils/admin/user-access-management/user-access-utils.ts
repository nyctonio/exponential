import {
  GetUserAccessData,
  GetUserAccessFunction,
  ParsedUserAccessItem,
} from '@/types/user-access-management';

class UserAccessUtils {
  private static defaultFunctionFormatter(data: GetUserAccessFunction[]) {
    let finalData: ParsedUserAccessItem[] = [];
    data.map((item) => {
      let subMenu = item.func.subMenu;

      let checkIndex = finalData.findIndex((a: any) => {
        return a.menuId == subMenu.menu.id;
      });

      if (checkIndex != -1) {
        finalData[checkIndex].functions.push({
          funcId: item.func.id,
          funName: item.func.funName,
          isFunActive: item.func.isFunActive,
          funLevel: item.func.funLevel,
          isAccess: item.isAccess,
        });
      } else {
        finalData.push({
          menuId: subMenu.menu.id,
          isMenuActive: subMenu.menu.isMenuActive,
          menuConstantText: subMenu.menu.menuConstantText,
          menuText: subMenu.menu.menuText,
          functions: [
            {
              funName: item.func.funName,
              funcId: item.func.id,
              isFunActive: item.func.isFunActive,
              isAccess: item.isAccess,
              funLevel: item.func.funLevel,
            },
          ],
        });
      }
    });
    return finalData;
  }

  private static defaultUserFunctionMapper(
    formattedDefaultFunctionData: ParsedUserAccessItem[],
    userFunctionData: GetUserAccessFunction[]
  ) {
    formattedDefaultFunctionData.map((item, index) => {
      item.functions.map((defaultFunction, i) => {
        let checkUserFunction = userFunctionData.find((a) => {
          return a.func.id == defaultFunction.funcId;
        });
        if (checkUserFunction) {
          item.functions[i] = {
            funcId: checkUserFunction.id,
            isAccess: checkUserFunction.isAccess,
            funLevel: checkUserFunction.func.funLevel,
            funName: checkUserFunction.func.funName,
            isFunActive: checkUserFunction.func.isFunActive,
          };
        }
        if (checkUserFunction && checkUserFunction.func.funLevel == 'Menu') {
          item.isMenuAccess = checkUserFunction.isAccess;
          item.menuFuncId = checkUserFunction.id;
        }
      });
      formattedDefaultFunctionData[index] = item;
    });

    return formattedDefaultFunctionData;
  }

  public static dataHandler(data: GetUserAccessData) {
    let formattedDefaultFunctionData = this.defaultFunctionFormatter(
      data.defaultFunctions
    );

    let finalDefaultFunctionData = this.defaultUserFunctionMapper(
      formattedDefaultFunctionData,
      data.userFunctions
    );

    return finalDefaultFunctionData;
  }
}
export default UserAccessUtils;
