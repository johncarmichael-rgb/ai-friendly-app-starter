import { Joi } from 'celebrate';

export default {
  adminPermissionPermissionIdDelete: {
    params: Joi.object({ permissionId: Joi.string().required() }),
  },

  adminPermissionPermissionIdGet: {
    params: Joi.object({ permissionId: Joi.string().required() }),
  },

  adminPermissionPermissionIdPatch: {
    body: Joi.object({
      name: Joi.string().allow('').allow(null),
      group: Joi.string().allow('').allow(null),
    }),
    params: Joi.object({ permissionId: Joi.string().required() }),
  },
};
