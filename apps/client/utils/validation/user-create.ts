import Joi, { ref } from 'joi';

const validation = Joi.object({
  // username should be between 5 and 10 characters and alphanumeric
  id: Joi.number().optional(),
  userName: Joi.string().min(5).max(10).alphanum().required(),
  userType: Joi.string().required().not('-1', null).messages({
    'any.required': 'Select a valid user type',
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional()
    .allow(''),
  firstName: Joi.string().required(),
  lastName: Joi.string().optional().allow(''),
  mobile: Joi.string().length(10).optional().allow(''),
  password: Joi.string().min(5).required(),
  retypePassword: Joi.string()
    .min(5)
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Password does not match',
    })
    .required(),
  city: Joi.string().optional().not('-1'),
  remarks: Joi.string().optional().allow(''),
  tradeSquareOffLimit: Joi.number().optional().not('-1'),
  validTill: Joi.string().optional().allow(''),
  demoId: Joi.boolean().required(),
  creditBalance: Joi.number().required(),
  creditRemarks: Joi.string().required(),
  tradeAllowedInQuantityNSE: Joi.boolean().optional(),
  exchangeAllowedNSE: Joi.boolean().required(),
  exchangeAllowedMCX: Joi.boolean().required(),
  exchangeAllowedFX: Joi.boolean().required(),
  exchangeAllowedOptions: Joi.boolean().required(),
  maxExchangeNSE: Joi.number(),
  maxExchangeMCX: Joi.number(),
  maxExchangeFX: Joi.number(),
  maxExchangeOptions: Joi.number(),
  tradeAutoCut: Joi.boolean().required(),
  brokerageNSE: Joi.number().required(),
  brokerageMCX: Joi.number().required(),
  brokerageFX: Joi.number().required(),
  brokerageOptions: Joi.number().required(),
  normalMarginNSE: Joi.number().required(),
  normalMarginMCX: Joi.number().required(),
  normalMarginFX: Joi.number().required(),
  normalMarginOptions: Joi.number().required(),
  intradayTrade: Joi.boolean(),
  intradayMarginNSE: Joi.number(),
  intradayMarginMCX: Joi.number(),
  intradayMarginFX: Joi.number(),
  intradayMarginOptions: Joi.number(),
  maxQtyScriptNSE: Joi.number(),
  maxQtyScriptMCX: Joi.number(),
  maxQtyScriptFX: Joi.number(),
  maxQtyScriptOptions: Joi.number(),
  ispasswordEditable: Joi.boolean(),
  isEditable: Joi.boolean(),
  isClientEditable: Joi.boolean(),
  isCreditEditable: Joi.boolean(),
  isExchangeEditable: Joi.boolean(),
  isTradeAutoCutEditable: Joi.boolean(),
  isTradeEditable: Joi.boolean(),
  isUpdateable: Joi.boolean(),
  isBrokerageEditable: Joi.boolean(),
  isNormalMarginEditable: Joi.boolean(),
  isIntraDayEditable: Joi.boolean(),
});

const exchangeData = Joi.object({
  userId: Joi.number().required(),
  tradeAllowedinQty: Joi.boolean().required(),
  exchangeSettings: Joi.array().items({
    exchangeId: Joi.number().required(),
    isExchangeActive: Joi.boolean().required(),
    exchangeMaxLotSize: Joi.number().required(),
    scriptMaxQty: Joi.number().required(),
  }),
});

const brokerageData = Joi.object({
  userId: Joi.number().required(),
  brokerageSettings: Joi.array().items({
    exchangeId: Joi.number().required(),
    marginValue: Joi.number().required(),
  }),
});

const intraBrokerageData = Joi.object({
  userId: Joi.number().required(),
  intraydaytrademarginsettings: Joi.array().items({
    exchangeId: Joi.number().required(),
    marginValue: Joi.number().required(),
  }),
});

const tradeMarginData = Joi.object({
  userId: Joi.number().required(),
  tradeMarginSettings: Joi.array().items({
    exchangeId: Joi.number().required(),
    marginValue: Joi.number().required(),
  }),
});

const userBasicDetailsValidation = Joi.object({
  userId: Joi.number().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  cityId: Joi.number().required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .messages({
      'string.email': 'Email should be valid',
    }),
  mobileNumber: Joi.string()
    .length(10)
    .required()
    .messages({
      'string.length': 'Mobile number should be 10 digits',
    })
    .required(),
  validTillDate: Joi.string().required(),
  remarks: Joi.string().required(),
});

const userTradeAutoCutValidation = Joi.object({
  userId: Joi.number().required(),
  tradeAutoCut: Joi.boolean().required(),
});

