import Joi from 'joi';

export const getProjectSettingsSchema = Joi.object({
  pageNumber: Joi.number().min(1).required(),
  pageSize: Joi.number().max(100).min(5).required(),
  prjSettKey: Joi.string().required().allow(''),
  prjSettName: Joi.string().required().allow(''),
  sort: Joi.object({
    key: Joi.string()
      .required()
      .allow('prjSettKey')
      .allow('prjSettName')
      .allow('prjSettConstant')
      .allow('prjSettDisplayName'),
    value: Joi.string().required().allow('ASC').allow('DESC'),
  }).allow(null),
});

export const updateProjectSettingSchema = Joi.object({
  id: Joi.number().required(),
  displayValue: Joi.string().required(),
  sortOrder: Joi.number().required().min(0),
  active: Joi.boolean().required(),
});

export const createProjectSettingSchema = Joi.object({
  applicationSettingKey: Joi.string().required(),
  applicationSettingName: Joi.string().required(),
  applicationSettingValue: Joi.string().required(),
  applicationSettingDisplay: Joi.string().required(),
  applicationSettingSort: Joi.number().required(),
});
