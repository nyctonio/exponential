import Joi from 'joi';

export type UpdateBrokerageInstrument = {
  name: string;
  brokerage: {
    brokeragePerCroreAmt: null | number;
    brokeragePerLotAmt: null | number;
    brokerageType: null | 'lot' | 'crore';
  };
};

export type UpdateBrokerage = {
  userId: number;
  instruments: UpdateBrokerageInstrument[];
};

export const updateBrokerageSchema = Joi.object({
  userId: Joi.number().required(),
  instruments: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        brokerage: Joi.object({
          brokeragePerCroreAmt: Joi.number().required(),
          brokeragePerLotAmt: Joi.number().required(),
          brokerageType: Joi.string()
            .allow(null)
            .valid('lot', 'crore')
            .required(),
        }).required(),
      })
    )
    .required(),
});
