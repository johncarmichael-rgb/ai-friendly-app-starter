export interface CompanyMember {
  _id: string;
  /**
   * Company this member belongs to
   */
  companyId: string;
  createdAt: Date;
  invitedAt: Date;
  /**
   * User ID who invited this member
   */
  invitedBy: string;
  /**
   * Whether this member was provisioned with an external (non-company-domain) email address
   */
  isExternal?: boolean;
  joinedAt?: Date;
  /**
   * Role of the member in the company
   */
  role: string;
  status: Status;
  updatedAt: Date;
  /**
   * User ID of the member
   */
  userId: string;
}

export enum Status {
  Active = 'active',
  Inactive = 'inactive',
}
