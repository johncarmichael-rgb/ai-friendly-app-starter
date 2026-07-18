import {
  AdminCompanyCompanyIdCompanyMemberCompanyMemberIdDeletePath,
  AdminCompanyCompanyIdCompanyMemberCompanyMemberIdGetPath,
  AdminCompanyCompanyIdCompanyMemberCompanyMemberIdPutPath,
  AdminCompanyCompanyIdCompanyMemberCompanyMemberIdPutPut,
  CompanyMember,
} from '@/http/nodegen/interfaces';

import { AdminCompanyIdCompanyMemberIdDomainInterface } from '@/http/nodegen/domainInterfaces/AdminCompanyIdCompanyMemberIdDomainInterface';
import CompanyMemberRepository from '@/database/CompanyMemberRepository';
import { NotFoundException } from '@/http/nodegen/errors/NotFoundException';

class AdminCompanyIdCompanyMemberIdDomain implements AdminCompanyIdCompanyMemberIdDomainInterface {
  public async adminCompanyCompanyIdCompanyMemberCompanyMemberIdDelete(
    params: AdminCompanyCompanyIdCompanyMemberCompanyMemberIdDeletePath,
    req: any,
  ): Promise<any> {
    // Admin can delete any company member without access checks
    return CompanyMemberRepository.delete(params.companyMemberId);
  }

  public async adminCompanyCompanyIdCompanyMemberCompanyMemberIdGet(
    params: AdminCompanyCompanyIdCompanyMemberCompanyMemberIdGetPath,
    req: any,
  ): Promise<CompanyMember> {
    // Admin can view any company member without access checks
    const member = await CompanyMemberRepository.findById(params.companyMemberId);
    if (!member) {
      throw new NotFoundException('Company member not found');
    }
    return member;
  }

  public async adminCompanyCompanyIdCompanyMemberCompanyMemberIdPut(
    body: AdminCompanyCompanyIdCompanyMemberCompanyMemberIdPutPut,
    params: AdminCompanyCompanyIdCompanyMemberCompanyMemberIdPutPath,
    req: any,
  ): Promise<CompanyMember> {
    // Admin can update any company member without access checks
    const updatedMember = await CompanyMemberRepository.update({
      _id: params.companyMemberId,
      updates: body,
    });
    if (!updatedMember) {
      throw new NotFoundException('Company member not found');
    }
    return updatedMember;
  }
}

export default new AdminCompanyIdCompanyMemberIdDomain();
