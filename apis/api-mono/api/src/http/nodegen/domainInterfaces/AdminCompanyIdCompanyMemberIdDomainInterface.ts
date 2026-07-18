import {
  AdminCompanyCompanyIdCompanyMemberCompanyMemberIdDeletePath,
  AdminCompanyCompanyIdCompanyMemberCompanyMemberIdGetPath,
  AdminCompanyCompanyIdCompanyMemberCompanyMemberIdPutPath,
  AdminCompanyCompanyIdCompanyMemberCompanyMemberIdPutPut,
  CompanyMember,
} from '@/http/nodegen/interfaces';

import NodegenRequest from '@/http/interfaces/NodegenRequest';

export interface AdminCompanyIdCompanyMemberIdDomainInterface {
  /**
   * Operation ID: adminCompanyCompanyIdCompanyMemberCompanyMemberIdDelete
   * Summary: Delete a company-member based on {companyMemberId}, from company {companyId}, from _admin
   * Description: No description written
   * Permission string: apiAdminCompanyCompanyIdCompanyMemberCompanyMemberIdDelete
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminCompanyCompanyIdCompanyMemberCompanyMemberIdDelete(
    params: AdminCompanyCompanyIdCompanyMemberCompanyMemberIdDeletePath,
    req: any
  ): Promise<any>;

  /**
   * Operation ID: adminCompanyCompanyIdCompanyMemberCompanyMemberIdGet
   * Summary: Get company-member based on {companyMemberId}, from company {companyId}, from _admin
   * Description: No description written
   * Permission string: apiAdminCompanyCompanyIdCompanyMemberCompanyMemberIdRead
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminCompanyCompanyIdCompanyMemberCompanyMemberIdGet(
    params: AdminCompanyCompanyIdCompanyMemberCompanyMemberIdGetPath,
    req: any
  ): Promise<CompanyMember>;

  /**
   * Operation ID: adminCompanyCompanyIdCompanyMemberCompanyMemberIdPut
   * Summary: Update a company-member based on {companyMemberId}, from company {companyId}, from _admin
   * Description: No description written
   * Permission string: apiAdminCompanyCompanyIdCompanyMemberCompanyMemberIdUpdate
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminCompanyCompanyIdCompanyMemberCompanyMemberIdPut(
    body: AdminCompanyCompanyIdCompanyMemberCompanyMemberIdPutPut,
    params: AdminCompanyCompanyIdCompanyMemberCompanyMemberIdPutPath,
    req: any
  ): Promise<CompanyMember>;
}
