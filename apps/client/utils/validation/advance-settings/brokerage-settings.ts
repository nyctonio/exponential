import Joi from 'joi';

type InstrumentType = {
  name: string;
  exchange: string;
  tradingsymbol: string;
  uplineBrokerage: number;
  uplineBrokerageType: string;
  userBrokerage: number;
  userBrokerageType: string;
  userBrokerageUpdated: boolean;
  upline: 'SCRIPT' | 'EXCH';
  user: 'SCRIPT' | 'EXCH';
  updatedAt: string;
};

const brokerageSettingsValidation = Joi.array().items(
  Joi.object({
    id: Joi.number().required(),
    name: Joi.string().required(),
    exchange: Joi.string().required(),
    tradingsymbol: Joi.string().required(),
    uplineBrokerage: Joi.number().required(),
    uplineBrokerageType: Joi.string().required(),
    userBrokerage: Joi.number().required().min(Joi.ref('uplineBrokerage')),
    userBrokerageType: Joi.string().required(),
    userBrokerageUpdated: Joi.boolean().required(),
    upline: Joi.string().valid('SCRIPT', 'EXCH').required(),
    user: Joi.string().valid('SCRIPT', 'EXCH').required(),
    updatedAt: Joi.string().required(),
  })
);

export { brokerageSettingsValidation };
