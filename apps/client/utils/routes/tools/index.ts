import Joi from 'joi';

const AppSettings = {
  GET_APP_SETTINGS_BY_KEY: {
    url: '/api/project-settings/keys',
    method: { type: 'POST', validation: Joi.any() },
  },
  GET_WATCH_LOGS: {
    url: '/api/logs/list',
    method: { type: 'GET', validation: Joi.any() },
  },
};

export const TOOLS = {
  ...AppSettings,
};