const userCreateDebounceValidation = Joi.object({
  id: Joi.number().optional(),
  userName: Joi.string().min(5).max(10).alphanum().required().label('userName'),
  userType: Joi.number()
    .required()
    .not(-1, null)
    .messages({
      'any.required': 'Select a valid user type',
    })
    .label('userType'),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional()
    .allow('')
    .label('email'),
  firstName: Joi.string().required().label('firstName'),
  lastName: Joi.string().optional().allow('').label('lastName'),
  mobile: Joi.string().length(10).optional().allow('').label('mobile'),
  password: Joi.string().min(5).required().label('password'),
  retypePassword: Joi.string()
    .min(5)
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Password does not match',
    })
    .required()
    .label('retypePassword'),
  city: Joi.number().not(-1, null).required().label('city'),
  remarks: Joi.string().optional().allow('').label('remarks').max(25),
  tradeSquareOffLimit: Joi.number()
    .optional()
    .not(-1, null)
    .label('tradeSquareOffLimit'),
  validTill: Joi.string().optional().allow('').label('validTill'),
  demoId: Joi.boolean().required().label('demoId'),
  onlySquareOff: Joi.boolean().required().label('onlySquareOff'),
  creditBalance: Joi.number().required().not(0).label('creditBalance'),
  creditRemarks: Joi.string().required().label('creditRemarks').max(25),
  tradeAllowedInQuantityNSE: Joi.boolean()
    .required()
    .label('tradeAllowedInQuantityNSE'),
  exchangeAllowedNSE: Joi.boolean().required().label('exchangeAllowedNSE'),
  exchangeAllowedMCX: Joi.boolean().required().label('exchangeAllowedMCX'),
  exchangeAllowedFX: Joi.boolean().required().label('exchangeAllowedFX'),
  exchangeAllowedOptions: Joi.boolean()
    .required()
    .label('exchangeAllowedOptions'),
  // maxExchnage is required if exchangeAllowed is true
  maxExchangeNSE: Joi.number()
    .when('exchangeAllowedNSE', {
      is: true,
      then: Joi.number().required(),
      otherwise: Joi.number().optional(),
    })
    .label('maxExchangeNSE'),
  maxExchangeMCX: Joi.number()
    .when('exchangeAllowedMCX', {
      is: true,
      then: Joi.number().required(),
      otherwise: Joi.number().optional(),
    })
    .label('maxExchangeMCX'),
  maxExchangeFX: Joi.number()
    .when('exchangeAllowedFX', {
      is: true,
      then: Joi.number().required(),
      otherwise: Joi.number().optional(),
    })
    .label('maxExchangeFX'),
  maxExchangeOptions: Joi.number()
    .when('exchangeAllowedOptions', {
      is: true,
      then: Joi.number().required(),
      otherwise: Joi.number().optional(),
    })
    .label('maxExchangeOptions'),
  maxQtyScriptNSE: Joi.number()
    .when('exchangeAllowedNSE', {
      is: true,
      then: Joi.number().required(),
      otherwise: Joi.number().optional(),
    })
    .label('maxQtyScriptNSE'),
  maxQtyScriptMCX: Joi.number()
    .when('exchangeAllowedMCX', {
      is: true,
      then: Joi.number().required(),
      otherwise: Joi.number().optional(),
    })
    .label('maxQtyScriptMCX'),
  maxQtyScriptFX: Joi.number()
    .when('exchangeAllowedFX', {
      is: true,
      then: Joi.number().required(),
      otherwise: Joi.number().optional(),
    })
    .label('maxQtyScriptFX'),
  maxQtyScriptOptions: Joi.number()
    .when('exchangeAllowedOptions', {
      is: true,
      then: Joi.number().required(),
      otherwise: Joi.number().optional(),
    })
    .label('maxQtyScriptOptions'),
  tradeAutoCut: Joi.boolean().required().label('tradeAutoCut'),
  brokerageNSE: Joi.number()
    .when('exchangeAllowedNSE', {
      is: true,
      then: Joi.number().required(),
      otherwise: Joi.number().optional(),
    })
    .label('brokerageNSE'),
  brokerageMCX: Joi.number()
    .when('exchangeAllowedMCX', {
      is: true,
      then: Joi.number().required(),
      otherwise: Joi.number().optional(),
    })
    .label('brokerageMCX'),
  brokerageFX: Joi.number()
    .when('exchangeAllowedFX', {
      is: true,
      then: Joi.number().required(),
      otherwise: Joi.number().optional(),
    })
    .label('brokerageFX'),
  brokerageOptions: Joi.number()
    .when('exchangeAllowedOptions', {
      is: true,
      then: Joi.number().required(),
      otherwise: Joi.number().optional(),
    })
    .label('brokerageOptions'),
  normalMarginNSE: Joi.number()
    .when('exchangeAllowedNSE', {
      is: true,
      then: Joi.number().required(),
      otherwise: Joi.number().optional(),
    })
    .max(100)
    .label('normalMarginNSE'),
  normalMarginMCX: Joi.number()
    .when('exchangeAllowedMCX', {
      is: true,
      then: Joi.number().required(),
      otherwise: Joi.number().optional(),
    })
    .label('normalMarginMCX'),
  normalMarginFX: Joi.number()
    .when('exchangeAllowedFX', {
      is: true,
      then: Joi.number().required(),
      otherwise: Joi.number().optional(),
    })
    .label('normalMarginFX'),
  normalMarginOptions: Joi.number()
    .when('exchangeAllowedOptions', {
      is: true,
      then: Joi.number().required(),
      otherwise: Joi.number().optional(),
    })
    .label('normalMarginOptions'),
  intradayTrade: Joi.boolean().required().label('intradayTrade'),
  intradayMarginNSE: Joi.number()
    .when('intradayTrade', {
      is: true,
      then: Joi.number().when('exchangeAllowedNSE', {
        is: true,
        then: Joi.number().required(),
        otherwise: Joi.number().optional(),
      }),
      otherwise: Joi.number().optional(),
    })
    .max(ref('normalMarginNSE'))
    .label('intradayMarginNSE'),
  intradayMarginMCX: Joi.number()
    .when('intradayTrade', {
      is: true,
      then: Joi.number().when('exchangeAllowedMCX', {
        is: true,
        then: Joi.number().required(),
        otherwise: Joi.number().optional(),
      }),
      otherwise: Joi.number().optional(),
    })
    .max(ref('normalMarginMCX'))
    .label('intradayMarginMCX'),
  intradayMarginFX: Joi.number()
    .when('intradayTrade', {
      is: true,
      then: Joi.number().when('exchangeAllowedFX', {
        is: true,
        then: Joi.number().required(),
        otherwise: Joi.number().optional(),
      }),
      otherwise: Joi.number().optional(),
    })
    .max(ref('normalMarginFX'))
    .label('intradayMarginFX'),
  intradayMarginOptions: Joi.number()
    .when('intradayTrade', {
      is: true,
      then: Joi.number().when('exchangeAllowedOptions', {
        is: true,
        then: Joi.number().required(),
        otherwise: Joi.number().optional(),
      }),
      otherwise: Joi.number().optional(),
    })
    .max(ref('normalMarginOptions'))
    .label('intradayMarginOptions'),
});

