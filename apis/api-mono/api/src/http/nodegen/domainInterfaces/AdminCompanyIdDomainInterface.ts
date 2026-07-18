import {
  AdminCompanyCompanyIdCompanyMemberGetPath,
  AdminCompanyCompanyIdCompanyMemberGetQuery,
  AdminCompanyCompanyIdCompanyMemberPostPath,
  AdminCompanyCompanyIdCompanyMemberPostPost,
  AdminCompanyCompanyIdFeatureCodesGetPath,
  AdminCompanyCompanyIdFeatureCodesPutPath,
  AdminCompanyCompanyIdFeatureCodesPutPut,
  AdminCompanyCompanyIdGetPath,
  AdminCompanyCompanyIdPutPath,
  AdminCompanyCompanyIdPutPut,
  AdminCompanyFeatureCodes,
  Company,
  CompanyMember,
  CompanyMemberWithUsers,
} from '@/http/nodegen/interfaces';

import NodegenRequest from '@/http/interfaces/NodegenRequest';

export interface AdminCompanyIdDomainInterface {
  /**
   * Operation ID: adminCompanyCompanyIdCompanyMemberGet
   * Summary: Get company-member, from company {companyId}, from _admin
   * Description: No description written
   * Permission string: apiAdminCompanyCompanyIdCompanyMemberRead
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminCompanyCompanyIdCompanyMemberGet(
    params: AdminCompanyCompanyIdCompanyMemberGetPath,
    query: AdminCompanyCompanyIdCompanyMemberGetQuery,
    req: any
  ): Promise<CompanyMemberWithUsers>;

  /**
   * Operation ID: adminCompanyCompanyIdCompanyMemberPost
   * Summary: Create a company-member, from company {companyId}, from _admin
   * Description: No description written
   * Permission string: apiAdminCompanyCompanyIdCompanyMemberCreate
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminCompanyCompanyIdCompanyMemberPost(
    body: AdminCompanyCompanyIdCompanyMemberPostPost,
    params: AdminCompanyCompanyIdCompanyMemberPostPath,
    req: any
  ): Promise<CompanyMember>;

  /**
   * Operation ID: adminCompanyCompanyIdFeatureCodesGet
   * Summary: Get feature-codes, from company {companyId}, from _admin
   * Description: No description written
   * Permission string: apiAdminCompanyCompanyIdFeatureCodesRead
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminCompanyCompanyIdFeatureCodesGet(
    params: AdminCompanyCompanyIdFeatureCodesGetPath,
    req: any
  ): Promise<AdminCompanyFeatureCodes>;

  /**
   * Operation ID: adminCompanyCompanyIdFeatureCodesPut
   * Summary: Update a feature-codes, from company {companyId}, from _admin
   * Description: No description written
   * Permission string: apiAdminCompanyCompanyIdFeatureCodesUpdate
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminCompanyCompanyIdFeatureCodesPut(
    body: AdminCompanyCompanyIdFeatureCodesPutPut,
    params: AdminCompanyCompanyIdFeatureCodesPutPath,
    req: any
  ): Promise<AdminCompanyFeatureCodes>;

  /**
   * Operation ID: adminCompanyCompanyIdGet
   * Summary: Get company based on {companyId}, from _admin
   * Description: No description written
   * Permission string: apiAdminCompanyCompanyIdRead
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminCompanyCompanyIdGet(
    params: AdminCompanyCompanyIdGetPath,
    req: any
  ): Promise<Company>;

  /**
   * Operation ID: adminCompanyCompanyIdPut
   * Summary: Update a company based on {companyId}, from _admin
   * Description: No description written
   * Permission string: apiAdminCompanyCompanyIdUpdate
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminCompanyCompanyIdPut(
    body: AdminCompanyCompanyIdPutPut,
    params: AdminCompanyCompanyIdPutPath,
    req: any
  ): Promise<Company>;
}
