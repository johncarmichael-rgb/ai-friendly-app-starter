import {
  AdminCompanyCompanyIdRoleRoleNameResetPostPath,
  Company,
} from '@/http/nodegen/interfaces';

import NodegenRequest from '@/http/interfaces/NodegenRequest';

export interface AdminCompanyIdRoleNameDomainInterface {
  /**
   * Operation ID: adminCompanyCompanyIdRoleRoleNameResetPost
   * Summary: Create a reset, from role {roleName}, from company {companyId}, from _admin
   * Description: No description written
   * Permission string: apiAdminCompanyCompanyIdRoleRoleNameResetCreate
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminCompanyCompanyIdRoleRoleNameResetPost(
    params: AdminCompanyCompanyIdRoleRoleNameResetPostPath,
    req: any
  ): Promise<Company>;
}
