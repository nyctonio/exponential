import { Response } from 'express';
import { UserRequest } from '../../types/common/req';
import NotificationsService from '../../services/notifications';
import { ResponseType } from '../../constants/common/response-type';

class notificationsController {
  public static async saveNotifications(req: UserRequest, res: Response) {
    try {
      let data = await NotificationsService.saveNotification(req.body);
      return res.send(data);
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getNotificationsListAdmin(
    req: UserRequest,
    res: Response
  ) {
    try {
      let data = await NotificationsService.getNotificationsAdmin();
      return res.send(data);
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getNotificationsList(req: UserRequest, res: Response) {
    try {
      let data = await NotificationsService.getNotifications(req.userData.id);
      return res.send(data);
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async readNotification(req: UserRequest, res: Response) {
    try {
      let data = await NotificationsService.readNotifications(
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
}
export default notificationsController;
