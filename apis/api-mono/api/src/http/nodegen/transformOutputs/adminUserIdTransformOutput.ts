export default {
  // adminUsersUserIdGet
  adminUsersUserIdGet: {
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

  // adminUsersUserIdRolesPut
  adminUsersUserIdRolesPut: {
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

  // adminUsersUserIdSessionsDelete
  adminUsersUserIdSessionsDelete: { success: Boolean },

  // adminUsersUserIdSessionsGet
  adminUsersUserIdSessionsGet: [
    {
      _id: String,
      sessionId: String,
      userId: String,
      userRoles: [String],
      expiresAt: String,
      ipAddress: String,
      userAgent: String,
      lastAccessedAt: String,
      createdAt: String,
      updatedAt: String,
    },
  ],
};
