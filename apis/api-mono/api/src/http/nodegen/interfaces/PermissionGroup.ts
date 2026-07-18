export interface PermissionGroup {
  /**
   * Number of companies that had roles updated with the new group name
   */
  companiesUpdated: number;
  /**
   * Number of permissions that were updated with the new group name
   */
  permissionsUpdated: number;
  /**
   * Whether the rename operation was successful
   */
  success: boolean;
}
