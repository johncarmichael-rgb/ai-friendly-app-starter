import HttpService from 'services/src/HttpService';
import { BaseApiService } from './BaseApiService';

import { AdminCompanyCompanyIdCompanyMemberCompanyMemberIdDeletePath } from './interfaces/AdminCompanyCompanyIdCompanyMemberCompanyMemberIdDeletePath';
import { AdminCompanyCompanyIdCompanyMemberCompanyMemberIdGetPath } from './interfaces/AdminCompanyCompanyIdCompanyMemberCompanyMemberIdGetPath';
import { AdminCompanyCompanyIdCompanyMemberCompanyMemberIdPutPath } from './interfaces/AdminCompanyCompanyIdCompanyMemberCompanyMemberIdPutPath';
import { AdminCompanyCompanyIdCompanyMemberCompanyMemberIdPutPut } from './interfaces/AdminCompanyCompanyIdCompanyMemberCompanyMemberIdPutPut';
import { AdminCompanyCompanyIdCompanyMemberGetPath } from './interfaces/AdminCompanyCompanyIdCompanyMemberGetPath';
import { AdminCompanyCompanyIdCompanyMemberGetQuery } from './interfaces/AdminCompanyCompanyIdCompanyMemberGetQuery';
import { AdminCompanyCompanyIdCompanyMemberPostPath } from './interfaces/AdminCompanyCompanyIdCompanyMemberPostPath';
import { AdminCompanyCompanyIdCompanyMemberPostPost } from './interfaces/AdminCompanyCompanyIdCompanyMemberPostPost';
import { AdminCompanyCompanyIdFeatureCodesFeatureCodeDeletePath } from './interfaces/AdminCompanyCompanyIdFeatureCodesFeatureCodeDeletePath';
import { AdminCompanyCompanyIdFeatureCodesFeatureCodePostPath } from './interfaces/AdminCompanyCompanyIdFeatureCodesFeatureCodePostPath';
import { AdminCompanyCompanyIdFeatureCodesGetPath } from './interfaces/AdminCompanyCompanyIdFeatureCodesGetPath';
import { AdminCompanyCompanyIdFeatureCodesPutPath } from './interfaces/AdminCompanyCompanyIdFeatureCodesPutPath';
import { AdminCompanyCompanyIdFeatureCodesPutPut } from './interfaces/AdminCompanyCompanyIdFeatureCodesPutPut';
import { AdminCompanyCompanyIdGetPath } from './interfaces/AdminCompanyCompanyIdGetPath';
import { AdminCompanyCompanyIdPutPath } from './interfaces/AdminCompanyCompanyIdPutPath';
import { AdminCompanyCompanyIdPutPut } from './interfaces/AdminCompanyCompanyIdPutPut';
import { AdminCompanyCompanyIdRoleRoleNameResetPostPath } from './interfaces/AdminCompanyCompanyIdRoleRoleNameResetPostPath';
import { AdminCompanyFeatureCodes } from './interfaces/AdminCompanyFeatureCodes';
import { AdminCompanyGetQuery } from './interfaces/AdminCompanyGetQuery';
import { AdminCompanyPostPost } from './interfaces/AdminCompanyPostPost';
import { AdminFeatureFeatureIdDeletePath } from './interfaces/AdminFeatureFeatureIdDeletePath';
import { AdminFeatureFeatureIdGetPath } from './interfaces/AdminFeatureFeatureIdGetPath';
import { AdminFeatureFeatureIdPatchPatch } from './interfaces/AdminFeatureFeatureIdPatchPatch';
import { AdminFeatureFeatureIdPatchPath } from './interfaces/AdminFeatureFeatureIdPatchPath';
import { AdminFeatureGetQuery } from './interfaces/AdminFeatureGetQuery';
import { AdminPermissionGetQuery } from './interfaces/AdminPermissionGetQuery';
import { AdminPermissionGroupRenamePostPost } from './interfaces/AdminPermissionGroupRenamePostPost';
import { AdminPermissionPermissionIdDeletePath } from './interfaces/AdminPermissionPermissionIdDeletePath';
import { AdminPermissionPermissionIdGetPath } from './interfaces/AdminPermissionPermissionIdGetPath';
import { AdminPermissionPermissionIdPatchPatch } from './interfaces/AdminPermissionPermissionIdPatchPatch';
import { AdminPermissionPermissionIdPatchPath } from './interfaces/AdminPermissionPermissionIdPatchPath';
import { AdminPermissionPostPost } from './interfaces/AdminPermissionPostPost';
import { AdminUsersGetQuery } from './interfaces/AdminUsersGetQuery';
import { AdminUsersUserIdGetPath } from './interfaces/AdminUsersUserIdGetPath';
import { AdminUsersUserIdRolesPutPath } from './interfaces/AdminUsersUserIdRolesPutPath';
import { AdminUsersUserIdRolesPutPut } from './interfaces/AdminUsersUserIdRolesPutPut';
import { AdminUsersUserIdSessionsDeletePath } from './interfaces/AdminUsersUserIdSessionsDeletePath';
import { AdminUsersUserIdSessionsGetPath } from './interfaces/AdminUsersUserIdSessionsGetPath';
import { Company } from './interfaces/Company';
import { CompanyMember } from './interfaces/CompanyMember';
import { CompanyMemberWithUsers } from './interfaces/CompanyMemberWithUsers';
import { Companys } from './interfaces/Companys';
import { Feature } from './interfaces/Feature';
import { Features } from './interfaces/Features';
import { GenericDeleteSuccess } from './interfaces/GenericDeleteSuccess';
import { Permission } from './interfaces/Permission';
import { PermissionGroup } from './interfaces/PermissionGroup';
import { Permissions } from './interfaces/Permissions';
import { User } from './interfaces/User';
import { UserFilterOptions } from './interfaces/UserFilterOptions';
import { Users } from './interfaces/Users';

