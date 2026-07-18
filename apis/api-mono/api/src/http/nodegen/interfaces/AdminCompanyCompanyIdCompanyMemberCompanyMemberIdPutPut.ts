export interface AdminCompanyCompanyIdCompanyMemberCompanyMemberIdPutPut {
  /**
   * First name of the user
   */
  firstName?: string;
  /**
   * Last name of the user
   */
  lastName?: string;
  role?: string;
  status?: Status;
}

export enum Status {
  Active = 'active',
  Inactive = 'inactive',
}
