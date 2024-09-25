import ProjectSetting from 'entity/project-settings';
import { ResponseType } from '../../constants/common/response-type';
import Menu from 'entity/menu';

type MenuItem = {
  id: number;
  menuText: string;
  menuConstantText: string;
  isMenuActive: boolean;
  subMenus: {
    id: number;
    menuId: number;
    subMenuConstantText: string;
    subMenuText: string;
    isSubMenuActive: boolean;
  }[];
};

class MenuService {
  public static async getUserMenus(userId: number, userType: string) {
    let menus = new Menu(userId);
    await menus.getUserFunctionMapping();
    let finalMenus: MenuItem[] = [];
    menus.user_function_data.map((item) => {
      let subMenu = item.func.subMenu;

      if (userType == 'Client') {
        switch (subMenu.subMenuConstantText) {
          case 'manage-delete-trades':
            subMenu.subMenuText = 'My Trades';
            break;
          case 'manage-positions':
            subMenu.subMenuText = 'My Positions';
            break;
          case 'manage-orders':
            subMenu.subMenuText = 'My Orders';
            break;
        }
      }

      let checkIndex = finalMenus.findIndex((a) => {
        return a.id == subMenu.menu.id;
      });
      if (checkIndex != -1) {
        let checkSubMenu = finalMenus[checkIndex].subMenus.find((a) => {
          return a.id == subMenu.id;
        });
        if (!checkSubMenu) {
          finalMenus[checkIndex].subMenus.push({
            id: subMenu.id,
            menuId: subMenu.menu.id,
            subMenuConstantText: subMenu.subMenuConstantText,
            subMenuText: subMenu.subMenuText,
            isSubMenuActive: subMenu.isSubMenuActive,
          });
        }
      } else {
        finalMenus.push({
          id: subMenu.menu.id,
          isMenuActive: subMenu.menu.isMenuActive,
          menuConstantText: subMenu.menu.menuConstantText,
          menuText: subMenu.menu.menuText,
          subMenus: [
            {
              id: subMenu.id,
              isSubMenuActive: subMenu.isSubMenuActive,
              menuId: subMenu.menu.id,
              subMenuConstantText: subMenu.subMenuConstantText,
              subMenuText: subMenu.subMenuText,
            },
          ],
        });
      }
    });

    return {
      status: true,
      data: finalMenus,
      type: ResponseType.SUCCESS,
      message: '',
    };
  }

  public static async getDefaultFunctionAccess(userType: string) {
    let menu = new Menu(-1);
    let projectSetting = new ProjectSetting(['USRTYP']);
    let projectSettingData =
      await projectSetting.getProjectSettingByKeyAndConstant(
        'USRTYP',
        userType
      );
    return await menu.getDefaultFunctionMapping(projectSettingData.id);
  }

  public static async updateDefaultFunctionAccess(
    editedFunctions: { funcId: number; value: boolean }[]
  ) {
    let menu = new Menu(-1);
    let disabledFunctions = editedFunctions
      .filter((a) => a.value == false)
      .map((a) => a.funcId);
    let enabledFunctions = editedFunctions
      .filter((a) => a.value == true)
      .map((a) => a.funcId);

    await Promise.all([
      menu.updateDefaultFunctionMapping(disabledFunctions, false),
      await menu.updateDefaultFunctionMapping(enabledFunctions, true),
    ]);
    return;
  }
}
export default MenuService;