export default class AdminService extends BaseApiService {
  /**
   *  Operation ID: adminCompanyGet
   *  Summary: Get company, from _admin
   *  Description:
   */
  public static adminCompanyGet(
    query: AdminCompanyGetQuery
  ): Promise<Companys> {
    return HttpService.sendRequest({
      method: 'GET',
      path: AdminService.basePath + '_admin/company',
      qs: query,
    });
  }

  /**
   *  Operation ID: adminCompanyPost
   *  Summary: Create a company, from _admin
   *  Description:
   */
  public static adminCompanyPost(body: AdminCompanyPostPost): Promise<Company> {
    return HttpService.sendRequest({
      method: 'POST',
      path: AdminService.basePath + '_admin/company',
      body,
    });
  }

  /**
   *  Operation ID: adminCompanyCompanyIdCompanyMemberGet
   *  Summary: Get company-member, from company {companyId}, from _admin
   *  Description:
   */
  public static adminCompanyCompanyIdCompanyMemberGet(
    pathParams: AdminCompanyCompanyIdCompanyMemberGetPath,
    query: AdminCompanyCompanyIdCompanyMemberGetQuery
  ): Promise<CompanyMemberWithUsers> {
    return HttpService.sendRequest({
      method: 'GET',
      path: AdminService.basePath + '_admin/company/:companyId/company-member',
      params: pathParams,
      qs: query,
    });
  }

