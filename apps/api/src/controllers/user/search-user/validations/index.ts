import Joi from 'joi';

export const searchUserSchema = Joi.object({
  username: Joi.string().required().allow(''),
  userType: Joi.string()
    .allow('all')
    .allow('Broker')
    .allow('Sub-Broker')
    .allow('Client')
    .required(),
  upline: {
    broker: Joi.array().items(Joi.number()),
    subBroker: Joi.array().items(Joi.number()),
  },
  pageSize: Joi.number().required(),
  pageNumber: Joi.number().required(),
  sort: Joi.object()
    .keys({
      username: Joi.string()
        .allow('ASC')
        .allow('DESC')
        .allow('NONE')
        .optional(),
      userType: Joi.string()
        .allow('ASC')
        .allow('DESC')
        .allow('NONE')
        .optional(),
      upline: Joi.string().allow('ASC').allow('DESC').allow('NONE').optional(),
      name: Joi.string().allow('ASC').allow('DESC').allow('NONE').optional(),
      tradeAutoCut: Joi.string()
        .allow('ASC')
        .allow('DESC')
        .allow('NONE')
        .optional(),
      onlySquareOff: Joi.string()
        .allow('ASC')
        .allow('DESC')
        .allow('NONE')
        .optional(),
      createdDate: Joi.string()
        .allow('ASC')
        .allow('DESC')
        .allow('NONE')
        .optional(),
      lastLogin: Joi.string()
        .allow('ASC')
        .allow('DESC')
        .allow('NONE')
        .optional(),
    })
    .required(),
});

export const searchUserTransactionSchema = Joi.object().keys({
  userId: Joi.number().required(),
  amount: Joi.number().required(),
  remarks: Joi.string().required(),
  type: Joi.string().allow('Deposit').allow('Withdrawal').required(),
  password: Joi.string().required(),
});

export const getLoginHistorySchema = Joi.object().keys({
  userId: Joi.number().required(),
  pageNumber: Joi.number().required(),
});
