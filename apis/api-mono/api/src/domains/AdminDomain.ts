import {
  AdminCompanyGetQuery,
  AdminCompanyPostPost,
  AdminFeatureGetQuery,
  AdminPermissionGetQuery,
  AdminPermissionPostPost,
  AdminUsersGetQuery,
  Company,
  Companys,
  Features,
  Permission,
  Permissions,
  UserFilterOptions,
  Users,
} from '@/http/nodegen/interfaces';

import { AdminDomainInterface } from '@/http/nodegen/domainInterfaces/AdminDomainInterface';
import CompanyRepository from '@/database/CompanyRepository';
import UserRepository from '@/database/UserRepository';
import FeatureRepository from '@/database/FeatureRepository';
import PermissionRepository from '@/database/PermissionRepository';
import { BadRequestException } from '@/http/nodegen/errors/BadRequestException';
import { InternalServerErrorException } from '@/http/nodegen/errors/InternalServerErrorException';

/** Extract the lower-cased email domain (the part after the last '@'), or null if malformed. */
const getEmailDomain = (email: string): string | null => {
  const at = email.lastIndexOf('@');
  if (at === -1 || at === email.length - 1) {
    return null;
  }
  return email.slice(at + 1).toLowerCase();
};

class AdminDomain implements AdminDomainInterface {
  public async adminCompanyGet(query: AdminCompanyGetQuery, req: any): Promise<Companys> {
    const { offset, limit, search } = query;

    // Get all companies
    const allCompanies = await CompanyRepository.findAll();

    // Apply search filter if provided
    let filteredCompanies = allCompanies;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCompanies = allCompanies.filter(
        (company) =>
          company.name.toLowerCase().includes(searchLower) ||
          company.domains?.some((domain) => domain.toLowerCase().includes(searchLower)),
      );
    }

    // Apply pagination
    const start = offset || 0;
    const end = start + (limit || 25);
    const paginatedCompanies = filteredCompanies.slice(start, end);

    return paginatedCompanies;
  }

  public async adminCompanyPost(body: AdminCompanyPostPost, req: any): Promise<Company> {
    const userId = req.sessionData?.userId || 'system';

    const newCompany = await CompanyRepository.create({
      ...body,
      createdBy: userId,
    });

    if (!newCompany) {
      throw new InternalServerErrorException('Failed to create company');
    }

    return newCompany;
  }

  public async adminFeatureGet(query: AdminFeatureGetQuery, req: any): Promise<Features> {
    const { offset, limit, search } = query;
    const features = await FeatureRepository.findAll({ offset, limit, search });
    return features;
  }

  public async adminPermissionGet(query: AdminPermissionGetQuery, req: any): Promise<Permissions> {
    const { offset, limit, search } = query;
    const permissions = await PermissionRepository.findAll({ offset, limit, search });
    return permissions.map((p) => ({
      _id: p._id,
      code: p.code,
      name: p.name,
      group: p.group,
      isCustom: p.isCustom,
    }));
  }

  public async adminPermissionPost(body: AdminPermissionPostPost, req: any): Promise<Permission> {
    // Check if permission code already exists
    const existing = await PermissionRepository.findByCode(body.code);
    if (existing) {
      throw new BadRequestException(`Permission with code '${body.code}' already exists`);
    }

    const permission = await PermissionRepository.create({
      code: body.code,
      name: body.name,
      group: body.group,
    });
    return {
      _id: permission._id,
      code: permission.code,
      name: permission.name,
      group: permission.group,
      isCustom: permission.isCustom,
    };
  }

  public async adminUsersGet(query: AdminUsersGetQuery, req: any): Promise<Users> {
    const { offset, limit, search, domain, role } = query;
    const companyId = (query as any).companyId; // Optional filter parameter

    // Get users - either all or filtered by company
    const allUsers = companyId ? await UserRepository.findByCompanyId(companyId) : await UserRepository.findAll();

    // Apply search filter if provided
    let filteredUsers = allUsers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.email.toLowerCase().includes(searchLower) ||
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower),
      );
    }

    // Apply email-domain filter (server-side so it spans the whole user base, not just a page)
    if (domain) {
      const domainLower = domain.toLowerCase();
      filteredUsers = filteredUsers.filter((user) => getEmailDomain(user.email) === domainLower);
    }

    // Apply system-role filter (server-side)
    if (role) {
      filteredUsers = filteredUsers.filter((user) => (user.roles || []).includes(role));
    }

    // Apply pagination — totalResultCount reflects the full filtered set so the
    // client can render page numbers across all matching users.
    const start = offset || 0;
    const pageSize = limit || 25;
    const paginatedUsers = filteredUsers.slice(start, start + pageSize);

    return {
      data: paginatedUsers as Users['data'],
      meta: {
        totalResultCount: filteredUsers.length,
        offset: start,
        limit: pageSize,
      },
    };
  }

  public async adminUserFilterOptionsGet(req: any): Promise<UserFilterOptions> {
    // Distinct values across the whole user base, so the admin UI filter dropdowns
    // are not limited to whatever happens to be on the currently displayed page.
    const [emails, roles] = await Promise.all([UserRepository.distinctEmails(), UserRepository.distinctRoles()]);

    const domains = Array.from(
      new Set(emails.map((email) => getEmailDomain(email)).filter((d): d is string => !!d)),
    ).sort();

    return {
      domains,
      roles: (roles || []).filter(Boolean).sort(),
    };
  }
}

export default new AdminDomain();
