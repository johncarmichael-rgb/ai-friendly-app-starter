import {
  AdminCompanyCompanyIdFeatureCodesFeatureCodeDeletePath,
  AdminCompanyCompanyIdFeatureCodesFeatureCodePostPath,
  AdminCompanyFeatureCodes,
} from '@/http/nodegen/interfaces';

import NodegenRequest from '@/http/interfaces/NodegenRequest';

export interface AdminCompanyIdFeatureCodeDomainInterface {
  /**
   * Operation ID: adminCompanyCompanyIdFeatureCodesFeatureCodeDelete
   * Summary: Delete a feature-codes based on {featureCode}, from company {companyId}, from _admin
   * Description: No description written
   * Permission string: apiAdminCompanyCompanyIdFeatureCodesFeatureCodeDelete
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminCompanyCompanyIdFeatureCodesFeatureCodeDelete(
    params: AdminCompanyCompanyIdFeatureCodesFeatureCodeDeletePath,
    req: any
  ): Promise<AdminCompanyFeatureCodes>;

  /**
   * Operation ID: adminCompanyCompanyIdFeatureCodesFeatureCodePost
   * Summary: Create a feature-codes based on {featureCode}, from company {companyId}, from _admin
   * Description: No description written
   * Permission string: apiAdminCompanyCompanyIdFeatureCodesFeatureCodeCreate
   * Pre-domain async-validators: isSuperAdmin
   **/
  adminCompanyCompanyIdFeatureCodesFeatureCodePost(
    params: AdminCompanyCompanyIdFeatureCodesFeatureCodePostPath,
    req: any
  ): Promise<AdminCompanyFeatureCodes>;
}
