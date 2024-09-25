import { Response } from 'express';
import { UserRequest } from '../../../types/common/req';
import { CreateUserBody } from '../../../types/user/create-user';
import { createUserValidationSchema } from './validations';
import { ResponseType } from '../../../constants/common/response-type';
import { CreateUserConstants } from '../../../constants/admin/create-user';
import CreateUserService from '../../../services/user/create-user';

class CreateUserController {
  public static async createUser(req: UserRequest, res: Response) {
    try {
      //stage 1 basic data validation
      let data: CreateUserBody = req.body;
      // validate fields
      let fieldsValidationResult = createUserValidationSchema.validate(
        req.body
      );
      // throw error if validation fails
      if (fieldsValidationResult.error) {
        return res.send({
          status: false,
          message: fieldsValidationResult.error.details[0].message,
          type: ResponseType.ERROR,
        });
      }
      // creating user
      let userService = new CreateUserService();
      let resData = await userService.createUser(data, req.userData);
      if (resData.status == true) {
        return res.send({
          status: true,
          data: resData.userId,
          message: 'User Created Successfully',
          type: ResponseType.SUCCESS,
        });
      } else {
        return res.send({
          status: false,
          message: 'Validation Error',
          data: resData.errors || [],
          type: ResponseType.VALIDATION_ERROR,
        });
      }
    } catch (e) {
      if (e.code == '23505') {
        return res.send({
          status: false,
          message: 'Username Already Taken!!',
          data: [
            {
              key: CreateUserConstants.KEYS.USERNAME,
              message: CreateUserConstants.VALIDATION.USERNAME,
            },
          ],
          type: ResponseType.VALIDATION_ERROR,
        });
      }
      console.log('error is ', e);
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async getUsernameAvailability(req: UserRequest, res: Response) {
    try {
      let createUser = new CreateUserService();
      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        data: await createUser.getUsernameAvailability(req.params.username),
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

  public static async getDropdownData(req: UserRequest, res: Response) {
    try {
      let { userId } = req.query;
      let parsedUserId;
      if (userId) {
        parsedUserId = parseInt(userId.toString());
      } else {
        parsedUserId = req.userData.id;
      }
      let service = new CreateUserService();
      return res.send({
        status: true,
        data: await service.getDropdownData(parsedUserId),
        type: ResponseType.SUCCESS,
        message: '',
      });
    } catch (e) {
      console.log('error  e', e);
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }
}

export default CreateUserController;
