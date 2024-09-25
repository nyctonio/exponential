import { Response } from 'express';
import { UserRequest } from '../../../types/common/req';
import { ResponseType } from '../../../constants/common/response-type';
import {
  CreateOrderSchema,
  CancelOrderSchema,
  GetOrdersSchema,
  editOrdersSchema,
  EditOrder,
} from './validation';
import OrdersService from '../../../services/trade/orders';
import ValidationService from '../../../services/trade/validation';

class CreateOrderController {
  public static async createOrder(req: UserRequest, res: Response) {
    try {
      const { error } = CreateOrderSchema.validate(req.body);
      if (error) {
        return res.send({
          status: false,
          type: ResponseType.ERROR,
          message: error.details[0].message,
        });
      }
      const order = await OrdersService.createOrder(req.body, req.userData.id);
      return res.send({
        status: true,
        data: order,
        message: 'Order Created Successfully',
      });
    } catch (e) {
      console.log('error :', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async cancelOrder(req: UserRequest, res: Response) {
    try {
      const { error } = CancelOrderSchema.validate(req.body);
      if (error) {
        return res.send({
          status: false,
          type: ResponseType.ERROR,
          message: error.details[0].message,
        });
      }
      const order = await OrdersService.cancelOrder(req.body, req.userData.id);
      return res.send({
        status: true,
        data: order,
        message: 'Order Created Successfully',
      });
    } catch (e) {
      console.log('error :', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async preValidation(req: UserRequest, res: Response) {
    try {
      let data = await ValidationService.getPreTradeValidation({
        userId: req.query.userId ? Number(req.query.userId) : req.userData.id,
      });
      return res.send({
        status: true,
        data,
        type: ResponseType.SUCCESS,
        message: '',
      });
    } catch (e) {
      console.log('error in e', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getOpenOrders(req: UserRequest, res: Response) {
    try {
      let data = await OrdersService.getOpenOrders(req.userData);
      return res.send({
        status: true,
        data,
        type: ResponseType.SUCCESS,
        message: '',
      });
    } catch (e) {
      console.log('error in e', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getPositions(req: UserRequest, res: Response) {
    try {
      let data = await OrdersService.getPositions(req.userData);
      return res.send({
        status: true,
        data,
        type: ResponseType.SUCCESS,
        message: '',
      });
    } catch (e) {
      console.log('error in e', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getOrders(req: UserRequest, res: Response) {
    try {
      let { error } = GetOrdersSchema.validate(req.body);
      if (error) {
        return res.send({
          status: false,
          type: ResponseType.ERROR,
          message: error.details[0].message,
        });
      }
      let data = await OrdersService.getOrders(req.body, req.userData);

      return res.send({
        status: true,
        data,
        type: ResponseType.SUCCESS,
        message: '',
      });
    } catch (e) {
      console.log('error in e', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async squareOffTrades(req: UserRequest, res: Response) {
    try {
      let { userId, tradingSymbol, isIntraday } = req.body;
      await OrdersService.squareOffTrade(tradingSymbol, userId, isIntraday);
      return res.send({
        status: true,
        data: {},
        type: ResponseType.SUCCESS,
        message: '',
      });
    } catch (e) {
      console.log('error in square off ', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async deleteTrade(req: UserRequest, res: Response) {
    try {
      let { userId, orderId } = req.body;
      await OrdersService.deleteOrder(userId, orderId);
      return res.send({
        status: true,
        data: {},
        type: ResponseType.SUCCESS,
        message: '',
      });
    } catch (e) {
      console.log('error in square off ', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async editOrder(req: UserRequest, res: Response) {
    try {
      const { error } = editOrdersSchema.validate(req.body);
      if (error) {
        return res.send({
          status: false,
          type: ResponseType.ERROR,
          message: error.details[0].message,
        });
      }

      let data: EditOrder = req.body;

      await OrdersService.editOrder(
        data.userId,
        data.orderId,
        data.price,
        data.quantity
      );

      return res.send({
        status: true,
        data: {},
        message: '',
        type: ResponseType.SUCCESS,
      });
    } catch (e) {
      console.log('error in cancelling ', e);
      return res.send({
        status: false,
        data: {},
        message: e.message,
        type: ResponseType.SUCCESS,
      });
    }
  }

  public static async editPendingOrder(req: UserRequest, res: Response) {
    try {
      const { error } = editOrdersSchema.validate({
        ...req.body,
        userId: req.userData.id,
      });
      if (error) {
        return res.send({
          status: false,
          type: ResponseType.ERROR,
          message: error.details[0].message,
        });
      }

      let data: EditOrder = req.body;

      console.log('edit order', data);
      await OrdersService.editPendingOrder(
        req.userData.id,
        data.orderId,
        data.price,
        data.quantity
      );

      return res.send({
        status: true,
        data: {},
        message: '',
        type: ResponseType.SUCCESS,
      });
    } catch (e) {
      console.log('error in cancelling ', e);
      return res.send({
        status: false,
        data: {},
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async convertOrder(req: UserRequest, res: Response) {
    try {
      await OrdersService.convertOrder({
        orderId: req.body.orderId,
        userId: req.userData.id,
      });

      return res.send({
        status: true,
        data: {},
        message: '',
        type: ResponseType.SUCCESS,
      });
    } catch (e) {
      console.log('error in converting ', e);
      return res.send({
        status: false,
        data: {},
        message: e.message,
        type: ResponseType.SUCCESS,
      });
    }
  }
}
export default CreateOrderController;
