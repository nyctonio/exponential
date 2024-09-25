import { Response, response } from 'express';
import { UserRequest } from '../../../types/common/req';
import SearchUserService from '../../../services/user/search-user';
import { ResponseType } from '../../../constants/common/response-type';
import { SearchUserBody } from '../../../types/user/search-user';
import {
  getLoginHistorySchema,
  searchUserSchema,
  searchUserTransactionSchema,
} from './validations';
import AuthService from '../../../services/auth';

class SearchUserController {
  public static async getCompanyBrokers(req: UserRequest, res: Response) {
    try {
      let brokersData = await SearchUserService.getCompanyBrokers(
        req.userData.id
      );

      return res.send({
        status: true,
        data: brokersData,
        message: '',
        type: ResponseType.SUCCESS,
      });
    } catch (e) {
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async getSubBrokers(req: UserRequest, res: Response) {
    try {
      let subBrokersData = await SearchUserService.getSubBrokers(
        req.userData.id
      );

      return res.send({
        status: true,
        data: subBrokersData,
        message: '',
        type: ResponseType.SUCCESS,
      });
    } catch (e) {
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async searchUser(req: UserRequest, res: Response) {
    try {
      let searchData: SearchUserBody = req.body;
      let validationResult = searchUserSchema.validate(req.body);
      if (validationResult.error) {
        return res.send({
          status: false,
          message: validationResult.error.details[0].message,
          type: ResponseType.ERROR,
        });
      }
      let data = await SearchUserService.searchUser(
        req.userData.id,
        searchData
      );
      return res.send({
        status: true,
        data,
        type: ResponseType.SUCCESS,
        message: '',
      });
    } catch (e) {
      console.log('error in searching user ', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async transaction(req: UserRequest, res: Response) {
    try {
      let validationResult = searchUserTransactionSchema.validate(req.body);
      if (validationResult.error) {
        return res.send({
          status: false,
          message: validationResult.error.details[0].message,
          type: ResponseType.ERROR,
        });
      }

      let passwordCheck = await AuthService.verifyPassword(
        req.body.password,
        req.userData.id
      );

      if (!passwordCheck) {
        return res.send({
          status: false,
          message: 'Invalid Password',
          type: ResponseType.ERROR,
        });
      }

      let result = await SearchUserService.transactionHandler(
        req.body,
        req.userData
      );

      return res.send({
        status: true,
        data: result,
        message: '',
        type: ResponseType.SUCCESS,
      });
    } catch (e) {
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async updatePassword(req: UserRequest, res: Response) {
    try {
      await SearchUserService.updatePasswordHandler(
        req.body.userId,
        req.body.password
      );
      return res.send({
        status: true,
        data: {},
        message: '',
        type: ResponseType.SUCCESS,
      });
    } catch (e) {
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async updateUserStatus(req: UserRequest, res: Response) {
    try {
      let passwordCheck = await AuthService.verifyPassword(
        req.body.password,
        req.userData.id
      );

      if (!passwordCheck) {
        return res.send({
          status: false,
          message: 'Invalid Password',
          type: ResponseType.ERROR,
        });
      }

      await SearchUserService.updateStatusHandler({
        currUserId: req.userData.id,
        lastStatus: req.body.lastStatus,
        remarks: req.body.remarks,
        updatedStatus: req.body.updatedStatus,
        userId: req.body.userId,
      });
      return res.send({
        status: true,
        data: {},
        message: '',
        type: ResponseType.SUCCESS,
      });
    } catch (e) {
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async getLoginHistory(req: UserRequest, res: Response) {
    try {
      let validationResult = getLoginHistorySchema.validate(req.body);
      if (validationResult.error) {
        return res.send({
          status: false,
          message: validationResult.error.details[0].message,
          type: ResponseType.ERROR,
        });
      }

      let data = await SearchUserService.loginHistory(req.body);

      return res.send({
        status: true,
        data: data,
        message: '',
        type: ResponseType.SUCCESS,
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
export default SearchUserController;
