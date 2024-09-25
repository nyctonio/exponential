import Joi from 'joi';
const AppSettings = {
  GET_CONTACT_LIST: {
    url: '/api/contact-us/list',
    method: { type: 'GET', validation: Joi.any() },
  },
  CHANGE_STATUS: {
    url: '/api/contact-us/changeStatus',
    method: { type: 'PUT', validation: Joi.any() },
  },
};

export const CONTACT_US = {
  ...AppSettings,
};
