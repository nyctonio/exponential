import { Response } from 'express';
import { UserRequest } from '../../../types/common/req';
import { ResponseType } from '../../../constants/common/response-type';
import TradeStatusService from '../../../services/trade/status';

class TradeStatusController {
  public static async getTradeStatus(req: UserRequest, res: Response) {
    try {
      let data = await TradeStatusService.getTradeStatus();
      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        data,
        message: '',
      });
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getTradeStatusByMonth(req: UserRequest, res: Response) {
    try {
      let data = await TradeStatusService.getTradeStatusByMonth(
        req.body.startDate,
        req.body.endDate
      );
      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        data,
        message: '',
      });
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async saveTradeStatus(req: UserRequest, res: Response) {
    try {
      let data = await TradeStatusService.saveTradeStatus(req.body);
      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        data,
        message: '',
      });
    } catch (e) {
      console.log('error in saving trade status ', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }
}

export default TradeStatusController;
