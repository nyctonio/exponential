import Joi from 'joi';

const UserPenaltyValidations = Joi.object().keys({
  userId: Joi.number().required(),
  penaltyType: Joi.number().required(),
  penalty: Joi.number().required(),
  cutBrokerage: Joi.boolean().required(),
  hours: Joi.number().required(),
});

export { UserPenaltyValidations };
