import { Response, response } from 'express';
import { UserRequest } from '../../../types/common/req';
import { ResponseType } from '../../../constants/common/response-type';
import AuthService from '../../../services/auth';
import UpdateUserService from '../../../services/user/update-user';
import {
  updateUserBasicDetails,
  exchangeSettingsBody,
  smSquareOffBody,
  onlySquareOffBody,
  m2mSquareOffBody,
} from './validations';

class SearchUserController {
  public static async basicDetails(req: UserRequest, res: Response) {
    try {
      let valid = updateUserBasicDetails.validate(req.body);
      if (valid.error) {
        return res.send({
          status: false,
          message: valid.error.details[0].message,
          type: ResponseType.ERROR,
        });
      }
      let brokersData = await UpdateUserService.basicDetails(
        req.body,
        req.userData
      );
      return res.send({
        status: true,
        data: brokersData,
        message: '',
        type: ResponseType.SUCCESS,
      });
    } catch (e) {
      console.log(e);
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async tradeSettings(req: UserRequest, res: Response) {
    try {
      let valid = exchangeSettingsBody.validate(req.body);
      if (valid.error) {
        return res.send({
          status: false,
          message: valid.error.details[0].message,
          type: ResponseType.ERROR,
        });
      }
      let brokersData = await UpdateUserService.tradeSettings(
        req.body,
        req.userData
      );
      return res.send({
        status: true,
        data: brokersData,
        message: '',
        type: ResponseType.SUCCESS,
      });
    } catch (e) {
      console.log(e);
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async smSquareOff(req: UserRequest, res: Response) {
    try {
      let valid = smSquareOffBody.validate(req.body);
      if (valid.error) {
        return res.send({
          status: false,
          message: valid.error.details[0].message,
          type: ResponseType.ERROR,
        });
      }

      await UpdateUserService.smSquareOff(req.body, req.userData.id);
      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        message: 'Updated',
        data: {},
      });
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async onlySquareOff(req: UserRequest, res: Response) {
    try {
      let valid = onlySquareOffBody.validate(req.body);
      if (valid.error) {
        return res.send({
          status: false,
          message: valid.error.details[0].message,
          type: ResponseType.ERROR,
        });
      }

      await UpdateUserService.onlySquareOff(req.body, req.userData.id);
      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        message: 'Updated',
        data: {},
      });
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async m2mSquareOff(req: UserRequest, res: Response) {
    try {
      let valid = m2mSquareOffBody.validate(req.body);
      if (valid.error) {
        return res.send({
          status: false,
          message: valid.error.details[0].message,
          type: ResponseType.ERROR,
        });
      }

      await UpdateUserService.m2mSquareOff(req.body, req.userData.id);
      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        message: 'Updated',
        data: {},
      });
    } catch (e) {
      console.log('errorr rrrr ', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }
}
export default SearchUserController;
