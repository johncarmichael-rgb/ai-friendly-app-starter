import { Joi } from 'celebrate';

export default {
  adminCompanyCompanyIdCompanyMemberCompanyMemberIdDelete: {
    params: Joi.object({
      companyId: Joi.string().required(),
      companyMemberId: Joi.string().required(),
    }),
  },

  adminCompanyCompanyIdCompanyMemberCompanyMemberIdGet: {
    params: Joi.object({
      companyId: Joi.string().required(),
      companyMemberId: Joi.string().required(),
    }),
  },

  adminCompanyCompanyIdCompanyMemberCompanyMemberIdPut: {
    body: Joi.object({
      role: Joi.string().allow('').allow(null),
      status: Joi.string().allow('').valid('active', 'inactive').allow(null),
      firstName: Joi.string().allow('').allow(null),
      lastName: Joi.string().allow('').allow(null),
    }),
    params: Joi.object({
      companyId: Joi.string().required(),
      companyMemberId: Joi.string().required(),
    }),
  },
};
