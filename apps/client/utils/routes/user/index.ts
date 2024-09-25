import { url } from 'inspector';
import Joi from 'joi';

const AppSettings = {
  GET_STATEMENT: {
    url: '/api/user/statement',
    method: { type: 'GET', validation: Joi.any() },
  },
  GET_TRANSACTIONS: {
    url: '/api/user/statement/get-transactions',
    method: { type: 'POST', validation: Joi.any() },
  },
  USER_CONTACT: {
    url: '/api/user/common/contact',
    method: { type: 'POST', validation: Joi.any() },
  },
  GET_PENALTY: {
    url: '/api/user/penalty/get-penalty',
    method: {
      type: 'POST',
      validation: Joi.object().keys({
        userId: Joi.number().required(),
      }),
    },
  },
  SET_PENALTY: {
    url: '/api/user/penalty/set-penalty',
    method: {
      type: 'POST',
      validation: Joi.object().keys({
        userId: Joi.number().required(),
        penaltyType: Joi.number().required(),
        penalty: Joi.number().required(),
        cutBrokerage: Joi.boolean().required(),
        hours: Joi.number().required(),
      }),
    },
  },

  GET_SETTLEMENT_INDEXES: {
    url: '/api/user/statement/get-settlement-indexes',
    method: { type: 'POST', validation: Joi.any() },
  },
  GET_SETTLEMENT_LOGS: {
    url: '/api/user/statement/get-settlement-logs',
    method: { type: 'POST', validation: Joi.any() },
  },
};

export const USER = {
  ...AppSettings,
};
