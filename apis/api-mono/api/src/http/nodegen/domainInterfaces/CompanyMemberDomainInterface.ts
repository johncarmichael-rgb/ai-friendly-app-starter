import {
  CompanyMember,
  CompanyMemberCompanyIdGetPath,
  CompanyMemberCompanyIdGetQuery,
  CompanyMemberCompanyIdPostPath,
  CompanyMemberCompanyIdPostPost,
  CompanyMemberWithUsers,
} from '@/http/nodegen/interfaces';

import NodegenRequest from '@/http/interfaces/NodegenRequest';

export interface CompanyMemberDomainInterface {
  /**
   * Operation ID: companyMemberCompanyIdGet
   * Summary: Get company-member based on {companyId}
   * Description: No description written
   * Permission string: apiCompanyMemberCompanyIdRead
   * Pre-domain async-validators: companyCheck
   **/
  companyMemberCompanyIdGet(
    params: CompanyMemberCompanyIdGetPath,
    query: CompanyMemberCompanyIdGetQuery,
    req: any
  ): Promise<CompanyMemberWithUsers>;

  /**
   * Operation ID: companyMemberCompanyIdPost
   * Summary: Create a company-member based on {companyId}
   * Description: No description written
   * Permission string: apiCompanyMemberCompanyIdCreate
   * Pre-domain async-validators: companyCheck
   **/
  companyMemberCompanyIdPost(
    body: CompanyMemberCompanyIdPostPost,
    params: CompanyMemberCompanyIdPostPath,
    req: any
  ): Promise<CompanyMember>;
}
