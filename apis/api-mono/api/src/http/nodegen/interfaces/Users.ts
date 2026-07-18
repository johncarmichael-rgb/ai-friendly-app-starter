export interface Users {
  data: Datum[];
  meta: Meta;
}

export interface Datum {
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
