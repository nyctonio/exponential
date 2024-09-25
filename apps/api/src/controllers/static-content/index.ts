import { Response } from 'express';
import { UserRequest } from '../../types/common/req';
import StaticContentService from '../../services/static-content';
import { ResponseType } from '../../constants/common/response-type';

class BroadcastMessageController {
  public static async save(req: UserRequest, res: Response) {
    try {
      let data = await StaticContentService.save(req.body);
      return res.send(data);
    } catch (e) {
      // console.log('====================>',e)
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getListAdmin(req: UserRequest, res: Response) {
    try {
      let data = await StaticContentService.listAdmin(req.query.contentType);
      return res.send(data);
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getListUser(req: UserRequest, res: Response) {
    try {
      let data = await StaticContentService.listUser(req.query.contentType);
      return res.send(data);
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async changeStatus(req: UserRequest, res: Response) {
    try {
      let data = await StaticContentService.changeStatus(
        req.body.status,
        req.body.id
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

  public static async edit(req: UserRequest, res: Response) {
    try {
      let data = await StaticContentService.edit(req.body);
      return res.send(data);
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async editUserManual(req: UserRequest, res: Response) {
    try {
      let data = await StaticContentService.editUserManual(req.body.data);
      return res.send(data);
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }
}
export default BroadcastMessageController;
