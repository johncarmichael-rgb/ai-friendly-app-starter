import {
  AdminUsersUserIdGetPath,
  AdminUsersUserIdRolesPutPath,
  AdminUsersUserIdRolesPutPut,
  AdminUsersUserIdSessionsDeletePath,
  AdminUsersUserIdSessionsGetPath,
  GenericDeleteSuccess,
  User,
} from '@/http/nodegen/interfaces';

import NodegenRequest from '@/http/interfaces/NodegenRequest';

export interface AdminUserIdDomainInterface {
  /**
   * Operation ID: adminUsersUserIdGet
   * Summary: Get users based on {userId}, from _admin
   * Description: No description written
   * Permission string: apiAdminUsersUserIdRead
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminUsersUserIdGet(params: AdminUsersUserIdGetPath, req: any): Promise<User>;

  /**
   * Operation ID: adminUsersUserIdRolesPut
   * Summary: Update a roles, from users {userId}, from _admin
   * Description: No description written
   * Permission string: apiAdminUsersUserIdRolesUpdate
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminUsersUserIdRolesPut(
    body: AdminUsersUserIdRolesPutPut,
    params: AdminUsersUserIdRolesPutPath,
    req: any
  ): Promise<User>;

  /**
   * Operation ID: adminUsersUserIdSessionsDelete
   * Summary: Delete a sessions, from users {userId}, from _admin
   * Description: No description written
   * Permission string: apiAdminUsersUserIdSessionsDelete
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminUsersUserIdSessionsDelete(
    params: AdminUsersUserIdSessionsDeletePath,
    req: any
  ): Promise<GenericDeleteSuccess>;

  /**
   * Operation ID: adminUsersUserIdSessionsGet
   * Summary: Get sessions, from users {userId}, from _admin
   * Description: No description written
   * Permission string: apiAdminUsersUserIdSessionsRead
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminUsersUserIdSessionsGet(
    params: AdminUsersUserIdSessionsGetPath,
    req: any
  ): Promise<any>;
}
