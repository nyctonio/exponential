import { Response } from 'express';
import { UserRequest } from '../../../types/common/req';
import { ResponseType } from '../../../constants/common/response-type';
import ScriptQuantityService from '../../../services/advance-settings/script-quantity';

import Logger from '../../../utils/logger';

class ScriptQuantityController {
  public static async getScriptQuantitySettings(
    req: UserRequest,
    res: Response
  ) {
    try {
      let data = await ScriptQuantityService.getScriptQuantitySettings(
        Number(req.params.userId)
      );

      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        data: data,
        message: '',
      });
    } catch (e) {
      console.log('error in ', e);
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async updateScriptQuantitySettings(
    req: UserRequest,
    res: Response
  ) {
    try {
      let resData = await ScriptQuantityService.updateScriptQuantitySettings(
        req.body,
        req.userData.id
      );
      if (resData.status == false) {
        return res.send({
          status: false,
          type: ResponseType.ERROR,
          message: resData.msg,
        });
      }

      const logData = {
        operation: 'update',
        type: 'event',
        loggedInUser: req.userData.id,
        targetUsers: [req.userData.id],
        actionDoneBy: 'user',
        description: 'User updated script quantity settings',
        metadata: {
          additionalInfo: resData,
        },
      };
      Logger.logQueue(logData);

      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        message: '',
        data: resData.data,
      });
    } catch (e) {
      console.log('error in updating scripts  ', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }
}

export default ScriptQuantityController;
