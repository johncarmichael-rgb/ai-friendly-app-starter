import {
  CompanyMember,
  CompanyMemberCompanyIdGetPath,
  CompanyMemberCompanyIdGetQuery,
  CompanyMemberCompanyIdPostPath,
  CompanyMemberCompanyIdPostPost,
  CompanyMemberWithUsers,
  NodegenRequest,
} from '@/http/nodegen/interfaces';

import { CompanyMemberDomainInterface } from '@/http/nodegen/domainInterfaces/CompanyMemberDomainInterface';
import CompanyMemberRepository from '@/database/CompanyMemberRepository';
import UserRepository from '@/database/UserRepository';
import { UnprocessableEntityException } from '@/http/nodegen/errors';
import RoleAssignmentGuardService from '@/services/RoleAssignmentGuardService';

class CompanyMemberDomain implements CompanyMemberDomainInterface {
  public async companyMemberCompanyIdGet(
    params: CompanyMemberCompanyIdGetPath,
    query: CompanyMemberCompanyIdGetQuery,
    req: NodegenRequest,
  ): Promise<CompanyMemberWithUsers> {
    const result = await CompanyMemberRepository.findByCompanyId({
      companyId: params.companyId,
      offset: query.offset || 0,
      limit: query.limit || 25,
      search: query.search,
      role: query.role,
      status: query.status,
      isExternal: query.isExternal,
      userId: query.userId,
    });
    return {
      data: result.data,
      meta: {
        limit: query.limit || 25,
        offset: result.offset,
        totalResultCount: result.totalCount,
      },
    };
  }

  public async companyMemberCompanyIdPost(
    body: CompanyMemberCompanyIdPostPost,
    params: CompanyMemberCompanyIdPostPath,
    req: NodegenRequest,
  ): Promise<CompanyMember> {
    const user = await UserRepository.findById(body.userId);
    if (!user) {
      throw new UnprocessableEntityException('User not found, cannot add as company member');
    }
    await RoleAssignmentGuardService.assertCanAssignRole({
      actor: req.sessionData,
      companyId: params.companyId,
      targetRoleName: body.role,
      targetUserId: user._id,
    });
    return CompanyMemberRepository.create({
      ...body,
      companyId: params.companyId,
      invitedBy: req.sessionData.userId,
      name: `${user.firstName} ${user.lastName}`,
    });
  }
}

export default new CompanyMemberDomain();
