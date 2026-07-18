import {
  CompanyMember,
  CompanyMemberCompanyIdCompanyMemberIdDeletePath,
  CompanyMemberCompanyIdCompanyMemberIdGetPath,
  CompanyMemberCompanyIdCompanyMemberIdPutPath,
  CompanyMemberCompanyIdCompanyMemberIdPutPut,
  NodegenRequest,
} from '@/http/nodegen/interfaces';

import { CompanyMemberCompanyMemberIdDomainInterface } from '@/http/nodegen/domainInterfaces/CompanyMemberCompanyMemberIdDomainInterface';
import CompanyMemberRepository from '@/database/CompanyMemberRepository';
import UserRepository from '@/database/UserRepository';
import { NotFoundException } from '@/http/nodegen/errors/NotFoundException';
import RoleAssignmentGuardService from '@/services/RoleAssignmentGuardService';

class CompanyMemberCompanyMemberIdDomain implements CompanyMemberCompanyMemberIdDomainInterface {
  public async companyMemberCompanyIdCompanyMemberIdDelete(
    params: CompanyMemberCompanyIdCompanyMemberIdDeletePath,
    req: NodegenRequest,
  ): Promise<any> {
    const member = await CompanyMemberRepository.findById(params.companyMemberId);
    const result = await CompanyMemberRepository.delete(params.companyMemberId);
    // Clear any "manager" links that pointed at this user so they don't dangle.
    if (member) {
      await CompanyMemberRepository.clearManagerReferences({
        companyId: member.companyId,
        managerUserId: member.userId,
      });
    }
    return result;
  }

  public async companyMemberCompanyIdCompanyMemberIdGet(
    params: CompanyMemberCompanyIdCompanyMemberIdGetPath,
    req: NodegenRequest,
  ): Promise<CompanyMember> {
    const member = await CompanyMemberRepository.findById(params.companyMemberId);
    if (!member) {
      throw new NotFoundException('Company member not found');
    }
    return member;
  }

  public async companyMemberCompanyIdCompanyMemberIdPut(
    body: CompanyMemberCompanyIdCompanyMemberIdPutPut,
    params: CompanyMemberCompanyIdCompanyMemberIdPutPath,
    req: NodegenRequest,
  ): Promise<CompanyMember> {
    // Get current member to check if role is changing
    const currentMember = await CompanyMemberRepository.findById(params.companyMemberId);
    if (!currentMember) {
      throw new NotFoundException('Company member not found');
    }

    if (body.role && body.role !== currentMember.role) {
      await RoleAssignmentGuardService.assertCanAssignRole({
        actor: req.sessionData,
        companyId: params.companyId,
        targetRoleName: body.role as string,
        targetUserId: currentMember.userId,
      });
    }

    // Update user firstName/lastName if provided
    if (body.firstName !== undefined || body.lastName !== undefined) {
      const userUpdates: { firstName?: string; lastName?: string } = {};
      if (body.firstName !== undefined) {
        userUpdates.firstName = body.firstName.trim();
      }
      if (body.lastName !== undefined) {
        userUpdates.lastName = body.lastName.trim();
      }
      await UserRepository.update({
        _id: currentMember.userId,
        updates: userUpdates,
      });
    }

    // Extract member-specific fields for update (exclude user fields)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { firstName, lastName, ...memberUpdates } = body;

    const updatedMember = await CompanyMemberRepository.update({
      _id: params.companyMemberId,
      updates: memberUpdates,
    });
    if (!updatedMember) {
      throw new NotFoundException('Company member not found');
    }

    return updatedMember;
  }
}

export default new CompanyMemberCompanyMemberIdDomain();
