import {
  AdminPermissionGroupRenamePostPost,
  PermissionGroup,
} from '@/http/nodegen/interfaces';

import NodegenRequest from '@/http/interfaces/NodegenRequest';

export interface AdminRenameDomainInterface {
  /**
   * Operation ID: adminPermissionGroupRenamePost
   * Summary: Create a rename, from permission-group, from _admin
   * Description: No description written
   * Permission string: apiAdminPermissionGroupRenameCreate
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminPermissionGroupRenamePost(
    body: AdminPermissionGroupRenamePostPost,
    req: any
  ): Promise<PermissionGroup>;
}
