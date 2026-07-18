import {
  AdminCompanyCompanyIdFeatureCodesFeatureCodeDeletePath,
  AdminCompanyCompanyIdFeatureCodesFeatureCodePostPath,
  AdminCompanyFeatureCodes,
} from '@/http/nodegen/interfaces';

import { AdminCompanyIdFeatureCodeDomainInterface } from '@/http/nodegen/domainInterfaces/AdminCompanyIdFeatureCodeDomainInterface';
import CompanyRepository from '@/database/CompanyRepository';
import { NotFoundException } from '@/http/nodegen/errors';

class AdminCompanyIdFeatureCodeDomain implements AdminCompanyIdFeatureCodeDomainInterface {
  public async adminCompanyCompanyIdFeatureCodesFeatureCodeDelete(
    params: AdminCompanyCompanyIdFeatureCodesFeatureCodeDeletePath,
    req: any,
  ): Promise<AdminCompanyFeatureCodes> {
    const { companyId, featureCode } = params;

    const company = await CompanyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException(`Company not found: ${companyId}`);
    }

    const currentCodes = company.featureCodes || [];
    const updatedCodes = currentCodes.filter((code) => code !== featureCode);

    const updatedCompany = await CompanyRepository.update({
      _id: companyId,
      updates: { featureCodes: updatedCodes },
    });

    if (!updatedCompany) {
      throw new NotFoundException(`Failed to update company: ${companyId}`);
    }

    return {
      featureCodes: updatedCompany.featureCodes || [],
    };
  }

  public async adminCompanyCompanyIdFeatureCodesFeatureCodePost(
    params: AdminCompanyCompanyIdFeatureCodesFeatureCodePostPath,
    req: any,
  ): Promise<AdminCompanyFeatureCodes> {
    const { companyId, featureCode } = params;

    const company = await CompanyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException(`Company not found: ${companyId}`);
    }

    const currentCodes = company.featureCodes || [];

    // Only add if not already present
    if (!currentCodes.includes(featureCode)) {
      currentCodes.push(featureCode);
    }

    const updatedCompany = await CompanyRepository.update({
      _id: companyId,
      updates: { featureCodes: currentCodes },
    });

    if (!updatedCompany) {
      throw new NotFoundException(`Failed to update company: ${companyId}`);
    }

    return {
      featureCodes: updatedCompany.featureCodes || [],
    };
  }
}

export default new AdminCompanyIdFeatureCodeDomain();
