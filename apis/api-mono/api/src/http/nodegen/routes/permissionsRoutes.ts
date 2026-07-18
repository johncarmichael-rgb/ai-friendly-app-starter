import express from 'express';

import permissionMiddleware from '../middleware/permissionMiddleware';
import asyncValidationMiddleware from '../middleware/asyncValidationMiddleware';
import permissionsValidators from '../validators/permissionsValidators';
import PermissionsDomain from '../../../domains/PermissionsDomain';
import permissionsTransformOutputs from '../transformOutputs/permissionsTransformOutput';
import GenerateItExpressResponse from '@/http/nodegen/interfaces/GenerateItExpressResponse';

export default function () {
  const router = express.Router();

  /**
   * Operation ID: permissionsGet
   * Summary: Get permissions
   *
   */

  router.get(
    '/' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['companyCheck']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiPermissionsRead'),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await PermissionsDomain.permissionsGet(req),
        200,
        'application/json',
        permissionsTransformOutputs.permissionsGet
      );
    }
  );

  return router;
}
