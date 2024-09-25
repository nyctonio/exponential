import { Response } from 'express';
import { UserRequest } from '../../types/common/req';
import SuspiciousService from '../../services/suspicious';
import { ResponseType } from '../../constants/common/response-type';

class suspiciousController {
  public static async getSuspiciousData(req: UserRequest, res: Response) {
    try {
      let data = await SuspiciousService.getSuspiciousTrades();
      return res.send(data);
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getFilters(req: UserRequest, res: Response) {
    try {
      let data = await SuspiciousService.getFilters();
      return res.send(data);
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async updateFilters(req: UserRequest, res: Response) {
    try {
      let data = await SuspiciousService.updateFilters(req.body);
      return res.send(data);
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getRules(req: UserRequest, res: Response) {
    try {
      let data = await SuspiciousService.getRules();
      return res.send(data);
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async updateRuleStatus(req: UserRequest, res: Response) {
    try {
      let data = await SuspiciousService.updateRuleStatus(req.body);
      return res.send(data);
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async updateRules(req: UserRequest, res: Response) {
    try {
      let data = await SuspiciousService.updateRules(req.body);
      return res.send(data);
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }
}
export default suspiciousController;
