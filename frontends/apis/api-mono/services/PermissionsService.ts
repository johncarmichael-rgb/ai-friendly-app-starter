import HttpService from 'services/src/HttpService';
import { BaseApiService } from './BaseApiService';

import { Permissions } from './interfaces/Permissions';

export default class PermissionsService extends BaseApiService {
  /**
   *  Operation ID: permissionsGet
   *  Summary: Get permissions
   *  Description:
   */
  public static permissionsGet(): Promise<Permissions> {
    return HttpService.sendRequest({
      method: 'GET',
      path: PermissionsService.basePath + 'permissions',
    });
  }
}
