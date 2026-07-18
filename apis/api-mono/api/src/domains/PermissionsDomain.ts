import { Permissions } from '@/http/nodegen/interfaces';

import { PermissionsDomainInterface } from '@/http/nodegen/domainInterfaces/PermissionsDomainInterface';
import PermissionRepository from '@/database/PermissionRepository';

class PermissionsDomain implements PermissionsDomainInterface {
  /**
   * Returns all available permissions that can be assigned to roles.
   * Permissions are synced from the OpenAPI file on startup.
   */
  public async permissionsGet(req: any): Promise<Permissions> {
    return PermissionRepository.findAll({
      excludeAdminPermissions: true,
    });
  }
}

export default new PermissionsDomain();
