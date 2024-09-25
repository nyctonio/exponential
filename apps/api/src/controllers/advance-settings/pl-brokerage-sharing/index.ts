import { Request, Response } from 'express';
import { UserRequest } from '../../../types/common/req';
import { ResponseType } from '../../../constants/common/response-type';
import {
  PlSharingService,
  BrokerageSharingService,
  RentSharingService,
} from '../../../services/advance-settings/pl-brokerage-sharing';
import {
  updatePlSharingSchema,
  updateBrokerageSharingSchema,
} from './validation';

import Logger from '../../../utils/logger';

class PlBrokerageSharingController {
  public static async getPlSharing(req: UserRequest, res: Response) {
    try {
      const { username } = req.body;
      if (!username) throw new Error('Username is required');
      console.log(req.userData);
      const data = await PlSharingService.getPlSharingData({
        username,
        currUser: req.userData,
      });
      return res.send({
        status: true,
        message: 'Fetched successfully',
        type: ResponseType.SUCCESS,
        data,
      });
    } catch (e) {
      console.log('error in getting script ', e);
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async updatePlSharing(req: UserRequest, res: Response) {
    try {
      const { error, value } = updatePlSharingSchema.validate(req.body);
      if (error) {
        return res.send({
          status: false,
          message: error.message,
          type: ResponseType.VALIDATION_ERROR,
        });
      }
      const data = await PlSharingService.updatePlSharingData({
        data: req.body,
        currUser: req.userData,
      });

      const logData = {
        operation: 'update',
        type: 'event',
        loggedInUser: req.userData.id,
        targetUsers: [req.userData.id],
        actionDoneBy: 'user',
        description: 'User update Pl sharing data',
        metadata: {
          additionalInfo: data,
        },
      };
      Logger.logQueue(logData);

      return res.send({
        status: true,
        message: 'Updated successfully',
        type: ResponseType.SUCCESS,
        data,
      });
    } catch (e) {
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async getBrokerageSharing(req: UserRequest, res: Response) {
    try {
      const { username } = req.body;
      if (!username) throw new Error('Username is required');
      console.log(req.userData);
      const data = await BrokerageSharingService.getBrokerageSharingData({
        username,
        currUser: req.userData,
      });
      return res.send({
        status: true,
        message: 'Fetched successfully',
        type: ResponseType.SUCCESS,
        data,
      });
    } catch (e) {
      console.log('error in getting script ', e);
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async updateBrokerageSharing(req: UserRequest, res: Response) {
    try {
      const { error, value } = updateBrokerageSharingSchema.validate(req.body);
      if (error) {
        return res.send({
          status: false,
          message: error.message,
          type: ResponseType.VALIDATION_ERROR,
        });
      }
      const data = await BrokerageSharingService.updateBrokerageSharingData({
        data: req.body,
        currUser: req.userData,
      });

      const logData = {
        operation: 'update',
        type: 'event',
        loggedInUser: req.userData.id,
        targetUsers: [req.userData.id],
        actionDoneBy: 'user',
        description: 'User update brokerage sharing data',
        metadata: {
          additionalInfo: data,
        },
      };
      Logger.logQueue(logData);

      return res.send({
        status: true,
        message: 'Updated successfully',
        type: ResponseType.SUCCESS,
        data,
      });
    } catch (e) {
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async getRentSharing(req: UserRequest, res: Response) {
    try {
      const { username } = req.body;
      if (!username) throw new Error('Username is required');
      const data = await RentSharingService.getRentData(username, {
        id: req.userData.id,
      });
      return res.send({
        status: true,
        message: 'Updated successfully',
        type: ResponseType.SUCCESS,
        data,
      });
    } catch (e) {
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }
}

export default PlBrokerageSharingController;
