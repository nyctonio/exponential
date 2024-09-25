import { Request, Response } from 'express';
import AuthService from '../../services/auth';
import { resetPasswordSchema, userLoginSchema } from './validation';
import { UserRequest } from '../../types/common/req';
import { ResponseType } from '../../constants/common/response-type';

class AuthController {
  public static async login(req: Request, res: Response) {
    try {
      // console.log('login request', req.ip);
      const parseIp = (req) =>
        req.headers['x-forwarded-for']?.split(',').shift() ||
        req.socket?.remoteAddress;

      // console.log(parseIp(req));
      let validation = userLoginSchema.validate(req.body);
      if (validation.error) {
        return res.send({
          status: false,
          type: ResponseType.VALIDATION_ERROR,
          message: validation.error.details[0].message,
        });
      }

      let {
        username,
        password,
        fcmToken,
      }: {
        username: string;
        password: string;
        fcmToken: string;
      } = req.body;
      let data = await AuthService.login({
        username,
        password,
        ip: parseIp(req) || req.ip,
        fcmToken,
      });
      // console.log('data is ', data);

      return res.send(data);
    } catch (e) {
      console.log('error is ', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async resetPassword(req: UserRequest, res: Response) {
    try {
      let validation = resetPasswordSchema.validate(req.body);
      if (validation.error) {
        return res.send({
          status: false,
          type: ResponseType.VALIDATION_ERROR,
          message: validation.error.details[0].message,
        });
      }
      let { oldPassword, newPassword } = req.body;
      let data = await AuthService.resetPassword({
        newPassword,
        oldPassword,
        userId: req.userData.id,
      });

      return res.send(data);
    } catch (e) {
      console.log('route err', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }
}

export default AuthController;
