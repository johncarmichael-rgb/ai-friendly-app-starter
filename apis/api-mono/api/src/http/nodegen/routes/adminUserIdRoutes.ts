import express from 'express';

import { celebrate } from 'celebrate';

import permissionMiddleware from '../middleware/permissionMiddleware';
import asyncValidationMiddleware from '../middleware/asyncValidationMiddleware';
import adminUserIdValidators from '../validators/adminUserIdValidators';
import AdminUserIdDomain from '../../../domains/AdminUserIdDomain';
import adminUserIdTransformOutputs from '../transformOutputs/adminUserIdTransformOutput';
import GenerateItExpressResponse from '@/http/nodegen/interfaces/GenerateItExpressResponse';

export default function () {
  const router = express.Router();

  /**
   * Operation ID: adminUsersUserIdGet
   * Summary: Get users based on {userId}, from _admin
   *
   */

  router.get(
    '/users/:userId' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminUsersUserIdRead'),
    /* Validate the request data and return validation errors */
    celebrate(adminUserIdValidators.adminUsersUserIdGet),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminUserIdDomain.adminUsersUserIdGet(req.params, req),
        200,
        'application/json',
        adminUserIdTransformOutputs.adminUsersUserIdGet
      );
    }
  );

  /**
   * Operation ID: adminUsersUserIdRolesPut
   * Summary: Update a roles, from users {userId}, from _admin
   *
   */

  router.put(
    '/users/:userId/roles' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminUsersUserIdRolesUpdate'),
    /* Validate the request data and return validation errors */
    celebrate(adminUserIdValidators.adminUsersUserIdRolesPut),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminUserIdDomain.adminUsersUserIdRolesPut(
          req.body,
          req.params,
          req
        ),
        200,
        'application/json',
        adminUserIdTransformOutputs.adminUsersUserIdRolesPut
      );
    }
  );

  /**
   * Operation ID: adminUsersUserIdSessionsDelete
   * Summary: Delete a sessions, from users {userId}, from _admin
   *
   */

  router.delete(
    '/users/:userId/sessions' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminUsersUserIdSessionsDelete'),
    /* Validate the request data and return validation errors */
    celebrate(adminUserIdValidators.adminUsersUserIdSessionsDelete),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminUserIdDomain.adminUsersUserIdSessionsDelete(req.params, req),
        200,
        'application/json',
        adminUserIdTransformOutputs.adminUsersUserIdSessionsDelete
      );
    }
  );

  /**
   * Operation ID: adminUsersUserIdSessionsGet
   * Summary: Get sessions, from users {userId}, from _admin
   *
   */

  router.get(
    '/users/:userId/sessions' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminUsersUserIdSessionsRead'),
    /* Validate the request data and return validation errors */
    celebrate(adminUserIdValidators.adminUsersUserIdSessionsGet),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminUserIdDomain.adminUsersUserIdSessionsGet(req.params, req),
        200,
        'application/json',
        adminUserIdTransformOutputs.adminUsersUserIdSessionsGet
      );
    }
  );

  return router;
}
