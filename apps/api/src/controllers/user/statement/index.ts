import { Response, response } from 'express';
import { UserRequest } from '../../../types/common/req';
import { ResponseType } from '../../../constants/common/response-type';
import AuthService from '../../../services/auth';
import StatementService from '../../../services/user/statement';

class UserStatementController {
  public static async getUserStatement(req: UserRequest, res: Response) {
    try {
      let accountStatement = await StatementService.getStatementData(
        req.userData.id
      );

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

  public static async getHierarchyTransactions(
    req: UserRequest,
    res: Response
  ) {
    try {
      let data = await StatementService.getHierarchyTransactions(
        req.userData.id,
        req.body.pageNumber,
        req.body.pageSize,
        req.query.username.toString()
      );

      return res.send({
        status: true,
        data: data,
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

  public static async getSettlementIndexes(req: UserRequest, res: Response) {
    try {
      let data = await StatementService.getSettlementIndex(
        req.body.userId,
        req.body.period,
        req.userData.id
      );

      return res.send({ status: true, data: data, type: ResponseType.SUCCESS });
    } catch (e) {
      console.log('error is ===>', e);
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async getSettlementLogs(req: UserRequest, res: Response) {
    try {
      let data = await StatementService.getSettlementLogs(
        req.body.userId || req.userData.id,
        req.body.period,
        req.body.pageNumber
      );

      return res.send({ status: true, data: data, type: ResponseType.SUCCESS });
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
export default UserStatementController;
