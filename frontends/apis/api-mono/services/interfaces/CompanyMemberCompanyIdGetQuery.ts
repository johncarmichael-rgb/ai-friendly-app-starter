export interface CompanyMemberCompanyIdGetQuery {
  /**
   * Filter by external membership status (true = external users only, false = internal users
   * only)
   */
  isExternal?: boolean;
  /**
   * Max number of results returned
   */
  limit?: number;
  /**
   * The number of items to skip before starting to collect the result set
   */
  offset?: number;
  /**
   * Filter by role name
   */
  role?: string;
  /**
   * Search term
   */
  search?: string;
  /**
   * Filter by member status
   */
  status?: Status;
  /**
   * Filter apps based on user's access permissions (role, location, etc.)
   */
  userId?: string;
}

/**
 * Filter by member status
 */
export enum Status {
  Active = 'active',
  Inactive = 'inactive',
}
