export interface AdminPermissionGetQuery {
  /**
   * Max number of results returned
   */
  limit?: number;
  /**
   * The number of items to skip before starting to collect the result set
   */
  offset?: number;
  /**
   * Search term
   */
  search?: string;
}
