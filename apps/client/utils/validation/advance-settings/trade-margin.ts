import Joi from 'joi';

type InstrumentType = {
  id: number;
  name: string;
  exchange: string;
  tradingsymbol: string;
  uplineNormalMargin: number;
  uplineIntradayMargin: number;
  marginType: 'Percentage' | 'Per Lot';
  userNormalMargin: number;
  userIntradayMargin: number;
  userNormalMarginUpdated: boolean;
  userIntradayMarginUpdated: boolean;
  marginTypeUpdated: boolean;
  updatedAt: string;
  uplineMarginType: 'Percentage' | 'Per Lot';
  uplineNormalMarginType: 'SCRIPT' | 'EXCH';
  uplineIntraDayMarginType: 'SCRIPT' | 'EXCH';
  userMarginType: 'Percentage' | 'Per Lot';
  userNormalMarginType: 'SCRIPT' | 'EXCH';
  userIntraDayMarginType: 'SCRIPT' | 'EXCH';
};

const scriptQuantityValidation = Joi.array().items(
  Joi.object({
    id: Joi.number().required(),
    name: Joi.string().required(),
    exchange: Joi.string().required(),
    tradingsymbol: Joi.string().required(),
    uplineNormalMargin: Joi.number().required(),
    uplineIntradayMargin: Joi.number().required().min(0).allow(-1),
    marginType: Joi.string().required().valid('Percentage', 'Per Lot'),
    userNormalMargin: Joi.number()
      .min(Joi.ref('uplineNormalMargin'))
      .required(),
    userIntradayMargin: Joi.number()
      .required()
      .min(Joi.ref('uplineIntradayMargin'))
      .allow(-1),
    userNormalMarginUpdated: Joi.boolean().required(),
    userIntradayMarginUpdated: Joi.boolean().required(),
    marginTypeUpdated: Joi.boolean().required(),
    updatedAt: Joi.string().required(),
    uplineMarginType: Joi.string().required().valid('Percentage', 'Per Lot'),
    uplineNormalMarginType: Joi.string().valid('SCRIPT', 'EXCH').required(),
    uplineIntraDayMarginType: Joi.string().valid('SCRIPT', 'EXCH').optional(),
    userMarginType: Joi.string().required().equal(Joi.ref('uplineMarginType')),
    userNormalMarginType: Joi.string().valid('SCRIPT', 'EXCH').required(),
    userIntraDayMarginType: Joi.string().valid('SCRIPT', 'EXCH').optional(),
  })
);

export { scriptQuantityValidation };
