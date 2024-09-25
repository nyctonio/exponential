import {
  m_defaultfunctionmapping,
  m_routefunctionmapping,
  m_userfunctionmapping,
} from 'database/sql/schema';

import { In } from 'typeorm';

class Menu {
  user_function_data: m_userfunctionmapping[] = null;
  userId: number = null;

  constructor(userId: number) {
    this.userId = userId;
  }

  async getUserFunctionMapping() {
    if (!this.user_function_data) {
      if (this.userId) {
        let userFunctionMappingData = await m_userfunctionmapping.find({
          where: {
            isAccess: true,
            user: { id: this.userId },
            func: { funLevel: 'Screen' },
          },
          relations: { func: { subMenu: { menu: true } } },
          select: {
            id: true,
            isAccess: true,
            func: {
              id: true,
              funName: true,
              funLevel: true,
              isFunActive: true,
              subMenu: {
                id: true,
                subMenuConstantText: true,
                subMenuText: true,
                isSubMenuActive: true,
                menu: {
                  isMenuActive: true,
                  menuConstantText: true,
                  menuText: true,
                  id: true,
                },
              },
            },
          },
        });
        this.user_function_data = userFunctionMappingData;
        return this.user_function_data;
      } else {
        throw new Error('Cannot get user data');
      }
    } else {
      return this.user_function_data;
    }
  }

  async getRouteFunctionMapping() {
    let data = await m_routefunctionmapping.find({
      relations: { func: true },
      select: { func: { id: true, funName: true } },
    });
    return data;
  }

  async getUserFunctionAccess() {
    let userFunctionAccess = await m_userfunctionmapping.find({
      where: { user: { id: this.userId } },
      relations: { func: true },
      select: { func: { id: true, funName: true } },
    });
    return userFunctionAccess;
  }

  async getDefaultFunctionMapping(userTypeId: number, access: boolean = false) {
    let defaultFunctions = await m_defaultfunctionmapping.find({
      where:
        access == true
          ? { userType: { id: Number(userTypeId) }, isAccess: true }
          : { userType: { id: Number(userTypeId) } },
      relations: { func: { subMenu: { menu: true } } },
      select: {
        id: true,
        isAccess: true,
        func: {
          id: true,
          funName: true,
          funLevel: true,
          isFunActive: true,
          subMenu: {
            id: true,
            subMenuConstantText: true,
            subMenuText: true,
            isSubMenuActive: true,
            menu: {
              isMenuActive: true,
              menuConstantText: true,
              menuText: true,
              id: true,
            },
          },
        },
      },
    });
    return defaultFunctions;
  }

  async updateDefaultFunctionMapping(funcIds: number[], value: boolean) {
    await m_defaultfunctionmapping.update(
      { func: { id: In(funcIds) } },
      { isAccess: value }
    );
    return;
  }
}

export default Menu;
