import { Response } from 'express';
import { UserRequest } from '../../types/common/req';
import MenuService from '../../services/menu';
import { ResponseType } from '../../constants/common/response-type';

class MenusController {
  public static async getMenusData(req: UserRequest, res: Response) {
    try {
      let data = await MenuService.getUserMenus(
        req.userData.id,
        req.userData.userType
      );
      return res.send(data);
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getDefaultAccessData(req: UserRequest, res: Response) {
    try {
      let data = await MenuService.getDefaultFunctionAccess(
        req.params.userType
      );
      return res.send({ status: true, type: ResponseType.SUCCESS, data: data });
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async updateDefaultAccess(req: UserRequest, res: Response) {
    try {
      let data = await MenuService.updateDefaultFunctionAccess(
        req.body.editedFunctions
      );
      return res.send({ status: true, type: ResponseType.SUCCESS, data: data });
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }
}
export default MenusController;
