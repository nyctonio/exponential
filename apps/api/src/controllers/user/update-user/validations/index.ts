import Joi from 'joi';

export const updateUserBasicDetails = Joi.object().keys({
  userId: Joi.number().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  mobileNumber: Joi.string().required(),
  city: Joi.number().required(),
  tradeSquareOffLimit: Joi.number().required(),
  validTillDate: Joi.string().required().allow(null),
});

type ExchangeSettings = {
  exchangeAllowed: boolean;
  exchangeMaxLotSize: number;
  scriptMaxLotSize: number;
  tradeMaxLotSize: number;
  brokerageType: string | null;
  brokeragePerCroreAmt: number;
  brokeragePerLotAmt: number;
  plShare: number;
  marginType: string;
  marginPerCrore: number;
  marginPerLot: number;
  intraday?: {
    marginPerCrore: number;
    marginPerLot: number;
  };
};

export type ExchangeSettingsBody = {
  userId: number;
  tradeAllowedInQuantityNSE: boolean;
  shortMarginSquareOff: boolean;
  maximumLossPercentageCap: number;
  m2mSquareOff: boolean;
  m2mSquareOffLimit: number;
  isIntradayAllowed: boolean;
  NSE?: ExchangeSettings;
  MCX?: ExchangeSettings;
  FX?: ExchangeSettings;
  Options?: ExchangeSettings;
};

const commonKeys = {
  exchangeAllowed: Joi.boolean().required(),
  exchangeMaxLotSize: Joi.number().required(),
  scriptMaxLotSize: Joi.number().required(),
  tradeMaxLotSize: Joi.number().required(),
  brokerageType: Joi.string().valid('crore', 'lot').required().allow(null),
  brokeragePerCroreAmt: Joi.number().required(),
  brokeragePerLotAmt: Joi.number().required(),
  plShare: Joi.number().required(),
  marginType: Joi.string().valid('crore', 'lot').required().allow(null),
  marginPerCrore: Joi.number().required(),
  marginPerLot: Joi.number().required(),
};

export const exchangeSettingsBody = Joi.object().keys({
  userId: Joi.number().required(),
  tradeAllowedInQuantityNSE: Joi.boolean().required(),
  shortMarginSquareOff: Joi.boolean().required(),
  maximumLossPercentageCap: Joi.number().required(),
  m2mSquareOff: Joi.boolean().required(),
  m2mSquareOffLimit: Joi.number().required(),
  isIntradayAllowed: Joi.boolean().required().label('isIntradayAllowed'),
  NSE: Joi.object()
    .keys({
      ...commonKeys,
      intraday: Joi.when(Joi.ref('/isIntradayAllowed'), {
        is: true,
        then: Joi.object()
          .keys({
            marginPerCrore: Joi.number().required(),
            marginPerLot: Joi.number().required(),
          })
          .required(),
        otherwise: Joi.object().forbidden(),
      }),
    })
    .optional(),
  MCX: Joi.object()
    .keys({
      ...commonKeys,
      intraday: Joi.when(Joi.ref('/isIntradayAllowed'), {
        is: true,
        then: Joi.object()
          .keys({
            marginPerCrore: Joi.number().required(),
            marginPerLot: Joi.number().required(),
          })
          .required(),
        otherwise: Joi.object().forbidden(),
      }),
    })
    .optional(),
  FX: Joi.object()
    .keys({
      ...commonKeys,
      intraday: Joi.when(Joi.ref('/isIntradayAllowed'), {
        is: true,
        then: Joi.object()
          .keys({
            marginPerCrore: Joi.number().required(),
            marginPerLot: Joi.number().required(),
          })
          .required(),
        otherwise: Joi.object().forbidden(),
      }),
    })
    .optional(),
  Options: Joi.object()
    .keys({
      ...commonKeys,
      intraday: Joi.when(Joi.ref('/isIntradayAllowed'), {
        is: true,
        then: Joi.object()
          .keys({
            marginPerCrore: Joi.number().required(),
            marginPerLot: Joi.number().required(),
          })
          .required(),
        otherwise: Joi.object().forbidden(),
      }),
    })
    .optional(),
});

export const smSquareOffBody = Joi.object().keys({
  userId: Joi.number().required(),
  smSquareOff: Joi.bool().required(),
});

export const onlySquareOffBody = Joi.object().keys({
  userId: Joi.number().required(),
  onlySquareOff: Joi.bool().required(),
});

export const m2mSquareOffBody = Joi.object().keys({
  userId: Joi.number().required(),
  m2mSquareOff: Joi.bool().required(),
});
