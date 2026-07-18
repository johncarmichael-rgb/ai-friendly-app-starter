import { CompanyClass, CompanyModel } from '@/database/models/CompanyModel';
import { Role } from '@/http/nodegen/interfaces/Company';
import { BaseRepository } from '@/database/BaseRepository';
import PermissionRepository from '@/database/PermissionRepository';
import { DEFAULT_COMPANY_ADMIN_ROLE } from '@/constants/ROLES';

class CompanyRepository extends BaseRepository<CompanyClass> {
  constructor() {
    super(CompanyModel);
  }

  async create(input: { name: string; createdBy: string; domains: string[]; logo?: string; roles?: Role[] }) {
    const newCompany = new this.model(input);
    const savedCompany = await newCompany.save();

    // Reset ADMIN role permission groups to all non-admin groups
    const updatedCompany = await this.resetAdminRolePermissionGroups(savedCompany._id);

    // Should never be null since we just created it, but return saved company as fallback
    return updatedCompany ?? savedCompany;
  }

  /**
   * Reset the ADMIN role's permission groups to all available groups except 'admin'.
   * Useful when creating a new company or when permissions have been updated.
   */
  async resetAdminRolePermissionGroups(_id: string): Promise<CompanyClass | null> {
    const company = await this.model.findById(_id);
    if (!company) {
      return null;
    }

    // Get all permission groups except 'admin'
    const allGroups = await PermissionRepository.getAllGroups();
    const nonAdminGroups = allGroups.filter((group) => group.toLowerCase() !== 'admin');

    // Update the ADMIN role's permission groups
    const roles = company.roles || [];
    const adminRoleIndex = roles.findIndex((role) => role.name === DEFAULT_COMPANY_ADMIN_ROLE.name);

    if (adminRoleIndex >= 0) {
      roles[adminRoleIndex].permissionGroups = nonAdminGroups;
    } else {
      roles.push({
        ...DEFAULT_COMPANY_ADMIN_ROLE,
        permissionGroups: nonAdminGroups,
      });
    }

    return this.model.findByIdAndUpdate(_id, { roles }, { returnDocument: 'after' });
  }

  findAll() {
    return this.model.find().sort({ createdAt: -1 });
  }

  findById(_id: string) {
    return this.model.findById(_id);
  }

  findByDomain(domain: string) {
    return this.model.findOne({ domains: domain });
  }

  /**
   * Find a company owning the given domain, excluding one company.
   * Used to enforce "a domain belongs to at most one company".
   */
  findByDomainExcluding(input: { domain: string; excludeCompanyId: string }) {
    return this.model.findOne({ domains: input.domain, _id: { $ne: input.excludeCompanyId } });
  }

  /**
   * Append a verified domain to a company. $addToSet keeps the list unique.
   */
  addDomain(_id: string, domain: string) {
    return this.model.findByIdAndUpdate(_id, { $addToSet: { domains: domain } }, { returnDocument: 'after' });
  }

  update(input: { _id: string; updates: Partial<CompanyClass> }) {
    return this.model.findByIdAndUpdate(input._id, input.updates, { returnDocument: 'after' });
  }

  /**
   * Rename a permission group across all companies' roles.
   * Updates the permissionGroups array in all roles that contain the old group name.
   * Returns the count of updated companies.
   */
  async renamePermissionGroup(oldName: string, newName: string): Promise<number> {
    const result = await this.model.updateMany(
      { 'roles.permissionGroups': oldName },
      { $set: { 'roles.$[role].permissionGroups.$[group]': newName } },
      {
        arrayFilters: [{ 'role.permissionGroups': oldName }, { group: oldName }],
      },
    );
    return result.modifiedCount;
  }
}

export default new CompanyRepository();
