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

import { AdminCompanyIdDomainInterface } from '@/http/nodegen/domainInterfaces/AdminCompanyIdDomainInterface';
import CompanyRepository from '@/database/CompanyRepository';
import { NotFoundException, UnprocessableEntityException } from '@/http/nodegen/errors';
import CompanyMemberRepository from '@/database/CompanyMemberRepository';
import UserRepository from '@/database/UserRepository';

class AdminCompanyIdDomain implements AdminCompanyIdDomainInterface {
  public async adminCompanyCompanyIdCompanyMemberGet(
    params: AdminCompanyCompanyIdCompanyMemberGetPath,
    query: AdminCompanyCompanyIdCompanyMemberGetQuery,
    req: any,
  ): Promise<CompanyMemberWithUsers> {
    const result = await CompanyMemberRepository.findByCompanyId({
      companyId: params.companyId,
      offset: query.offset || 0,
      limit: query.limit || 25,
      search: query.search,
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

  public async adminCompanyCompanyIdCompanyMemberPost(
    body: AdminCompanyCompanyIdCompanyMemberPostPost,
    params: AdminCompanyCompanyIdCompanyMemberPostPath,
    req: any,
  ): Promise<CompanyMember> {
    const user = await UserRepository.findById(body.userId);

    if (!user) {
      throw new UnprocessableEntityException('No user by ID provided found');
    }

    // Admin can add members without being invited by anyone
    return CompanyMemberRepository.create({
      ...body,
      companyId: params.companyId,
      invitedBy: req.sessionData?.userId || 'admin',
      name: `${user.firstName} ${user.lastName}`,
    });
  }

  public async adminCompanyCompanyIdGet(params: AdminCompanyCompanyIdGetPath, req: any): Promise<Company> {
    const { companyId } = params;

    const company = await CompanyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException(`Company not found: ${companyId}`);
    }

    return company;
  }

  public async adminCompanyCompanyIdPut(
    body: AdminCompanyCompanyIdPutPut,
    params: AdminCompanyCompanyIdPutPath,
    req: any,
  ): Promise<Company> {
    const { companyId } = params;

    // Verify company exists
    const existingCompany = await CompanyRepository.findById(companyId);
    if (!existingCompany) {
      throw new NotFoundException(`Company not found: ${companyId}`);
    }

    const updatedCompany = await CompanyRepository.update({
      _id: companyId,
      updates: body,
    });

    if (!updatedCompany) {
      throw new NotFoundException(`Failed to update company: ${companyId}`);
    }

    return updatedCompany;
  }

  public async adminCompanyCompanyIdFeatureCodesGet(
    params: AdminCompanyCompanyIdFeatureCodesGetPath,
    req: any,
  ): Promise<AdminCompanyFeatureCodes> {
    const { companyId } = params;

    const company = await CompanyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException(`Company not found: ${companyId}`);
    }

    return {
      featureCodes: company.featureCodes || [],
    };
  }

  public async adminCompanyCompanyIdFeatureCodesPut(
    body: AdminCompanyCompanyIdFeatureCodesPutPut,
    params: AdminCompanyCompanyIdFeatureCodesPutPath,
    req: any,
  ): Promise<AdminCompanyFeatureCodes> {
    const { companyId } = params;

    const company = await CompanyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException(`Company not found: ${companyId}`);
    }

    const updatedCompany = await CompanyRepository.update({
      _id: companyId,
      updates: { featureCodes: body.featureCodes },
    });

    if (!updatedCompany) {
      throw new NotFoundException(`Failed to update company: ${companyId}`);
    }

    return {
      featureCodes: updatedCompany.featureCodes || [],
    };
  }
}

export default new AdminCompanyIdDomain();
