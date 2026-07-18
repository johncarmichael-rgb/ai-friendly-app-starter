import {
  AdminPermissionPermissionIdDeletePath,
  AdminPermissionPermissionIdGetPath,
  AdminPermissionPermissionIdPatchPatch,
  AdminPermissionPermissionIdPatchPath,
  GenericDeleteSuccess,
  Permission,
} from '@/http/nodegen/interfaces';

import NodegenRequest from '@/http/interfaces/NodegenRequest';

export interface AdminPermissionIdDomainInterface {
  /**
   * Operation ID: adminPermissionPermissionIdDelete
   * Summary: Delete a permission based on {permissionId}, from _admin
   * Description: No description written
   * Permission string: apiAdminPermissionPermissionIdDelete
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminPermissionPermissionIdDelete(
    params: AdminPermissionPermissionIdDeletePath,
    req: any
  ): Promise<GenericDeleteSuccess>;

  /**
   * Operation ID: adminPermissionPermissionIdGet
   * Summary: Get permission based on {permissionId}, from _admin
   * Description: No description written
   * Permission string: apiAdminPermissionPermissionIdRead
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminPermissionPermissionIdGet(
    params: AdminPermissionPermissionIdGetPath,
    req: any
  ): Promise<Permission>;

  /**
   * Operation ID: adminPermissionPermissionIdPatch
   * Summary: Update part of a permission based on {permissionId}, from _admin
   * Description: No description written
   * Permission string: apiAdminPermissionPermissionIdUpdate
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminPermissionPermissionIdPatch(
    body: AdminPermissionPermissionIdPatchPatch,
    params: AdminPermissionPermissionIdPatchPath,
    req: any
  ): Promise<Permission>;
}
