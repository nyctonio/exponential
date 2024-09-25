import { Response } from 'express';
import { UserRequest } from '../../../types/common/req';
import { ResponseType } from '../../../constants/common/response-type';
import AutoCutService from '../../../services/advance-settings/auto-cut';
import { UpdateAutoCutSettingsSchema } from '../validation';

import Logger from '../../../utils/logger';

class AutoCutController {
  public static async getAutoCutSettings(req: UserRequest, res: Response) {
    try {
      let response = await AutoCutService.getAutoCutSettings(
        req.params.username
      );
      if (response.status) {
        return res.send({
          status: true,
          data: response.data,
          message: '',
          type: ResponseType.SUCCESS,
        });
      } else {
        return res.send({
          status: false,
          message: response.message,
          type: ResponseType.ERROR,
        });
      }
    } catch (e) {
      console.log('error in getting auto cut settings ', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async updateAutoCutSettings(req: UserRequest, res: Response) {
    try {
      let validationResult = UpdateAutoCutSettingsSchema.validate(req.body);
      if (validationResult.error) {
        return res.send({
          status: false,
          type: ResponseType.ERROR,
          message: validationResult.error.details[0].message,
        });
      }

      let data = await AutoCutService.updateAutoCutSettings(req.body);
      if (data.status == false) {
        return res.send({
          status: false,
          type: ResponseType.ERROR,
          message: data.message,
        });
      }

      const logData = {
        operation: 'update',
        type: 'event',
        loggedInUser: req.body.userId,
        targetUsers: [req.body.userId],
        actionDoneBy: 'user',
        description: `User ${req.body.userId} updated auto cut settings`,
        metadata: {
          additionalInfo: data,
        },
      };
      Logger.logQueue(logData);

      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        message: '',
      });
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }
}

export default AutoCutController;
