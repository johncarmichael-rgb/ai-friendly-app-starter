export default {
  // userCurrentGet
  userCurrentGet: {
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
    companyMemberships: [
      {
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
    ],
  },

  // userCurrentPut
  userCurrentPut: {
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
};
