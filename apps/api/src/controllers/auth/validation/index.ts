import Joi from 'joi';

export const userLoginSchema = Joi.object({
  username: Joi.string().required().min(5).max(10),
  password: Joi.string().required(),
  fcmToken: Joi.string().optional(),
});

export const resetPasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
});
