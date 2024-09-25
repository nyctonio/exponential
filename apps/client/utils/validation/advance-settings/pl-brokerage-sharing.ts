import Joi from 'joi';

export const brokerageSharingValidation = Joi.array()
  .items(
    Joi.object({
      id: Joi.number().required(),
      exchange: Joi.string().required(),
      total: Joi.number().required(),
      upline: Joi.number().required().allow(null),
      self: Joi.number().required(),
      downline: Joi.number().required().allow(null),
      broker: Joi.number().required().allow(null),
      subbroker: Joi.number().required().allow(null),
      isUpdated: Joi.boolean().required().allow(null),
      thirdparty: Joi.number().required().allow(null),
      thirdpartyremarks: Joi.string().required().allow(null),
    })
  )
  .required();

export const plSharingValidation = Joi.array()
  .items(
    Joi.object({
      id: Joi.number().required(),
      exchange: Joi.string().required(),
      upline: Joi.number().required().allow(null),
      self: Joi.number().required(),
      downline: Joi.number().required().allow(null),
      broker: Joi.number().required().allow(null),
      subbroker: Joi.number().required().allow(null),
      isUpdated: Joi.boolean().required().allow(null),
      thirdparty: Joi.number().required().allow(null),
      thirdpartyremarks: Joi.string().required().allow(null),
    })
  )
  .required();