const createUserApiBodyValidation = Joi.object().keys({
  username: Joi.string().min(5).max(10).alphanum().required(),
  userTypeId: Joi.number().min(1).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().optional().allow(''),
  email: Joi.string()
    .email({
      tlds: {
        allow: false,
      },
    })
    .optional()
    .allow(''),
  mobileNumber: Joi.string().optional().allow(''),
  password: Joi.string().required(),
  cityId: Joi.number().min(1).required(),
  remarks: Joi.string().optional().allow(''),
  brokerCount: Joi.number().required().allow(null),
  subBrokerCount: Joi.number().required().allow(null),
  clientCount: Joi.number().required().allow(null),
  tradeSquareOffLimit: Joi.number().required().min(1),
  validTillDate: Joi.date().optional(),
  isCopyUser: Joi.boolean().required(),
  copyUserId: Joi.number().optional(),
  m2mSquareOff: Joi.boolean().required(),
  m2mSquareOffLimit: Joi.number().min(0).required(),
  shortMarginSquareOff: Joi.boolean().required(),
  maxLossCap: Joi.number().required(),
  tradeAllowedInQty: Joi.boolean().required(),
  isDemoId: Joi.boolean().required(),
  transactionLedger: Joi.object().keys({
    amount: Joi.number().required(),
    remarks: Joi.string().required(),
  }),
  createdOnBehalf: Joi.number().optional().allow(null),
  isIntradayAllowed: Joi.boolean().required(),
  marginType: Joi.string().optional(),
  brokerageType: Joi.string().optional(),
  exchangeSettings: Joi.object()
    .keys({
      NSE: Joi.object()
        .keys({
          exchangeMaxLotSize: Joi.number().required(),
          scriptMaxLotSize: Joi.number().required(),
          tradeMaxLotSize: Joi.number().required(),
        })
        .optional(),
      MCX: Joi.object()
        .keys({
          exchangeMaxLotSize: Joi.number().required(),
          scriptMaxLotSize: Joi.number().required(),
          tradeMaxLotSize: Joi.number().required(),
        })
        .optional(),
      FX: Joi.object()
        .keys({
          exchangeMaxLotSize: Joi.number().required(),
          scriptMaxLotSize: Joi.number().required(),
          tradeMaxLotSize: Joi.number().required(),
        })
        .optional(),
      Options: Joi.object()
        .keys({
          exchangeMaxLotSize: Joi.number().required(),
          scriptMaxLotSize: Joi.number().required(),
          tradeMaxLotSize: Joi.number().required(),
        })
        .optional(),
    })
    .required(),
  brokerageSettings: Joi.object()
    .keys({
      NSE: Joi.object()
        .keys({
          brokerageType: Joi.any().required().allow('lot', 'crore', null),
          brokeragePerLotAmt: Joi.number().required().min(0).max(999999),
          brokeragePerCroreAmt: Joi.number().required().min(0).max(999999),
        })
        .optional(),
      MCX: Joi.object()
        .keys({
          brokerageType: Joi.any().required().allow('lot', 'crore', null),
          brokeragePerLotAmt: Joi.number().required().min(0).max(999999),
          brokeragePerCroreAmt: Joi.number().required().min(0).max(999999),
        })
        .optional(),
      FX: Joi.object()
        .keys({
          brokerageType: Joi.any().required().allow('lot', 'crore', null),
          brokeragePerLotAmt: Joi.number().required().min(0).max(999999),
          brokeragePerCroreAmt: Joi.number().required().min(0).max(999999),
        })
        .optional(),
      Options: Joi.object()
        .keys({
          brokerageType: Joi.any().required().allow('lot', 'crore', null),
          brokeragePerLotAmt: Joi.number().required().min(0).max(999999),
          brokeragePerCroreAmt: Joi.number().required().min(0).max(999999),
        })
        .optional(),
    })
    .optional(),
  tradeMarginSettings: Joi.object()
    .keys({
      NSE: Joi.object()
        .keys({
          marginType: Joi.any().required().allow('lot', 'crore', null),
          marginPerLot: Joi.number().min(0).required(),
          marginPerCrore: Joi.number().min(0).required(),
        })
        .optional(),
      MCX: Joi.object()
        .keys({
          marginType: Joi.any().required().allow('lot', 'crore', null),
          marginPerLot: Joi.number().min(0).required(),
          marginPerCrore: Joi.number().min(0).required(),
        })
        .optional(),
      FX: Joi.object()
        .keys({
          marginType: Joi.any().required().allow('lot', 'crore', null),
          marginPerLot: Joi.number().min(0).required(),
          marginPerCrore: Joi.number().min(0).required(),
        })
        .optional(),
      Options: Joi.object()
        .keys({
          marginType: Joi.any().required().allow('lot', 'crore', null),
          marginPerLot: Joi.number().min(0).required(),
          marginPerCrore: Joi.number().min(0).required(),
        })
        .optional(),
    })
    .optional(),
  intradayTradeMarginSettings: Joi.object()
    .keys({
      NSE: Joi.object()
        .keys({
          marginType: Joi.any().required().allow('lot', 'crore', null),
          marginPerLot: Joi.number().min(0).required(),
          marginPerCrore: Joi.number().min(0).required(),
        })
        .optional(),
      MCX: Joi.object()
        .keys({
          marginType: Joi.any().required().allow('lot', 'crore', null),
          marginPerLot: Joi.number().min(0).required(),
          marginPerCrore: Joi.number().min(0).required(),
        })
        .optional(),
      FX: Joi.object()
        .keys({
          marginType: Joi.any().required().allow('lot', 'crore', null),
          marginPerLot: Joi.number().min(0).required(),
          marginPerCrore: Joi.number().min(0).required(),
        })
        .optional(),
      Options: Joi.object()
        .keys({
          marginType: Joi.any().required().allow('lot', 'crore', null),
          marginPerLot: Joi.number().min(0).required(),
          marginPerCrore: Joi.number().min(0).required(),
        })
        .optional(),
    })
    .optional(),
  plShare: Joi.object()
    .keys({
      NSE: Joi.number().max(100).min(0).optional(),
      MCX: Joi.number().max(100).min(0).optional(),
      FX: Joi.number().max(100).min(0).optional(),
      Options: Joi.number().max(100).min(0).optional(),
    })
    .required(),
});

export {
  validation,
  exchangeData,
  brokerageData,
  intraBrokerageData,
  tradeMarginData,
  userBasicDetailsValidation,
  userTradeAutoCutValidation,
  userCreateDebounceValidation,
  createUserApiBodyValidation,
};
