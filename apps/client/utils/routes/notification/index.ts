import Joi from 'joi';

const AppSettings = {
  GET_NOTIFICATIONS: {
    url: '/api/notifications/list',
    method: { type: 'GET', validation: Joi.any() },
  },
  CHECK_NOTIFICATION: {
    url: '/api/notifications/read',
    method: { type: 'PUT', validation: Joi.any() },
  },
  GET_ADMIN_NOTIFICATION_LIST: {
    url: '/api/notifications/list/admin',
    method: { type: 'GET', validation: Joi.any() },
  },
  SAVE_NOTIFICATION: {
    url: '/api/notifications/save',
    method: { type: 'POST', validation: Joi.any() },
  },
  SAVE_BROADCAST_MESSAGE: {
    url: '/api/broadcast-message/save',
    method: { type: 'POST', validation: Joi.any() },
  },
  GET_ADMIN_MESSAGE_LIST: {
    url: '/api/broadcast-message/list/admin',
    method: { type: 'GET', validation: Joi.any() },
  },
  GET_MESSAGE_LIST: {
    url: '/api/broadcast-message/list',
    method: { type: 'GET', validation: Joi.any() },
  },
  CHECK_MESSAGE: {
    url: '/api/broadcast-message/read',
    method: { type: 'PUT', validation: Joi.any() },
  },
};

export const NOTIFICATION = {
  ...AppSettings,
};
