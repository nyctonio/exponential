import Joi from 'joi';

const SearchClient = {
  SEARCH_USER: {
    url: '/api/user/search',
    method: { type: 'POST', validation: Joi.any() },
  },
  GET_BROKERS_LIST: {
    url: '/api/user/search/get-brokers',
    method: { type: 'GET', validation: Joi.any() },
  },
  GET_SUB_BROKERS_LIST: {
    url: '/api/user/search/get-sub-brokers',
    method: { type: 'GET', validation: Joi.any() },
  },
  UPDATE_USER_STATUS: {
    url: '/api/user/search/update-user-status',
    method: { type: 'PUT', validation: Joi.any() },
  },
  UPDATE_USER_PASSWORD: {
    url: '/api/user/search/update-user-password',
    method: { type: 'PUT', validation: Joi.any() },
  },
  CREATE_TRANSACTION: {
    url: '/api/user/search/create-transaction',
    method: { type: 'POST', validation: Joi.any() },
  },
  GET_LOGIN_HISTORY: {
    url: '/api/user/search/login-history',
    method: { type: 'POST', validation: Joi.any() },
  },
};

export const ADMIN = {
  ...SearchClient,
};
