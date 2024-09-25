import User from 'entity/user';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import Redis from 'entity/redis';
import { redisClient } from '../../lib/redis';
import { lookup } from 'fast-geoip';
import { m_user, t_userlogin } from 'database/sql/schema';
import printSafe from 'entity/common/printSafe';
import { UserRequest } from '../../types/common/req';
import { NextFunction, Response } from 'express';
import { AuthConstants } from '../../constants/auth';
import { ResponseType } from '../../constants/common/response-type';
import { env } from 'env';
import Menu from 'entity/menu';
import cache from 'lib/node-cache';
import { CacheKeys } from '../../constants/common/cache-keys';

import Logger from '../../utils/logger';

class AuthService {
  public static async userLoginLogger(userId: number, ip: string) {
    let locationData = await lookup(ip);
    const newLoginLog: any = new t_userlogin();
    newLoginLog.user = { id: userId };
    newLoginLog.ipAddress = ip;
    newLoginLog.locationMetadata = locationData || {};
    newLoginLog.deviceMetadata = {};
    await newLoginLog.save();
    return;
  }

  public static async createRedisSession(token: string, userId: number) {
    var value = await redisClient.get(userId.toString());
    printSafe(['initial value ', value]);
    let newSession = await redisClient.set(userId.toString(), token);
    value = await redisClient.get(userId.toString());
    printSafe(['final value ', value]);
    return;
  }

  public static async wrongAttemptHandler(
    userId: number,
    currAttempts: number
  ) {
    let updatedUser = await m_user.update(
      { id: userId },
      { noOfLoginAttempts: currAttempts + 1 }
    );

    return;
  }

  public static async hashPassword(plainPassword: string) {
    let salt = await bcrypt.genSalt(parseInt(env.SALT_ROUNDS));
    let hash = await bcrypt.hash(plainPassword, salt);
    return hash;
  }

  public static async verifyPassword(plainPassword: string, userId: number) {
    let userData = await m_user.findOne({
      where: { id: userId },
      select: { id: true, password: true },
    });

    let result = await bcrypt.compare(plainPassword, userData.password);
    return result;
  }

