import Joi from 'joi';

type ScriptQuantityInstrument = {
  id: number;
  name: string;
  exchange: string;
  tradingsymbol: string;
  uplineMaxQty: number;
  uplineMaxShot: number;
  userMaxQty: number;
  userMaxShot: number;
  active: boolean;
  updatedAt: String;
  uplineScriptId?: number;
  upline: 'EXCH' | 'SCRIPT';
  userScriptId?: number;
  user: 'EXCH' | 'SCRIPT';
  updated: boolean;
};

const scriptQuantityValidation = Joi.array().items(
  Joi.object({
    id: Joi.number().required(),
    name: Joi.string().required(),
    exchange: Joi.string().required(),
    tradingsymbol: Joi.string().required(),
    uplineMaxQty: Joi.number().required(),
    uplineMaxShot: Joi.number().required(),
    userMaxQty: Joi.number().max(Joi.ref('uplineMaxQty')).required().messages({
      'number.max':
        'User max quantity should be less than or equal to upline max quantity',
    }),
    userMaxShot: Joi.number().max(Joi.ref('uplineMaxShot')).required(),
    active: Joi.boolean().required(),
    updatedAt: Joi.string().required(),
    uplineScriptId: Joi.number().optional(),
    upline: Joi.string().valid('EXCH', 'SCRIPT').required(),
    userScriptId: Joi.number().optional(),
    user: Joi.string().valid('EXCH', 'SCRIPT').required(),
    updated: Joi.boolean().required(),
  })
);

export { scriptQuantityValidation };
