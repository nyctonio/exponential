import Joi from 'joi';
const AppSettings = {
  GET_TERMS_AND_CONDITIONS: {
    url: '/api/static-content/list/admin',
    method: { type: 'GET', validation: Joi.any() },
  },
  EDIT_TERMS_AND_CONDITIONS: {
    url: '/api/static-content/edit',
    method: { type: 'PUT', validation: Joi.any() },
  },
  ADD_USER_MANUAL: {
    url: '/api/static-content/save',
    method: { type: 'POST', validation: Joi.any() },
  },
  GET_USER_MANUAL_LIST: {
    url: '/api/static-content/list/admin',
    method: { type: 'GET', validation: Joi.any() },
  },
  UPDATE_MANUAL_STATUS: {
    url: '/api/static-content/changeStatus',
    method: { type: 'PUT', validation: Joi.any() },
  },
  UPDATE_MANUAL: {
    url: '/api/static-content/edit/userManual',
    method: { type: 'PUT', validation: Joi.any() },
  },
};

export const TERMSANDCONDITIONS = {
  ...AppSettings,
};
