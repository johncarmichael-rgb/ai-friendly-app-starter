import CompanyRepository from '@/database/CompanyRepository';
import { FeatureCode } from '@/constants/FEATURE_CODES';
import { NotFoundException, PaymentRequiredException } from '@/http/nodegen/errors';

/**
 * Server-side plan/feature enforcement. Any frontend feature gate is
 * presentation only — every feature-gated endpoint must also refuse here,
 * otherwise a feature-locked company can drive the API directly. 402
 * carries a friendly upgrade message.
 */
class FeatureGateService {
  async assertCompanyHasFeature(input: {
    companyId: string;
    featureCode: FeatureCode;
    featureName: string;
  }): Promise<void> {
    const company = await CompanyRepository.findById(input.companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    if (!(company.featureCodes ?? []).includes(input.featureCode)) {
      throw new PaymentRequiredException(
        `${input.featureName} isn't included in your current plan. Contact your administrator to unlock it.`,
      );
    }
  }
}

export default new FeatureGateService();
