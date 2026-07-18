export interface PermissionPost {
  /**
   * Unique permission code for the custom permission
   */
  code: string;
  /**
   * Group name for organizing permissions (e.g., 'Company Management', 'User Management')
   */
  group?: string;
  /**
   * Human-readable name of the permission
   */
  name: string;
}
