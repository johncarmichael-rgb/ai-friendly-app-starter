export interface UserFilterOptions {
  /**
   * Distinct email domains across all users, sorted alphabetically
   */
  domains: string[];
  /**
   * Distinct system roles across all users, sorted alphabetically
   */
  roles: string[];
}
