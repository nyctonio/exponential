import Joi from 'joi';

export type UpdatePlSharingBodyType = {
  username: string;
  updatedSharing: {
    id: number;
    exchange: string;
    upline: number | null;
    self: number;
    master: number | null;
    broker: number | null;
    subbroker: number | null;
    thirdparty: number | null;
    thirdpartyremarks: string | null;
  }[];
};

export const updatePlSharingSchema = Joi.object({
  username: Joi.string().required(),
  updatedSharing: Joi.array().items(
    Joi.object({
      id: Joi.number().required(),
      exchange: Joi.string().required(),
      upline: Joi.number().allow(null).required(),
      self: Joi.number().required(),
      master: Joi.number().allow(null).required(),
      broker: Joi.number().allow(null).required(),
      subbroker: Joi.number().allow(null).required(),
      thirdparty: Joi.number().allow(null).required(),
      thirdpartyremarks: Joi.string().allow(null).required(),
    })
  ),
});

export type UpdateBrokerageSharingBodyType = {
  username: string;
  updatedSharing: Array<{
    id: number;
    exchange: string;
    brokerageType: string;
    upline: number | null;
    self: number;
    master: number | null;
    broker: number | null;
    subbroker: number | null;
    thirdparty: number | null;
    thirdpartyremarks: string | null;
  }>;
};

export const updateBrokerageSharingSchema = Joi.object({
  username: Joi.string().required(),
  updatedSharing: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      exchange: Joi.string().required(),
      brokerageType: Joi.string().required(),
      upline: Joi.number().allow(null).required(),
      self: Joi.number().required(),
      master: Joi.number().allow(null).required(),
      broker: Joi.number().allow(null).required(),
      subbroker: Joi.number().allow(null).required(),
      thirdparty: Joi.number().allow(null).required(),
      thirdpartyremarks: Joi.string().allow(null).required(),
    })
  ),
});
