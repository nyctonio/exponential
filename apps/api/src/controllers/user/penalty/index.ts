import { Response, response } from 'express';
import { UserRequest } from '../../../types/common/req';
import { ResponseType } from '../../../constants/common/response-type';
import PenaltyService from '../../../services/user/penalty';
import { UserPenaltyValidations } from './validations';

class PenaltyController {
  public static async getPenalty(req: UserRequest, res: Response) {
    try {
      let accountStatement = await PenaltyService.getPenalty(
        req.userData.id,
        req.body.userId
      );

      console.log('accountStatement');

      return res.send({
        status: true,
        data: accountStatement,
        message: '',
        type: ResponseType.SUCCESS,
      });
    } catch (e) {
      console.log('error is ===>', e);
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async setPenalty(req: UserRequest, res: Response) {
    try {
      const { error } = UserPenaltyValidations.validate(req.body);
      if (error) {
        return res.send({
          status: false,
          message: error.details[0].message,
          type: ResponseType.ERROR,
        });
      }
      let penalty = await PenaltyService.setPenalty(req.userData.id, req.body);

      return res.send({
        status: true,
        data: penalty,
        message: '',
        type: ResponseType.SUCCESS,
      });
    } catch (e) {
      console.log('error is ===>', e);
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }
}
export default PenaltyController;
