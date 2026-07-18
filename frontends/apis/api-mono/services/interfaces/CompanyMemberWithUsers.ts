export interface CompanyMemberWithUsers {
  data: Datum[];
  meta: Meta;
}

export interface Datum {
  companyMember: CompanyMember;
  user: User;
}

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

export interface User {
  _id: string;
  /**
   * URL to user's profile picture
   */
  avatar?: string;
  createdAt: Date;
  createdBy: string;
  /**
   * Full display name (optional override)
   */
  displayName?: string;
  /**
   * User's email address (from SSO provider)
   */
  email: string;
  /**
   * External SSO provider user ID (Google, etc.)
   */
  externalId?: string;
  /**
   * User's first name
   */
  firstName: string;
  /**
   * User's last name
   */
  lastName: string;
  /**
   * Historical email addresses previously associated with this user (tracked when SSO email
   * changes)
   */
  previousEmails?: string[];
  roles: string[];
  updatedAt: Date;
}

export interface Meta {
  limit?: number;
  offset?: number;
  totalResultCount?: number;
}
