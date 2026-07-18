export default {
  // adminCompanyGet
  adminCompanyGet: [
    {
      name: String,
      logo: String,
      roles: [
        { name: String, description: String, permissionGroups: [String] },
      ],
      _id: String,
      domains: [String],
      createdAt: String,
      updatedAt: String,
      createdBy: String,
      featureCodes: [String],
    },
  ],

  // adminCompanyPost
  adminCompanyPost: {
    name: String,
    logo: String,
    roles: [{ name: String, description: String, permissionGroups: [String] }],
    _id: String,
    domains: [String],
    createdAt: String,
    updatedAt: String,
    createdBy: String,
    featureCodes: [String],
  },

  // adminFeatureGet
  adminFeatureGet: [
    {
      code: String,
      name: String,
      description: String,
      isActive: Boolean,
      _id: String,
      createdAt: String,
      updatedAt: String,
      createdBy: String,
    },
  ],

  // adminPermissionGet
  adminPermissionGet: [
    {
      _id: String,
      code: String,
      name: String,
      group: String,
      isCustom: Boolean,
    },
  ],

  // adminPermissionPost
  adminPermissionPost: {
    _id: String,
    code: String,
    name: String,
    group: String,
    isCustom: Boolean,
  },

  // adminUserFilterOptionsGet
  adminUserFilterOptionsGet: { domains: [String], roles: [String] },

  // adminUsersGet
  adminUsersGet: {
    meta: { totalResultCount: Number, offset: Number, limit: Number },
    data: [
      {
        email: String,
        firstName: String,
        lastName: String,
        displayName: String,
        avatar: String,
        _id: String,
        externalId: String,
        createdAt: String,
        updatedAt: String,
        createdBy: String,
        previousEmails: [String],
        roles: [String],
      },
    ],
  },
};
