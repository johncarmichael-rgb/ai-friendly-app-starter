import express from 'express';

import { celebrate } from 'celebrate';

import permissionMiddleware from '../middleware/permissionMiddleware';
import asyncValidationMiddleware from '../middleware/asyncValidationMiddleware';
import adminCompanyIdRoleNameValidators from '../validators/adminCompanyIdRoleNameValidators';
import AdminCompanyIdRoleNameDomain from '../../../domains/AdminCompanyIdRoleNameDomain';
import adminCompanyIdRoleNameTransformOutputs from '../transformOutputs/adminCompanyIdRoleNameTransformOutput';
import GenerateItExpressResponse from '@/http/nodegen/interfaces/GenerateItExpressResponse';

export default function () {
  const router = express.Router();

  /**
   * Operation ID: adminCompanyCompanyIdRoleRoleNameResetPost
   * Summary: Create a reset, from role {roleName}, from company {companyId}, from _admin
   *
   */

  router.post(
    '/company/:companyId/role/:roleName/reset' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminCompanyCompanyIdRoleRoleNameResetCreate'),
    /* Validate the request data and return validation errors */
    celebrate(
      adminCompanyIdRoleNameValidators.adminCompanyCompanyIdRoleRoleNameResetPost
    ),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminCompanyIdRoleNameDomain.adminCompanyCompanyIdRoleRoleNameResetPost(
          req.params,
          req
        ),
        200,
        'application/json',
        adminCompanyIdRoleNameTransformOutputs.adminCompanyCompanyIdRoleRoleNameResetPost
      );
    }
  );

  return router;
}