  public static async login({
    username,
    password,
    ip,
    fcmToken,
  }: {
    username: string;
    password: string;
    ip: string;
    fcmToken: string;
  }) {
    let user = new User({ userName: username });
    let userData = await user.getUserData({ userType: true });
    if (userData == null) {
      return {
        status: false,
        type: ResponseType.UNAUTHORISED,
        message: AuthConstants.NOT_FOUND,
      };
    }
    if (userData.noOfLoginAttempts >= 3) {
      return {
        status: false,
        type: ResponseType.UNAUTHORISED,
        message: AuthConstants.ACCOUNT_LOCKED,
      };
    }
    let passwordCheckResult = await bcrypt.compare(password, userData.password);
    if (!passwordCheckResult) {
      await user.updateLoginAttemptCount();
      return {
        status: false,
        type: ResponseType.UNAUTHORISED,
        message: AuthConstants.WRONG_PASSWORD,
      };
    }

    //checking user state
    if (
      (userData.userStatus &&
        userData.userStatus.prjSettConstant == 'Suspended') ||
      (userData.userStatus && userData.userStatus.prjSettConstant == 'Inactive')
    ) {
      return {
        status: false,
        type: ResponseType.UNAUTHORISED,
        message: AuthConstants.SUSPENDED_INACTIVE,
      };
    }

    if (
      userData.validTillDate &&
      moment().diff(userData.validTillDate, 'days') > 0
    ) {
      return {
        status: false,
        type: ResponseType.UNAUTHORISED,
        message: AuthConstants.VALID_TILL_DATE_EXPIRED,
      };
    }

    //checking reset required
    if (userData.resetRequired) {
      //assigning token
      let token = jwt.sign(
        {
          userId: userData.id,
          username: userData.username,
          userType: userData.userType.prjSettConstant,
        },
        env.JWT_RESET_SECRET,
        { expiresIn: env.JWT_RESET_TOKEN_EXPIRES_IN }
      );

      return {
        status: true,
        type: ResponseType.RESET_REQUIRED,
        data: { token },
        message: AuthConstants.RESET_REQUIRED,
      };
    }

    //assigning token
    let token = jwt.sign(
      {
        userId: userData.id,
        username: userData.username,
        userType: userData.userType.prjSettConstant,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    await Promise.all([
      user.createUserLoginLog(ip),
      Redis.create(`token-${userData.id}`, token),
      user.updateLoginAttemptCount(true),
      user.updateFcmToken(userData.id, fcmToken),
    ]);

    return {
      status: true,
      data: {
        token,
        user: {
          username: userData.username,
          email: userData.email,
          id: userData.id,
          userType: {
            userTypeId: userData.userType.id,
            name: userData.userType.prjSettDisplayName,
            constant: userData.userType.prjSettConstant,
          },
        },
      },
      type: ResponseType.SUCCESS,
      message: AuthConstants.SUCCESS,
    };
  }

  public static async resetPassword({
    newPassword,
    oldPassword,
    userId,
  }: {
    oldPassword: string;
    newPassword: string;
    userId: number;
  }) {
    let user = new User({ userId });

    let data = await user.getUserData();

    let bcryptCheck = await bcrypt.compare(oldPassword, data.password);

    if (!bcryptCheck) {
      return {
        status: false,
        type: ResponseType.ERROR,
        message: AuthConstants.RESET_OLD_PASSWORD_WRONG,
      };
    }

    let salt = await bcrypt.genSalt(Number(env.SALT_ROUNDS));
    let newHashedPassword = await bcrypt.hash(newPassword, salt);
    await user.passwordUpdate(newHashedPassword);

    let newData = await user.getUserData();

    const logData = {
      operation: 'update',
      type: 'event',
      loggedInUser: userId,
      targetUsers: [userId],
      actionDoneBy: 'user',
      description: 'User update the password',
      metadata: {
        oldData: data,
        newData: newData,
      },
    };
    Logger.logQueue(logData);

    return {
      status: true,
      type: ResponseType.SUCCESS,
      data: {},
      message: AuthConstants.RESET_PASSWORD_SUCCESS,
    };
  }

  public static async verifyUserLogin(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    let token = req.headers.authorization;
    if (!token) {
      return res.send({
        status: false,
        type: ResponseType.UNAUTHORISED,
        message: AuthConstants.TOKEN_NOT_AVAILABLE,
      });
    } else {
      token = token.substring(7, token.length);
    }

    jwt.verify(token, env.JWT_SECRET, async function (err, decoded: any) {
      if (err) {
        if (err.name == 'TokenExpiredError') {
          return res.send({
            status: false,
            type: ResponseType.TOKEN_EXPIRED,
            message: AuthConstants.TOKEN_EXPIRED,
          });
        } else {
          return res.send({
            status: false,
            type: ResponseType.ERROR,
            message: err.message,
          });
        }
      } else {
        let checkRedis = await Redis.get(`token-${decoded.userId.toString()}`);
        // console.log('check redis is ==> ', decoded.userId.toString());
        if (!checkRedis) {
          await redisClient.set(`token-${decoded.userId.toString()}`, token);
          req.userData = {
            id: decoded.userId,
            username: decoded.username,
            userType: decoded.userType,
          };
          next();
        } else {
          // if (checkRedis !== token) {
          //   return res.send({
          //     status: false,
          //     type: ResponseType.MULTIPLE_LOGIN,
          //     message: AuthConstants.MULTIPLE_LOGIN,
          //   });
          // } else {
          req.userData = {
            id: decoded.userId,
            username: decoded.username,
            userType: decoded.userType,
          };
          next();
          // }
        }
      }
    });
  }

  public static async verifyResetPassword(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    let token = req.headers.authorization;
    console.log('in reset request ', req.body, token);
    if (!token) {
      return res.send({
        status: false,
        type: ResponseType.UNAUTHORISED,
        message: AuthConstants.TOKEN_NOT_AVAILABLE,
      });
    } else {
      token = token.substring(7, token.length);
    }

    jwt.verify(token, env.JWT_RESET_SECRET, async function (err, decoded: any) {
      if (err) {
        if (err.name == 'TokenExpiredError') {
          return res.send({
            status: false,
            type: ResponseType.TOKEN_EXPIRED,
            message: AuthConstants.TOKEN_EXPIRED,
          });
        } else {
          console.log('error in reset password');
          return res.send({
            status: false,
            type: ResponseType.ERROR,
            message: err.message,
          });
        }
      } else {
        req.userData = {
          id: decoded.userId,
          username: decoded.username,
          userType: decoded.userType,
        };
        next();
      }
    });
  }

  public static async verifyUserHierarchy(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      let paramsUsername = req.params.username;
      let bodyUsername = req.body.username;
      let paramsUserId = req.params.userId;
      let bodyUserId = req.body.userId;
      let queryUserId = req.query.userId;
      let queryUsername = req.query.username;
      console.log('details->>>>>>>>>>>', req.params, req.query, req.body);
      if (
        req.originalUrl == '/api/user/create' ||
        req.originalUrl == '/api/user/search' ||
        req.baseUrl.startsWith('/api/user/create/get-username-availability')
      ) {
        return next();
      }
      if (
        !paramsUsername &&
        !bodyUsername &&
        !paramsUserId &&
        !bodyUserId &&
        !queryUserId &&
        !queryUsername
      ) {
        // console.log('auth: no involvement');
        return next();
      }

      let finalUserId = null;
      let finalUsername = null;
      let currUserId = req.userData.id;
      let currUserType = req.userData.userType;
      if (paramsUsername) {
        finalUsername = paramsUsername;
      }
      if (bodyUsername) {
        finalUsername = bodyUsername;
      }
      if (queryUsername) {
        finalUsername = queryUsername;
      }
      if (paramsUserId) {
        finalUserId = Number(paramsUserId);
      }
      if (bodyUserId) {
        finalUserId = Number(bodyUserId);
      }
      if (queryUserId) {
        finalUserId = Number(queryUserId);
      }
      // console.log('auth: curr user ', currUserId, currUserType);
      // console.log('auth: opr user', finalUserId, finalUsername);
      let user = new User({ userId: finalUserId, userName: finalUsername });
      let userData = await user.getUserData({
        broker: currUserType == 'Broker' ? true : false,
        company: currUserType == 'Company' ? true : false,
        master: currUserType == 'Master' ? true : false,
        subBroker: currUserType == 'Sub-Broker' ? true : false,
      });

      // console.log('auth: curr user info', userData);
      // console.log('curr user type ', currUserType);

      // if (userData) {
      if (currUserType == 'Master') {
        if (userData.master && userData.master.id == currUserId) {
          console.log('auth: passed');
          return next();
        } else {
          return res.send({
            status: false,
            type: ResponseType.ERROR,
            message: 'User Not Accessible',
          });
        }
      }

      if (currUserType == 'Broker') {
        if (userData.broker && userData.broker.id == currUserId) {
          console.log('auth: passed');
          return next();
        } else {
          return res.send({
            status: false,
            type: ResponseType.ERROR,
            message: 'User Not Accessible',
          });
        }
      }

      if (currUserType == 'Sub-Broker') {
        if (userData.subBroker && userData.subBroker.id == currUserId) {
          console.log('auth: passed');
          return next();
        } else {
          return res.send({
            status: false,
            type: ResponseType.ERROR,
            message: 'User Not Accessible',
          });
        }
      }
      // }

      // console.log('auth: ', userData);
      return next();
    } catch (e) {
      console.log('error in verfying ', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async verifyUserAccess(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    return next();
    try {
      console.log('curr time ', moment().format('HH:mm:ss'));
      let menu = new Menu(req.userData.id);
      let routeFunctionMappingData: any = cache.get(
        CacheKeys.ROUTE_FUNCTION_MAPPING
      );
      if (!routeFunctionMappingData) {
        routeFunctionMappingData = await menu.getRouteFunctionMapping();
        cache.set(
          CacheKeys.ROUTE_FUNCTION_MAPPING,
          routeFunctionMappingData,
          12000
        );
      }
      let currentRouteFunction = routeFunctionMappingData.find((a) =>
        req.originalUrl.startsWith(a.routeName)
      );
      // console.log('auth0: current route function ', currentRouteFunction);
      if (currentRouteFunction) {
        // let userFunctionAccessData = await menu.getUserFunctionAccessById(
        //   currentRouteFunction.func.id
        // );
        let userFunctionsAccessData: any = cache.get(
          `${CacheKeys.USER_FUNCTION_MAPPING}_${req.userData.id}`
        );
        // console.log('user functions from cache ', userFunctionsAccessData);
        if (!userFunctionsAccessData) {
          userFunctionsAccessData = await menu.getUserFunctionAccess();
          // console.log('setting cache ', userFunctionsAccessData);
          cache.set(
            `${CacheKeys.USER_FUNCTION_MAPPING}_${req.userData.id}`,
            userFunctionsAccessData,
            10000
          );
        }

        let userFunctionAccessData = await userFunctionsAccessData.find(
          (a) => a.func.id == currentRouteFunction.func.id
        );

        if (userFunctionAccessData) {
          if (userFunctionAccessData.isAccess == true) {
            console.log('auth: route access passed');
            console.log('end time ', moment().format('HH:mm:ss'));
            return next();
          } else {
            return res.send({
              status: false,
              type: ResponseType.UNAUTHORISED,
              message: 'Access Not Allowed!!!',
            });
          }
        } else {
          return res.send({
            status: false,
            type: ResponseType.UNAUTHORISED,
            message: 'User function mapping not available!!!',
          });
        }
      }
      return next();
      // return res.send({
      //   status: false,
      //   type: ResponseType.UNAUTHORISED,
      //   message: 'Route Not Available in Mapping!!!',
      // });
    } catch (e) {
      console.log('error is ', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: 'Error in verifying route access!!!',
      });
    }
  }
}

export default AuthService;
