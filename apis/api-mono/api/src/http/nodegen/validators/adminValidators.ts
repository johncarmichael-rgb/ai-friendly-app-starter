import { Joi } from 'celebrate';

export default {
  adminCompanyGet: {
    query: Joi.object({
      offset: Joi.number().integer().min(0),
      limit: Joi.number().integer().default(25).min(0).max(100),
      search: Joi.string().allow(''),
    }),
  },

  adminCompanyPost: {
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
      domains: Joi.array().items(Joi.string().allow('').allow(null)).required(),
    }),
  },

  adminFeatureGet: {
    query: Joi.object({
      offset: Joi.number().integer().min(0),
      limit: Joi.number().integer().default(25).min(0).max(100),
      search: Joi.string().allow(''),
    }),
  },

  adminPermissionGet: {
    query: Joi.object({
      offset: Joi.number().integer().min(0),
      limit: Joi.number().integer().default(25).min(0).max(1000),
      search: Joi.string().allow(''),
    }),
  },

  adminPermissionPost: {
    body: Joi.object({
      code: Joi.string().required(),
      name: Joi.string().required(),
      group: Joi.string().allow('').allow(null),
    }),
  },

  adminUserFilterOptionsGet: {},

  adminUsersGet: {
    query: Joi.object({
      offset: Joi.number().integer().min(0),
      limit: Joi.number().integer().default(25).min(0).max(100),
      search: Joi.string().allow(''),
      companyId: Joi.string().allow(''),
      domain: Joi.string().allow(''),
      role: Joi.string().allow(''),
    }),
  },
};
