import {
  AdminCompanyGetQuery,
  AdminCompanyPostPost,
  AdminFeatureGetQuery,
  AdminPermissionGetQuery,
  AdminPermissionPostPost,
  AdminUsersGetQuery,
  Company,
  Companys,
  Features,
  Permission,
  Permissions,
  UserFilterOptions,
  Users,
} from '@/http/nodegen/interfaces';

import NodegenRequest from '@/http/interfaces/NodegenRequest';

export interface AdminDomainInterface {
  /**
   * Operation ID: adminCompanyGet
   * Summary: Get company, from _admin
   * Description: No description written
   * Permission string: apiAdminCompanyRead
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminCompanyGet(query: AdminCompanyGetQuery, req: any): Promise<Companys>;

  /**
   * Operation ID: adminCompanyPost
   * Summary: Create a company, from _admin
   * Description: No description written
   * Permission string: apiAdminCompanyCreate
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminCompanyPost(body: AdminCompanyPostPost, req: any): Promise<Company>;

  /**
   * Operation ID: adminFeatureGet
   * Summary: Get feature, from _admin
   * Description: No description written
   * Permission string: apiAdminFeatureRead
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminFeatureGet(query: AdminFeatureGetQuery, req: any): Promise<Features>;

  /**
   * Operation ID: adminPermissionGet
   * Summary: Get permission, from _admin
   * Description: No description written
   * Permission string: apiAdminPermissionRead
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminPermissionGet(
    query: AdminPermissionGetQuery,
    req: any
  ): Promise<Permissions>;

  /**
   * Operation ID: adminPermissionPost
   * Summary: Create a permission, from _admin
   * Description: No description written
   * Permission string: apiAdminPermissionCreate
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminPermissionPost(
    body: AdminPermissionPostPost,
    req: any
  ): Promise<Permission>;

  /**
   * Operation ID: adminUserFilterOptionsGet
   * Summary: Get user-filter-options, from _admin
   * Description: No description written
   * Permission string: apiAdminUserFilterOptionsRead
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminUserFilterOptionsGet(req: any): Promise<UserFilterOptions>;

  /**
   * Operation ID: adminUsersGet
   * Summary: Get users, from _admin
   * Description: No description written
   * Permission string: apiAdminUsersRead
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminUsersGet(query: AdminUsersGetQuery, req: any): Promise<Users>;
}
