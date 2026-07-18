import { Permissions } from '@/http/nodegen/interfaces';

import NodegenRequest from '@/http/interfaces/NodegenRequest';

export interface PermissionsDomainInterface {
  /**
   * Operation ID: permissionsGet
   * Summary: Get permissions
   * Description: No description written
   * Permission string: apiPermissionsRead
   * Pre-domain async-validators: companyCheck
   **/
  permissionsGet(req: any): Promise<Permissions>;
}
