export default {
  // companyMemberCompanyIdGet
  companyMemberCompanyIdGet: {
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

  // companyMemberCompanyIdPost
  companyMemberCompanyIdPost: {
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
};
