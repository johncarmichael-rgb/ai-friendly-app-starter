export default {
  // adminPermissionPermissionIdDelete
  adminPermissionPermissionIdDelete: { success: Boolean },

  // adminPermissionPermissionIdGet
  adminPermissionPermissionIdGet: {
    _id: String,
    code: String,
    name: String,
    group: String,
    isCustom: Boolean,
  },

  // adminPermissionPermissionIdPatch
  adminPermissionPermissionIdPatch: {
    _id: String,
    code: String,
    name: String,
    group: String,
    isCustom: Boolean,
  },
};
