import Joi from 'joi';

export const createUserValidationSchema = Joi.object().keys({
  username: Joi.string().min(5).max(10).alphanum().required(),
  userTypeId: Joi.number().min(1).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  mobileNumber: Joi.string().optional().allow(''),
  password: Joi.string().required(),
  cityId: Joi.number().min(1).required(),
  remarks: Joi.string().optional().allow(''),
  tradeSquareOffLimit: Joi.number().required().min(1),
  validTillDate: Joi.date().optional(),
  isCopyUser: Joi.boolean().required(),
  copyUserId: Joi.number().optional(),
  m2mSquareOff: Joi.boolean().required(),
  m2mSquareOffLimit: Joi.number().min(0).required(),
  shortMarginSquareOff: Joi.boolean().required(),
  tradeAllowedInQty: Joi.boolean().required(),
  isDemoId: Joi.boolean().required(),
  transactionLedger: Joi.object().keys({
    amount: Joi.number().required(),
    remarks: Joi.string().required(),
  }),
  maxLossCap: Joi.number().required(),
  createdOnBehalf: Joi.number().optional().allow(null),
  isIntradayAllowed: Joi.boolean().required(),
  brokerCount: Joi.number().required().allow(null),
  subBrokerCount: Joi.number().required().allow(null),
  clientCount: Joi.number().required().allow(null),

  // marginType: Joi.string().optional(),
  // brokerageType: Joi.string().optional(),
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
          brokerageType: Joi.any().required().valid('lot', 'crore').allow(null),
          brokeragePerLotAmt: Joi.number().required().min(0).max(999999),
          brokeragePerCroreAmt: Joi.number().required().min(0).max(999999),
        })
        .optional(),
      MCX: Joi.object()
        .keys({
          brokerageType: Joi.any().required().valid('lot', 'crore').allow(null),
          brokeragePerLotAmt: Joi.number().required().min(0).max(999999),
          brokeragePerCroreAmt: Joi.number().required().min(0).max(999999),
        })
        .optional(),
      FX: Joi.object()
        .keys({
          brokerageType: Joi.any().required().valid('lot', 'crore').allow(null),
          brokeragePerLotAmt: Joi.number().required().min(0).max(999999),
          brokeragePerCroreAmt: Joi.number().required().min(0).max(999999),
        })
        .optional(),
      Options: Joi.object()
        .keys({
          brokerageType: Joi.any().required().valid('lot', 'crore').allow(null),
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
          marginType: Joi.any().required().valid('lot', 'crore').allow(null),
          marginPerLot: Joi.number().min(0).required(),
          marginPerCrore: Joi.number().min(0).required(),
        })
        .optional(),
      MCX: Joi.object()
        .keys({
          marginType: Joi.any().required().valid('lot', 'crore').allow(null),
          marginPerLot: Joi.number().min(0).required(),
          marginPerCrore: Joi.number().min(0).required(),
        })
        .optional(),
      FX: Joi.object()
        .keys({
          marginType: Joi.any().required().valid('lot', 'crore').allow(null),
          marginPerLot: Joi.number().min(0).required(),
          marginPerCrore: Joi.number().min(0).required(),
        })
        .optional(),
      Options: Joi.object()
        .keys({
          marginType: Joi.any().required().valid('lot', 'crore').allow(null),
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
          marginType: Joi.any().required().valid('lot', 'crore').allow(null),
          marginPerLot: Joi.number().min(0).required(),
          marginPerCrore: Joi.number().min(0).required(),
        })
        .optional(),
      MCX: Joi.object()
        .keys({
          marginType: Joi.any().required().valid('lot', 'crore').allow(null),
          marginPerLot: Joi.number().min(0).required(),
          marginPerCrore: Joi.number().min(0).required(),
        })
        .optional(),
      FX: Joi.object()
        .keys({
          marginType: Joi.any().required().valid('lot', 'crore').allow(null),
          marginPerLot: Joi.number().min(0).required(),
          marginPerCrore: Joi.number().min(0).required(),
        })
        .optional(),
      Options: Joi.object()
        .keys({
          marginType: Joi.any().required().valid('lot', 'crore').allow(null),
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
