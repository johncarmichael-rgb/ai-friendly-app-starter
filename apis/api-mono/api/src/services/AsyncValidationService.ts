import NodegenRequest from '@/http/interfaces/NodegenRequest';
import CompanyMemberRepository from '@/database/CompanyMemberRepository';
import { ForbiddenException } from '@/http/nodegen/errors';
import { SYSTEM_SUPER_ADMIN } from '@/constants/ROLES';

class AsyncValidationService {
  async companyCheck(req: NodegenRequest, asyncValidatorParams: string[]): Promise<void> {
    const companyId = req.params.companyId as string;
    if (companyId) {
      if (!req.sessionData?.userId) {
        throw new ForbiddenException();
      }

      const hasAccess = await CompanyMemberRepository.userHasAccessToCompany({
        companyId,
        userId: req.sessionData.userId,
      });
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this company');
      }
    }
  }

  /**
   * Guard for /_admin/** routes: only users holding the SYSTEM_SUPER_ADMIN
   * system role may pass.
   */
  async isSuperAdmin(req: NodegenRequest, asyncValidatorParams: string[]): Promise<void> {
    if (!req.sessionData?.userRoles?.includes(SYSTEM_SUPER_ADMIN)) {
      throw new ForbiddenException('You are not authorized to perform this action');
    }
  }
}

export default new AsyncValidationService();
