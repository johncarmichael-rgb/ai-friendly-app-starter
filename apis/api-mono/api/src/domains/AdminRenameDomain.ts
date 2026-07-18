import { AdminPermissionGroupRenamePostPost, PermissionGroup } from '@/http/nodegen/interfaces';

import { AdminRenameDomainInterface } from '@/http/nodegen/domainInterfaces/AdminRenameDomainInterface';
import PermissionRepository from '@/database/PermissionRepository';
import CompanyRepository from '@/database/CompanyRepository';
import { BadRequestException } from '@/http/nodegen/errors/BadRequestException';

class AdminRenameDomain implements AdminRenameDomainInterface {
  /**
   * Rename a permission group across all permissions and all company roles.
   * This ensures data consistency when a group name is changed.
   */
  public async adminPermissionGroupRenamePost(
    body: AdminPermissionGroupRenamePostPost,
    req: any,
  ): Promise<PermissionGroup> {
    const { oldName, newName } = body;

    // Validate inputs
    if (!oldName || !newName) {
      throw new BadRequestException('Both oldName and newName are required');
    }

    if (oldName === newName) {
      throw new BadRequestException('Old name and new name cannot be the same');
    }

    // Check if the old group name exists
    const existingGroups = await PermissionRepository.getAllGroups();
    if (!existingGroups.includes(oldName)) {
      throw new BadRequestException(`Permission group '${oldName}' does not exist`);
    }

    // Check if the new group name already exists
    if (existingGroups.includes(newName)) {
      throw new BadRequestException(`Permission group '${newName}' already exists`);
    }

    // Update all permissions with the old group name
    const permissionsUpdated = await PermissionRepository.renameGroup(oldName, newName);

    // Update all company roles that reference the old group name
    const companiesUpdated = await CompanyRepository.renamePermissionGroup(oldName, newName);

    return {
      success: true,
      permissionsUpdated,
      companiesUpdated,
    };
  }
}

export default new AdminRenameDomain();
