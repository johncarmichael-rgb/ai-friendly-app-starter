export default {
  // adminCompanyCompanyIdCompanyMemberGet
  adminCompanyCompanyIdCompanyMemberGet: {
    meta: { totalResultCount: Number, offset: Number, limit: Number },
    data: [
      {
        companyMember: {
          companyId: String,
          userId: String,
          role: String,
          _id: String,
          invitedBy: String,
          invitedAt: String,
          joinedAt: String,
          status: String,
          createdAt: String,
          updatedAt: String,
          isExternal: Boolean,
        },
        user: {
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
      },
    ],
  },

  // adminCompanyCompanyIdCompanyMemberPost
  adminCompanyCompanyIdCompanyMemberPost: {
    companyId: String,
    userId: String,
    role: String,
    _id: String,
    invitedBy: String,
    invitedAt: String,
    joinedAt: String,
    status: String,
    createdAt: String,
    updatedAt: String,
    isExternal: Boolean,
  },

  // adminCompanyCompanyIdFeatureCodesGet
  adminCompanyCompanyIdFeatureCodesGet: { featureCodes: [String] },

  // adminCompanyCompanyIdFeatureCodesPut
  adminCompanyCompanyIdFeatureCodesPut: { featureCodes: [String] },

  // adminCompanyCompanyIdGet
  adminCompanyCompanyIdGet: {
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

  // adminCompanyCompanyIdPut
  adminCompanyCompanyIdPut: {
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
};
