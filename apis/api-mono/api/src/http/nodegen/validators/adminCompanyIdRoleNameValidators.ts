import { Joi } from 'celebrate';

export default {
  adminCompanyCompanyIdRoleRoleNameResetPost: {
    params: Joi.object({
      companyId: Joi.string().required(),
      roleName: Joi.string().required(),
    }),
  },
};
