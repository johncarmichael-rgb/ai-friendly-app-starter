export interface Permission {
  /**
   * Unique identifier for the permission
   */
  _id: string;
  /**
   * Unique permission code (e.g., 'apiCompanyRead')
   */
  code: string;
  /**
   * Group name for organizing permissions (e.g., 'Company Management', 'User Management')
   */
  group?: string;
  /**
   * Whether this is a custom permission (true) or derived from OpenAPI spec (false). Custom
   * permissions can be deleted, OpenAPI-derived ones cannot.
   */
  isCustom: boolean;
  /**
   * Human-readable name of the permission (e.g., 'Api Company Read')
   */
  name: string;
}
