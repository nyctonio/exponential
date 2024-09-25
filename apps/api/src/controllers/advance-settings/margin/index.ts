import { Response } from 'express';
import { UserRequest } from '../../../types/common/req';
import { ResponseType } from '../../../constants/common/response-type';
import MarginService from '../../../services/advance-settings/margin';

import Logger from '../../../utils/logger';

class MarginController {
  public static async getMarginSettings(req: UserRequest, res: Response) {
    try {
      let data = await MarginService.getMarginSettings(
        Number(req.params.userId)
      );

      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        data,
        message: '',
      });
    } catch (e) {
      console.log('error in getting margin settings ', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async updateMarginSettings(req: UserRequest, res: Response) {
    try {
      let data = await MarginService.updateMarginSettings(
        req.body,
        req.userData.id
      );

      if (data.status == false) {
        return res.send({
          status: false,
          message: data.msg || '',
          type: ResponseType.ERROR,
        });
      } else {
        const logData = {
          operation: 'update',
          type: 'event',
          loggedInUser: req.userData.id,
          targetUsers: [req.userData.id],
          actionDoneBy: 'user',
          description: `User ${req.userData.id} update margin settings`,
          metadata: {
            additionalInfo: data,
          },
        };
        Logger.logQueue(logData);

        return res.send({
          status: true,
          message: '',
          type: ResponseType.SUCCESS,
          data: data.data,
        });
      }
    } catch (e) {
      console.log('error in updating margin settings ', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }
}

export default MarginController;
