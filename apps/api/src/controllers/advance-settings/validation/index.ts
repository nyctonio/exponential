import Joi from 'joi';

export const UpdateAutoCutSettingsSchema = Joi.object({
  userId: Joi.number().required(),
  bidStopSettings: Joi.array().items({
    id: Joi.number().required(),
    option: Joi.string(),
    outside: Joi.boolean().required(),
    between: Joi.boolean().required(),
    cmp: Joi.number().required(),
  }),
  mcxBidStopSettings: Joi.array().items({
    id: Joi.number().required(),
    bidValue: Joi.number().required(),
    stopLossValue: Joi.number().required(),
  }),
  cuttingSettings: Joi.array().items({
    id: Joi.number().required(),
    value: Joi.string().required(),
    name: Joi.string().required(),
  }),
});
