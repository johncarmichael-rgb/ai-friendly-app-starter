import express from 'express';

import { celebrate } from 'celebrate';

import permissionMiddleware from '../middleware/permissionMiddleware';
import asyncValidationMiddleware from '../middleware/asyncValidationMiddleware';
import adminRenameValidators from '../validators/adminRenameValidators';
import AdminRenameDomain from '../../../domains/AdminRenameDomain';
import adminRenameTransformOutputs from '../transformOutputs/adminRenameTransformOutput';
import GenerateItExpressResponse from '@/http/nodegen/interfaces/GenerateItExpressResponse';

export default function () {
  const router = express.Router();

  /**
   * Operation ID: adminPermissionGroupRenamePost
   * Summary: Create a rename, from permission-group, from _admin
   *
   */

  router.post(
    '/permission-group/rename' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminPermissionGroupRenameCreate'),
    /* Validate the request data and return validation errors */
    celebrate(adminRenameValidators.adminPermissionGroupRenamePost),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminRenameDomain.adminPermissionGroupRenamePost(req.body, req),
        200,
        'application/json',
        adminRenameTransformOutputs.adminPermissionGroupRenamePost
      );
    }
  );

  return router;
}
