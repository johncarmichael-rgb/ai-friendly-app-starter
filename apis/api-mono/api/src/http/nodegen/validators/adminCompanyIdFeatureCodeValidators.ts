import { Joi } from 'celebrate';

export default {
  adminCompanyCompanyIdFeatureCodesFeatureCodeDelete: {
    params: Joi.object({
      companyId: Joi.string().required(),
      featureCode: Joi.string().required(),
    }),
  },

  adminCompanyCompanyIdFeatureCodesFeatureCodePost: {
    params: Joi.object({
      companyId: Joi.string().required(),
      featureCode: Joi.string().required(),
    }),
  },
};
