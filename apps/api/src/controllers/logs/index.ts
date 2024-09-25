import { Response } from 'express';
import { UserRequest } from '../../types/common/req';
import LogsService from '../../services/logs';
import { ResponseType } from '../../constants/common/response-type';

class logsController {
  public static async getLogsList(req: UserRequest, res: Response) {
    try {
      let data = await LogsService.getLogs(
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
}
export default logsController;
