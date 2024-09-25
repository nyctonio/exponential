import { Response } from 'express';
import { UserRequest } from '../../../types/common/req';
import { ResponseType } from '../../../constants/common/response-type';
import User from 'entity/user';
import UserCommonService from '../../../services/user/common';

class UsersCommonController {
  public static async getAssociatedUsers(req: UserRequest, res: Response) {
    try {
      let associatedUsers = await UserCommonService.getAssociatedUsers(
        req.userData.id,
        req.query.username.toString()
      );
      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        message: '',
        data: associatedUsers,
      });
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getUserDetails(req: UserRequest, res: Response) {
    try {
      let { userId } = req.query;
      let parsedUserId;
      if (userId) {
        parsedUserId = parseInt(userId.toString());
      } else {
        parsedUserId = req.userData.id;
      }

      let data = await UserCommonService.getUserCompleteInfo(parsedUserId);

      return res.send({
        status: true,
        message: '',
        type: ResponseType.SUCCESS,
        data,
      });
    } catch (e) {
      console.log('error is ', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getAllowedExchange(req: UserRequest, res: Response) {
    try {
      let { username } = req.params;
      let data = await UserCommonService.getAllowedExchanges(username);
      if (data.status == false) {
        return res.send({
          status: false,
          type: ResponseType.ERROR,
          message: 'User Not Found',
        });
      }
      return res.send({
        status: true,
        data: data.data,
        type: ResponseType.SUCCESS,
        message: '',
      });
    } catch (e) {
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async getParentId(req: UserRequest, res: Response) {
    try {
      let { userId } = req.query;
      let parsedUserId;
      if (userId) {
        parsedUserId = parseInt(userId.toString());
      } else {
        parsedUserId = req.userData.id;
      }

      let data = await UserCommonService.getParentId(parsedUserId);

      return res.send({
        status: true,
        message: '',
        type: ResponseType.SUCCESS,
        data,
      });
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getUserAccess(req: UserRequest, res: Response) {
    try {
      let data = await UserCommonService.getUserAccessData(req.params.username);
      return res.send({
        status: true,
        data,
        type: ResponseType.SUCCESS,
        message: '',
      });
    } catch (e) {
      console.log('error is ', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async updateUserAccess(req: UserRequest, res: Response) {
    try {
      await UserCommonService.updateUserAccessData(
        req.body.username,
        req.body.editedFunctions
      );
      return res.send({
        status: true,
        message: '',
        type: ResponseType.SUCCESS,
        data: {},
      });
    } catch (e) {
      console.log('error ', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async userContact(req: UserRequest, res: Response) {
    try {
      let data = await UserCommonService.userContact({
        ...req.body,
        userId: req.userData.id,
      });
      return res.send({
        status: true,
        data: data,
        message: '',
        type: ResponseType.SUCCESS,
      });
    } catch (e) {
      console.log('error ', e);
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }
}

export default UsersCommonController;
