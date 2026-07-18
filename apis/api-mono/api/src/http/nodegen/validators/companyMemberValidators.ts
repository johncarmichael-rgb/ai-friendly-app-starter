import { Joi } from 'celebrate';

export default {
  companyMemberCompanyIdGet: {
    params: Joi.object({ companyId: Joi.string().required() }),
    query: Joi.object({
      offset: Joi.number().integer().min(0),
      limit: Joi.number().integer().default(25).min(0).max(100),
      search: Joi.string().allow(''),
      role: Joi.string().allow(''),
      status: Joi.string().allow('').valid('active', 'inactive'),
      isExternal: Joi.boolean(),
      userId: Joi.string().allow(''),
    }),
  },

  companyMemberCompanyIdPost: {
    body: Joi.object({
      companyId: Joi.string().required(),
      userId: Joi.string().required(),
      role: Joi.string().required(),
    }),
    params: Joi.object({ companyId: Joi.string().required() }),
  },
};
