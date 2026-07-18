import HttpService from 'services/src/HttpService';
import { BaseApiService } from './BaseApiService';

import { User } from './interfaces/User';
import { UserCompany } from './interfaces/UserCompany';
import { UserCurrentPutPut } from './interfaces/UserCurrentPutPut';

export default class UserService extends BaseApiService {
  /**
   *  Operation ID: userCurrentGet
   *  Summary: Get current, from user
   *  Description:
   */
  public static userCurrentGet(): Promise<UserCompany> {
    return HttpService.sendRequest({
      method: 'GET',
      path: UserService.basePath + 'user/current',
    });
  }

  /**
   *  Operation ID: userCurrentPut
   *  Summary: Update a current, from user
   *  Description:
   */
  public static userCurrentPut(body: UserCurrentPutPut): Promise<User> {
    return HttpService.sendRequest({
      method: 'PUT',
      path: UserService.basePath + 'user/current',
      body,
    });
  }
}
