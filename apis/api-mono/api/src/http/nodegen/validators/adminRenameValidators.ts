import { Joi } from 'celebrate';

export default {
  adminPermissionGroupRenamePost: {
    body: Joi.object({
      oldName: Joi.string().required(),
      newName: Joi.string().required(),
    }),
  },
};
