import Joi from 'joi';

const updateUserClientDetailsValidations = Joi.object({
  userId: Joi.number().required(),
  username: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().optional(),
  city: Joi.number().required(),
  email: Joi.string()
    .email({
      tlds: { allow: false },
    })
    .required(),
  remarks: Joi.string().optional(),
  mobile: Joi.string().length(10).required(),
  validTillDate: Joi.string().required(),
});

export { updateUserClientDetailsValidations };
