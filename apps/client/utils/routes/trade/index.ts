import Joi from 'joi';

const AppSettings = {
  CREATE_TRADE_ORDER: {
    url: '/api/trade/orders/create-order',
    method: {
      type: 'POST',
      validation: Joi.object({
        orderType: Joi.string().valid('market', 'limit').required(),
        type: Joi.string().valid('B', 'S').required(),
        quantity: Joi.number().min(1).required(),
        price: Joi.number().min(0).required(),
        script: Joi.string().required(),
        isIntraday: Joi.boolean().required(),
      }),
    },
  },
  GET_TRADE_ORDER: {
    url: '/api/trade/orders/get-orders',
    method: { type: 'POST', validation: Joi.any() },
  },
  PRE_TRADE_VALIDATION: {
    url: '/api/trade/orders/prevalidation',
    method: { type: 'GET', validation: Joi.any() },
  },
  GET_OPEN_ORDERS: {
    url: '/api/trade/orders/get-open-orders',
    method: { type: 'GET', validation: Joi.any() },
  },
  // GET_POSITIONS: {
  //   url: '/api/trade/orders/get-positions',
  //   method: { type: 'GET', validation: Joi.any() },
  // },
  GET_TRADE_STATUS: {
    url: '/api/trade/status/get-trade-status',
    method: { type: 'GET', validation: Joi.any() },
  },
  GET_TRADE_STATUS_BY_MONTH: {
    url: '/api/trade/status/get-trade-status-by-month',
    method: { type: 'POST', validation: Joi.any() },
  },
  SQUARE_OFF_TRADES: {
    url: '/api/trade/orders/square-off-trades',
    method: { type: 'POST', validation: Joi.any() },
  },
  ORDER_CANCEL: {
    url: '/api/trade/orders/cancel-order',
    method: {
      type: 'POST',
      validation: Joi.object({
        orderId: Joi.number().required(),
      }),
    },
  },
  ORDER_DELETE: {
    url: '/api/trade/orders/delete-order',
    method: {
      type: 'POST',
      validation: Joi.object({
        orderId: Joi.number().required(),
        userId: Joi.number().required(),
      }),
    },
  },

  ORDER_EDIT: {
    url: '/api/trade/orders/edit-order',
    method: {
      type: 'POST',
      validation: Joi.any(),
    },
  },
  EDIT_PENDING_ORDER: {
    url: '/api/trade/orders/edit-pending-order',
    method: {
      type: 'POST',
      validation: Joi.any(),
    },
  },
  CONVERT_ORDER: {
    url: '/api/trade/orders/convert-order',
    method: {
      type: 'POST',
      validation: Joi.any(),
    },
  },
  GET_SUSPICIOUS_TRADES: {
    url: '/api/suspicious/records',
    method: { type: 'GET', validation: Joi.any() },
  },
  GET_SUSPICIOUS_RULES: {
    url: '/api/suspicious/rules',
    method: { type: 'GET', validation: Joi.any() },
  },
  UPDATE_RULE_STATUS: {
    url: '/api/suspicious/rule/update/status',
    method: { type: 'PUT', validation: Joi.any() },
  },
  UPDATE_SUSPICIOUS_RULES: {
    url: '/api/suspicious/rule/update',
    method: { type: 'POST', validation: Joi.any() },
  },
  UPDATE_TRADE_STATUS: {
    url: '/api/trade/status/save-trade-status',
    method: { type: 'POST', validation: Joi.any() },
  },
  ADD_RECONCILIATIONS_ACTION: {
    url: '/api/trade/corporate-actions/create-action',
    method: { type: 'POST', validation: Joi.any() },
  },
  GET_RECONCILIATIONS_ACTIONS: {
    url: '/api/trade/corporate-actions/get-actions',
    method: { type: 'GET', validation: Joi.any() },
  },
};

export const TRADE = {
  ...AppSettings,
};