  /**
   *  Operation ID: adminCompanyCompanyIdCompanyMemberPost
   *  Summary: Create a company-member, from company {companyId}, from _admin
   *  Description:
   */
  public static adminCompanyCompanyIdCompanyMemberPost(
    body: AdminCompanyCompanyIdCompanyMemberPostPost,
    pathParams: AdminCompanyCompanyIdCompanyMemberPostPath
  ): Promise<CompanyMember> {
    return HttpService.sendRequest({
      method: 'POST',
      path: AdminService.basePath + '_admin/company/:companyId/company-member',
      body,
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminCompanyCompanyIdCompanyMemberCompanyMemberIdDelete
   *  Summary: Delete a company-member based on {companyMemberId}, from company {companyId}, from _admin
   *  Description:
   */
  public static adminCompanyCompanyIdCompanyMemberCompanyMemberIdDelete(
    pathParams: AdminCompanyCompanyIdCompanyMemberCompanyMemberIdDeletePath
  ): Promise<void> {
    return HttpService.sendRequest({
      method: 'DELETE',
      path:
        AdminService.basePath +
        '_admin/company/:companyId/company-member/:companyMemberId',
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminCompanyCompanyIdCompanyMemberCompanyMemberIdGet
   *  Summary: Get company-member based on {companyMemberId}, from company {companyId}, from _admin
   *  Description:
   */
  public static adminCompanyCompanyIdCompanyMemberCompanyMemberIdGet(
    pathParams: AdminCompanyCompanyIdCompanyMemberCompanyMemberIdGetPath
  ): Promise<CompanyMember> {
    return HttpService.sendRequest({
      method: 'GET',
      path:
        AdminService.basePath +
        '_admin/company/:companyId/company-member/:companyMemberId',
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminCompanyCompanyIdCompanyMemberCompanyMemberIdPut
   *  Summary: Update a company-member based on {companyMemberId}, from company {companyId}, from _admin
   *  Description:
   */
  public static adminCompanyCompanyIdCompanyMemberCompanyMemberIdPut(
    body: AdminCompanyCompanyIdCompanyMemberCompanyMemberIdPutPut,
    pathParams: AdminCompanyCompanyIdCompanyMemberCompanyMemberIdPutPath
  ): Promise<CompanyMember> {
    return HttpService.sendRequest({
      method: 'PUT',
      path:
        AdminService.basePath +
        '_admin/company/:companyId/company-member/:companyMemberId',
      body,
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminCompanyCompanyIdFeatureCodesGet
   *  Summary: Get feature-codes, from company {companyId}, from _admin
   *  Description:
   */
  public static adminCompanyCompanyIdFeatureCodesGet(
    pathParams: AdminCompanyCompanyIdFeatureCodesGetPath
  ): Promise<AdminCompanyFeatureCodes> {
    return HttpService.sendRequest({
      method: 'GET',
      path: AdminService.basePath + '_admin/company/:companyId/feature-codes',
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminCompanyCompanyIdFeatureCodesPut
   *  Summary: Update a feature-codes, from company {companyId}, from _admin
   *  Description:
   */
  public static adminCompanyCompanyIdFeatureCodesPut(
    body: AdminCompanyCompanyIdFeatureCodesPutPut,
    pathParams: AdminCompanyCompanyIdFeatureCodesPutPath
  ): Promise<AdminCompanyFeatureCodes> {
    return HttpService.sendRequest({
      method: 'PUT',
      path: AdminService.basePath + '_admin/company/:companyId/feature-codes',
      body,
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminCompanyCompanyIdFeatureCodesFeatureCodeDelete
   *  Summary: Delete a feature-codes based on {featureCode}, from company {companyId}, from _admin
   *  Description:
   */
  public static adminCompanyCompanyIdFeatureCodesFeatureCodeDelete(
    pathParams: AdminCompanyCompanyIdFeatureCodesFeatureCodeDeletePath
  ): Promise<AdminCompanyFeatureCodes> {
    return HttpService.sendRequest({
      method: 'DELETE',
      path:
        AdminService.basePath +
        '_admin/company/:companyId/feature-codes/:featureCode',
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminCompanyCompanyIdFeatureCodesFeatureCodePost
   *  Summary: Create a feature-codes based on {featureCode}, from company {companyId}, from _admin
   *  Description:
   */
  public static adminCompanyCompanyIdFeatureCodesFeatureCodePost(
    pathParams: AdminCompanyCompanyIdFeatureCodesFeatureCodePostPath
  ): Promise<AdminCompanyFeatureCodes> {
    return HttpService.sendRequest({
      method: 'POST',
      path:
        AdminService.basePath +
        '_admin/company/:companyId/feature-codes/:featureCode',
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminCompanyCompanyIdGet
   *  Summary: Get company based on {companyId}, from _admin
   *  Description:
   */
  public static adminCompanyCompanyIdGet(
    pathParams: AdminCompanyCompanyIdGetPath
  ): Promise<Company> {
    return HttpService.sendRequest({
      method: 'GET',
      path: AdminService.basePath + '_admin/company/:companyId',
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminCompanyCompanyIdPut
   *  Summary: Update a company based on {companyId}, from _admin
   *  Description:
   */
  public static adminCompanyCompanyIdPut(
    body: AdminCompanyCompanyIdPutPut,
    pathParams: AdminCompanyCompanyIdPutPath
  ): Promise<Company> {
    return HttpService.sendRequest({
      method: 'PUT',
      path: AdminService.basePath + '_admin/company/:companyId',
      body,
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminCompanyCompanyIdRoleRoleNameResetPost
   *  Summary: Create a reset, from role {roleName}, from company {companyId}, from _admin
   *  Description:
   */
  public static adminCompanyCompanyIdRoleRoleNameResetPost(
    pathParams: AdminCompanyCompanyIdRoleRoleNameResetPostPath
  ): Promise<Company> {
    return HttpService.sendRequest({
      method: 'POST',
      path:
        AdminService.basePath +
        '_admin/company/:companyId/role/:roleName/reset',
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminFeatureGet
   *  Summary: Get feature, from _admin
   *  Description:
   */
  public static adminFeatureGet(
    query: AdminFeatureGetQuery
  ): Promise<Features> {
    return HttpService.sendRequest({
      method: 'GET',
      path: AdminService.basePath + '_admin/feature',
      qs: query,
    });
  }

  /**
   *  Operation ID: adminFeatureFeatureIdDelete
   *  Summary: Delete a feature based on {featureId}, from _admin
   *  Description:
   */
  public static adminFeatureFeatureIdDelete(
    pathParams: AdminFeatureFeatureIdDeletePath
  ): Promise<GenericDeleteSuccess> {
    return HttpService.sendRequest({
      method: 'DELETE',
      path: AdminService.basePath + '_admin/feature/:featureId',
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminFeatureFeatureIdGet
   *  Summary: Get feature based on {featureId}, from _admin
   *  Description:
   */
  public static adminFeatureFeatureIdGet(
    pathParams: AdminFeatureFeatureIdGetPath
  ): Promise<Feature> {
    return HttpService.sendRequest({
      method: 'GET',
      path: AdminService.basePath + '_admin/feature/:featureId',
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminFeatureFeatureIdPatch
   *  Summary: Update part of a feature based on {featureId}, from _admin
   *  Description:
   */
  public static adminFeatureFeatureIdPatch(
    body: AdminFeatureFeatureIdPatchPatch,
    pathParams: AdminFeatureFeatureIdPatchPath
  ): Promise<Feature> {
    return HttpService.sendRequest({
      method: 'PATCH',
      path: AdminService.basePath + '_admin/feature/:featureId',
      body,
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminPermissionGet
   *  Summary: Get permission, from _admin
   *  Description:
   */
  public static adminPermissionGet(
    query: AdminPermissionGetQuery
  ): Promise<Permissions> {
    return HttpService.sendRequest({
      method: 'GET',
      path: AdminService.basePath + '_admin/permission',
      qs: query,
    });
  }

  /**
   *  Operation ID: adminPermissionPost
   *  Summary: Create a permission, from _admin
   *  Description:
   */
  public static adminPermissionPost(
    body: AdminPermissionPostPost
  ): Promise<Permission> {
    return HttpService.sendRequest({
      method: 'POST',
      path: AdminService.basePath + '_admin/permission',
      body,
    });
  }

  /**
   *  Operation ID: adminPermissionPermissionIdDelete
   *  Summary: Delete a permission based on {permissionId}, from _admin
   *  Description:
   */
  public static adminPermissionPermissionIdDelete(
    pathParams: AdminPermissionPermissionIdDeletePath
  ): Promise<GenericDeleteSuccess> {
    return HttpService.sendRequest({
      method: 'DELETE',
      path: AdminService.basePath + '_admin/permission/:permissionId',
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminPermissionPermissionIdGet
   *  Summary: Get permission based on {permissionId}, from _admin
   *  Description:
   */
  public static adminPermissionPermissionIdGet(
    pathParams: AdminPermissionPermissionIdGetPath
  ): Promise<Permission> {
    return HttpService.sendRequest({
      method: 'GET',
      path: AdminService.basePath + '_admin/permission/:permissionId',
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminPermissionPermissionIdPatch
   *  Summary: Update part of a permission based on {permissionId}, from _admin
   *  Description:
   */
  public static adminPermissionPermissionIdPatch(
    body: AdminPermissionPermissionIdPatchPatch,
    pathParams: AdminPermissionPermissionIdPatchPath
  ): Promise<Permission> {
    return HttpService.sendRequest({
      method: 'PATCH',
      path: AdminService.basePath + '_admin/permission/:permissionId',
      body,
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminPermissionGroupRenamePost
   *  Summary: Create a rename, from permission-group, from _admin
   *  Description:
   */
  public static adminPermissionGroupRenamePost(
    body: AdminPermissionGroupRenamePostPost
  ): Promise<PermissionGroup> {
    return HttpService.sendRequest({
      method: 'POST',
      path: AdminService.basePath + '_admin/permission-group/rename',
      body,
    });
  }

  /**
   *  Operation ID: adminUserFilterOptionsGet
   *  Summary: Get user-filter-options, from _admin
   *  Description:
   */
  public static adminUserFilterOptionsGet(): Promise<UserFilterOptions> {
    return HttpService.sendRequest({
      method: 'GET',
      path: AdminService.basePath + '_admin/user-filter-options',
    });
  }

  /**
   *  Operation ID: adminUsersGet
   *  Summary: Get users, from _admin
   *  Description:
   */
  public static adminUsersGet(query: AdminUsersGetQuery): Promise<Users> {
    return HttpService.sendRequest({
      method: 'GET',
      path: AdminService.basePath + '_admin/users',
      qs: query,
    });
  }

  /**
   *  Operation ID: adminUsersUserIdGet
   *  Summary: Get users based on {userId}, from _admin
   *  Description:
   */
  public static adminUsersUserIdGet(
    pathParams: AdminUsersUserIdGetPath
  ): Promise<User> {
    return HttpService.sendRequest({
      method: 'GET',
      path: AdminService.basePath + '_admin/users/:userId',
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminUsersUserIdRolesPut
   *  Summary: Update a roles, from users {userId}, from _admin
   *  Description:
   */
  public static adminUsersUserIdRolesPut(
    body: AdminUsersUserIdRolesPutPut,
    pathParams: AdminUsersUserIdRolesPutPath
  ): Promise<User> {
    return HttpService.sendRequest({
      method: 'PUT',
      path: AdminService.basePath + '_admin/users/:userId/roles',
      body,
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminUsersUserIdSessionsDelete
   *  Summary: Delete a sessions, from users {userId}, from _admin
   *  Description:
   */
  public static adminUsersUserIdSessionsDelete(
    pathParams: AdminUsersUserIdSessionsDeletePath
  ): Promise<GenericDeleteSuccess> {
    return HttpService.sendRequest({
      method: 'DELETE',
      path: AdminService.basePath + '_admin/users/:userId/sessions',
      params: pathParams,
    });
  }

  /**
   *  Operation ID: adminUsersUserIdSessionsGet
   *  Summary: Get sessions, from users {userId}, from _admin
   *  Description:
   */
  public static adminUsersUserIdSessionsGet(
    pathParams: AdminUsersUserIdSessionsGetPath
  ): Promise<void> {
    return HttpService.sendRequest({
      method: 'GET',
      path: AdminService.basePath + '_admin/users/:userId/sessions',
      params: pathParams,
    });
  }
}
