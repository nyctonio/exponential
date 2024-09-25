import { Response } from 'express';
import { UserRequest } from '../../types/common/req';
import ContactUsService from '../../services/contact-us';
import { ResponseType } from '../../constants/common/response-type';

class ContactUsController {
  public static async list(req: UserRequest, res: Response) {
    try {
      let data = await ContactUsService.list(req.query.status);
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
      let data = await ContactUsService.changeStatus(
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
}
export default ContactUsController;
