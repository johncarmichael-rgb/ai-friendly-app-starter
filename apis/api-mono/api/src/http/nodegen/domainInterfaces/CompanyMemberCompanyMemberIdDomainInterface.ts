import {
  CompanyMember,
  CompanyMemberCompanyIdCompanyMemberIdDeletePath,
  CompanyMemberCompanyIdCompanyMemberIdGetPath,
  CompanyMemberCompanyIdCompanyMemberIdPutPath,
  CompanyMemberCompanyIdCompanyMemberIdPutPut,
} from '@/http/nodegen/interfaces';

import NodegenRequest from '@/http/interfaces/NodegenRequest';

export interface CompanyMemberCompanyMemberIdDomainInterface {
  /**
   * Operation ID: companyMemberCompanyIdCompanyMemberIdDelete
   * Summary: Delete a {companyId} based on {companyMemberId}, from company-member
   * Description: No description written
   * Permission string: apiCompanyMemberCompanyIdCompanyMemberIdDelete
   * Pre-domain async-validators: companyCheck
   **/
  companyMemberCompanyIdCompanyMemberIdDelete(
    params: CompanyMemberCompanyIdCompanyMemberIdDeletePath,
    req: any
  ): Promise<any>;

  /**
   * Operation ID: companyMemberCompanyIdCompanyMemberIdGet
   * Summary: Get {companyId} based on {companyMemberId}, from company-member
   * Description: No description written
   * Permission string: apiCompanyMemberCompanyIdCompanyMemberIdRead
   * Pre-domain async-validators: companyCheck
   **/
  companyMemberCompanyIdCompanyMemberIdGet(
    params: CompanyMemberCompanyIdCompanyMemberIdGetPath,
    req: any
  ): Promise<CompanyMember>;

  /**
   * Operation ID: companyMemberCompanyIdCompanyMemberIdPut
   * Summary: Update a {companyId} based on {companyMemberId}, from company-member
   * Description: No description written
   * Permission string: apiCompanyMemberCompanyIdCompanyMemberIdUpdate
   * Pre-domain async-validators: companyCheck
   **/
  companyMemberCompanyIdCompanyMemberIdPut(
    body: CompanyMemberCompanyIdCompanyMemberIdPutPut,
    params: CompanyMemberCompanyIdCompanyMemberIdPutPath,
    req: any
  ): Promise<CompanyMember>;
}
