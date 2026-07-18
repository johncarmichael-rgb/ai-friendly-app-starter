import HttpService from 'services/src/HttpService';
import { BaseApiService } from './BaseApiService';

import { CompanyMember } from './interfaces/CompanyMember';
import { CompanyMemberCompanyIdCompanyMemberIdDeletePath } from './interfaces/CompanyMemberCompanyIdCompanyMemberIdDeletePath';
import { CompanyMemberCompanyIdCompanyMemberIdGetPath } from './interfaces/CompanyMemberCompanyIdCompanyMemberIdGetPath';
import { CompanyMemberCompanyIdCompanyMemberIdPutPath } from './interfaces/CompanyMemberCompanyIdCompanyMemberIdPutPath';
import { CompanyMemberCompanyIdCompanyMemberIdPutPut } from './interfaces/CompanyMemberCompanyIdCompanyMemberIdPutPut';
import { CompanyMemberCompanyIdGetPath } from './interfaces/CompanyMemberCompanyIdGetPath';
import { CompanyMemberCompanyIdGetQuery } from './interfaces/CompanyMemberCompanyIdGetQuery';
import { CompanyMemberCompanyIdPostPath } from './interfaces/CompanyMemberCompanyIdPostPath';
import { CompanyMemberCompanyIdPostPost } from './interfaces/CompanyMemberCompanyIdPostPost';
import { CompanyMemberWithUsers } from './interfaces/CompanyMemberWithUsers';

export default class CompanyMemberService extends BaseApiService {
  /**
   *  Operation ID: companyMemberCompanyIdGet
   *  Summary: Get company-member based on {companyId}
   *  Description:
   */
  public static companyMemberCompanyIdGet(
    pathParams: CompanyMemberCompanyIdGetPath,
    query: CompanyMemberCompanyIdGetQuery
  ): Promise<CompanyMemberWithUsers> {
    return HttpService.sendRequest({
      method: 'GET',
      path: CompanyMemberService.basePath + 'company-member/:companyId',
      params: pathParams,
      qs: query,
    });
  }

  /**
   *  Operation ID: companyMemberCompanyIdPost
   *  Summary: Create a company-member based on {companyId}
   *  Description:
   */
  public static companyMemberCompanyIdPost(
    body: CompanyMemberCompanyIdPostPost,
    pathParams: CompanyMemberCompanyIdPostPath
  ): Promise<CompanyMember> {
    return HttpService.sendRequest({
      method: 'POST',
      path: CompanyMemberService.basePath + 'company-member/:companyId',
      body,
      params: pathParams,
    });
  }

  /**
   *  Operation ID: companyMemberCompanyIdCompanyMemberIdDelete
   *  Summary: Delete a {companyId} based on {companyMemberId}, from company-member
   *  Description:
   */
  public static companyMemberCompanyIdCompanyMemberIdDelete(
    pathParams: CompanyMemberCompanyIdCompanyMemberIdDeletePath
  ): Promise<void> {
    return HttpService.sendRequest({
      method: 'DELETE',
      path:
        CompanyMemberService.basePath +
        'company-member/:companyId/:companyMemberId',
      params: pathParams,
    });
  }

  /**
   *  Operation ID: companyMemberCompanyIdCompanyMemberIdGet
   *  Summary: Get {companyId} based on {companyMemberId}, from company-member
   *  Description:
   */
  public static companyMemberCompanyIdCompanyMemberIdGet(
    pathParams: CompanyMemberCompanyIdCompanyMemberIdGetPath
  ): Promise<CompanyMember> {
    return HttpService.sendRequest({
      method: 'GET',
      path:
        CompanyMemberService.basePath +
        'company-member/:companyId/:companyMemberId',
      params: pathParams,
    });
  }

  /**
   *  Operation ID: companyMemberCompanyIdCompanyMemberIdPut
   *  Summary: Update a {companyId} based on {companyMemberId}, from company-member
   *  Description:
   */
  public static companyMemberCompanyIdCompanyMemberIdPut(
    body: CompanyMemberCompanyIdCompanyMemberIdPutPut,
    pathParams: CompanyMemberCompanyIdCompanyMemberIdPutPath
  ): Promise<CompanyMember> {
    return HttpService.sendRequest({
      method: 'PUT',
      path:
        CompanyMemberService.basePath +
        'company-member/:companyId/:companyMemberId',
      body,
      params: pathParams,
    });
  }
}
