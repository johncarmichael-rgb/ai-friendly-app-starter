import { Joi } from 'celebrate';

export default {
  adminCompanyCompanyIdCompanyMemberGet: {
    params: Joi.object({ companyId: Joi.string().required() }),
    query: Joi.object({
      offset: Joi.number().integer().min(0),
      limit: Joi.number().integer().default(25).min(0).max(100),
      search: Joi.string().allow(''),
    }),
  },

  adminCompanyCompanyIdCompanyMemberPost: {
    body: Joi.object({
      companyId: Joi.string().required(),
      userId: Joi.string().required(),
      role: Joi.string().required(),
    }),
    params: Joi.object({ companyId: Joi.string().required() }),
  },

  adminCompanyCompanyIdFeatureCodesGet: {
    params: Joi.object({ companyId: Joi.string().required() }),
  },

  adminCompanyCompanyIdFeatureCodesPut: {
    body: Joi.object({
      featureCodes: Joi.array()
        .items(Joi.string().allow('').allow(null))
        .required(),
    }),
    params: Joi.object({ companyId: Joi.string().required() }),
  },

  adminCompanyCompanyIdGet: {
    params: Joi.object({ companyId: Joi.string().required() }),
  },

  adminCompanyCompanyIdPut: {
    body: Joi.object({
      name: Joi.string().required(),
      logo: Joi.string().allow('').allow(null),
      roles: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          description: Joi.string().allow('').allow(null),
          permissionGroups: Joi.array().items(
            Joi.string().allow('').allow(null)
          ),
        }).allow(null)
      ),
      domains: Joi.array().items(Joi.string().allow('').allow(null)),
    }),
    params: Joi.object({ companyId: Joi.string().required() }),
  },
};
