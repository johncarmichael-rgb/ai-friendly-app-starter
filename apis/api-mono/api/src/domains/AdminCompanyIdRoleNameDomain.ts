import { AdminCompanyCompanyIdRoleRoleNameResetPostPath, Company } from '@/http/nodegen/interfaces';

import { AdminCompanyIdRoleNameDomainInterface } from '@/http/nodegen/domainInterfaces/AdminCompanyIdRoleNameDomainInterface';
import CompanyRepository from '@/database/CompanyRepository';
import { NotFoundException } from '@/http/nodegen/errors/NotFoundException';
import { BadRequestException } from '@/http/nodegen/errors/BadRequestException';
import { DEFAULT_COMPANY_ADMIN_ROLE } from '@/constants/ROLES';

class AdminCompanyIdRoleNameDomain implements AdminCompanyIdRoleNameDomainInterface {
  public async adminCompanyCompanyIdRoleRoleNameResetPost(
    params: AdminCompanyCompanyIdRoleRoleNameResetPostPath,
    req: any,
  ): Promise<Company> {
    const { companyId, roleName } = params;

    // Only ADMIN role reset is supported currently
    if (roleName !== DEFAULT_COMPANY_ADMIN_ROLE.name) {
      throw new BadRequestException(`Reset is only supported for the ${DEFAULT_COMPANY_ADMIN_ROLE.name} role`);
    }

    const updatedCompany = await CompanyRepository.resetAdminRolePermissionGroups(companyId);

    if (!updatedCompany) {
      throw new NotFoundException('Company not found');
    }

    return updatedCompany;
  }
}

export default new AdminCompanyIdRoleNameDomain();
