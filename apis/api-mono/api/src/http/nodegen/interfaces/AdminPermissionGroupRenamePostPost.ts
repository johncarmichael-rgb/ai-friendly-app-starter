export interface AdminPermissionGroupRenamePostPost {
  /**
   * The new name for the permission group
   */
  newName: string;
  /**
   * The current name of the permission group to rename
   */
  oldName: string;
}
