import { Response } from 'express';
import { UserRequest } from '../../types/common/req';
import BroadcastMessageService from '../../services/broadcast-message';
import { ResponseType } from '../../constants/common/response-type';

class BroadcastMessageController {
  public static async save(req: UserRequest, res: Response) {
    try {
      let data = await BroadcastMessageService.save(req.body);
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
      let data = await BroadcastMessageService.listAdmin(req.query.search);
      return res.send(data);
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getList(req: UserRequest, res: Response) {
    try {
      let data = await BroadcastMessageService.getMessages(req.userData.id);
      return res.send(data);
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async read(req: UserRequest, res: Response) {
    try {
      let data = await BroadcastMessageService.read(
        req.userData.id,
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

  public static async sendScheduleMessage(req: UserRequest, res: Response) {
    try {
      let data = await BroadcastMessageService.sendScheduleMessage();
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
