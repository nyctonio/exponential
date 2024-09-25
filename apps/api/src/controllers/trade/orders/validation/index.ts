import joi from 'joi';

const CreateOrderSchema = joi.object({
  orderType: joi.string().valid('market', 'limit').required(),
  type: joi.string().valid('B', 'S').required(),
  quantity: joi.number().min(1).required(),
  price: joi.number().min(0).required(),
  script: joi.string().required(),
  isIntraday: joi.boolean().required(),
});

const CancelOrderSchema = joi.object({
  orderId: joi.number().required(),
});

const GetOrdersSchema = joi.object({
  username: joi.string().allow('').required(),
  exchange: joi.string().required().allow(''),
  script: joi.string().allow('').required(),
  transactionStatus: joi.string().optional(),
  sort: joi.any(),
  tradeDateFrom: joi.string().allow(null).required(),
  tradeDateTo: joi.string().allow(null).required(),
  pageNumber: joi.number().required(),
  pageSize: joi.number().required(),
  groupByScript: joi.boolean().optional(),
});

type GetOrders = {
  username: string;
  exchange: string;
  script: string;
  tradeDateFrom: string | null;
  tradeDateTo: string | null;
  pageNumber: number;
  pageSize: number;
  transactionStatus: string;
  sort: any;
  groupByScript: boolean | null;
};

type EditOrder = {
  userId: number;
  orderId: number;
  quantity: number;
  price: number;
};

const editOrdersSchema = joi.object({
  userId: joi.number().required(),
  orderId: joi.number().required(),
  quantity: joi.number().required(),
  price: joi.number(),
});

export {
  CreateOrderSchema,
  CancelOrderSchema,
  GetOrdersSchema,
  GetOrders,
  EditOrder,
  editOrdersSchema,
};
