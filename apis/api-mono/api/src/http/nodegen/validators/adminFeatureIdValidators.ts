import { Joi } from 'celebrate';

export default {
  adminFeatureFeatureIdDelete: {
    params: Joi.object({ featureId: Joi.string().required() }),
  },

  adminFeatureFeatureIdGet: {
    params: Joi.object({ featureId: Joi.string().required() }),
  },

  adminFeatureFeatureIdPatch: {
    body: Joi.object({
      name: Joi.string().allow('').allow(null),
      description: Joi.string().allow('').allow(null),
      isActive: Joi.boolean().allow(null),
    }),
    params: Joi.object({ featureId: Joi.string().required() }),
  },
};
