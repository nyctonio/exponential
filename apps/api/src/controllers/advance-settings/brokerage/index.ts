import { Response } from 'express';
import { UserRequest } from '../../../types/common/req';
import { ResponseType } from '../../../constants/common/response-type';
import BrokerageService from '../../../services/advance-settings/brokerage';
import { UpdateBrokerage, updateBrokerageSchema } from './validation';

import Logger from '../../../utils/logger';

class BrokerageSettingsController {
  public static async getScriptBrokerageSettings(
    req: UserRequest,
    res: Response
  ) {
    try {
      let scriptBrokerageData =
        await BrokerageService.getScriptBrokerageSettings(
          Number(req.params.userId)
        );
      return res.send({ status: true, data: scriptBrokerageData });
    } catch (e) {
      console.log('error in getting script ', e);
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async updateScriptBrokerageSettings(
    req: UserRequest,
    res: Response
  ) {
    try {
      let { error, value } = updateBrokerageSchema.validate(req.body);
      if (error) {
        return res.send({
          status: false,
          message: error.message,
          type: ResponseType.ERROR,
        });
      }
      console.log('value is ', value);
      let scriptBrokerageData = await BrokerageService.updateBrokerageSettings({
        userId: req.body.userId,
        instruments: req.body.instruments,
      });

      const logData = {
        operation: 'update',
        type: 'event',
        loggedInUser: req.body.userId,
        targetUsers: [req.body.userId],
        actionDoneBy: 'user',
        description: `User ${req.body.userId} update script brokerage settings`,
        metadata: {
          additionalInfo: scriptBrokerageData,
        },
      };
      Logger.logQueue(logData);
      return res.send({ status: true, data: scriptBrokerageData });
    } catch (e) {
      console.log('error in getting script ', e);
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }
}

export default BrokerageSettingsController;
