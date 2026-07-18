import express from 'express';

import { celebrate } from 'celebrate';

import permissionMiddleware from '../middleware/permissionMiddleware';
import asyncValidationMiddleware from '../middleware/asyncValidationMiddleware';
import adminPermissionIdValidators from '../validators/adminPermissionIdValidators';
import AdminPermissionIdDomain from '../../../domains/AdminPermissionIdDomain';
import adminPermissionIdTransformOutputs from '../transformOutputs/adminPermissionIdTransformOutput';
import GenerateItExpressResponse from '@/http/nodegen/interfaces/GenerateItExpressResponse';

export default function () {
  const router = express.Router();

  /**
   * Operation ID: adminPermissionPermissionIdDelete
   * Summary: Delete a permission based on {permissionId}, from _admin
   *
   */

  router.delete(
    '/permission/:permissionId' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminPermissionPermissionIdDelete'),
    /* Validate the request data and return validation errors */
    celebrate(adminPermissionIdValidators.adminPermissionPermissionIdDelete),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminPermissionIdDomain.adminPermissionPermissionIdDelete(
          req.params,
          req
        ),
        200,
        'application/json',
        adminPermissionIdTransformOutputs.adminPermissionPermissionIdDelete
      );
    }
  );

  /**
   * Operation ID: adminPermissionPermissionIdGet
   * Summary: Get permission based on {permissionId}, from _admin
   *
   */

  router.get(
    '/permission/:permissionId' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminPermissionPermissionIdRead'),
    /* Validate the request data and return validation errors */
    celebrate(adminPermissionIdValidators.adminPermissionPermissionIdGet),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminPermissionIdDomain.adminPermissionPermissionIdGet(
          req.params,
          req
        ),
        200,
        'application/json',
        adminPermissionIdTransformOutputs.adminPermissionPermissionIdGet
      );
    }
  );

  /**
   * Operation ID: adminPermissionPermissionIdPatch
   * Summary: Update part of a permission based on {permissionId}, from _admin
   *
   */

  router.patch(
    '/permission/:permissionId' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminPermissionPermissionIdUpdate'),
    /* Validate the request data and return validation errors */
    celebrate(adminPermissionIdValidators.adminPermissionPermissionIdPatch),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminPermissionIdDomain.adminPermissionPermissionIdPatch(
          req.body,
          req.params,
          req
        ),
        200,
        'application/json',
        adminPermissionIdTransformOutputs.adminPermissionPermissionIdPatch
      );
    }
  );

  return router;
}
