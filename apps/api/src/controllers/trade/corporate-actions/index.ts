import { Response } from 'express';
import { UserRequest } from '../../../types/common/req';
import CorporateActionsService from '../../../services/corporate-actions';
import { ResponseType } from '../../../constants/common/response-type';

class CorporateActionsController {
  public static async getActions(req: UserRequest, res: Response) {
    try {
      let data = await CorporateActionsService.getActions();
      return res.send({
        status: true,
        data: data,
        message: '',
        type: ResponseType.SUCCESS,
      });
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async createAction(req: UserRequest, res: Response) {
    try {
      await CorporateActionsService.createAction({
        actionData: req.body.actionData,
        actionDate: req.body.actionDate,
        actionType: req.body.actionType,
        instrumentName: req.body.instrumentName,
      });

      return res.send({ status: true, data: {}, type: ResponseType.SUCCESS });
    } catch (e) {
      console.log('error in create action ', e);
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }
}

export default CorporateActionsController;
