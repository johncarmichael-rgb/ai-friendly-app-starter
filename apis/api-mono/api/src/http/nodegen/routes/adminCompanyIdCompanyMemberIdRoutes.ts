import express from 'express';

import { celebrate } from 'celebrate';

import permissionMiddleware from '../middleware/permissionMiddleware';
import asyncValidationMiddleware from '../middleware/asyncValidationMiddleware';
import adminCompanyIdCompanyMemberIdValidators from '../validators/adminCompanyIdCompanyMemberIdValidators';
import AdminCompanyIdCompanyMemberIdDomain from '../../../domains/AdminCompanyIdCompanyMemberIdDomain';
import adminCompanyIdCompanyMemberIdTransformOutputs from '../transformOutputs/adminCompanyIdCompanyMemberIdTransformOutput';
import GenerateItExpressResponse from '@/http/nodegen/interfaces/GenerateItExpressResponse';

export default function () {
  const router = express.Router();

  /**
   * Operation ID: adminCompanyCompanyIdCompanyMemberCompanyMemberIdDelete
   * Summary: Delete a company-member based on {companyMemberId}, from company {companyId}, from _admin
   *
   */

  router.delete(
    '/company/:companyId/company-member/:companyMemberId' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware(
      'apiAdminCompanyCompanyIdCompanyMemberCompanyMemberIdDelete'
    ),
    /* Validate the request data and return validation errors */
    celebrate(
      adminCompanyIdCompanyMemberIdValidators.adminCompanyCompanyIdCompanyMemberCompanyMemberIdDelete
    ),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminCompanyIdCompanyMemberIdDomain.adminCompanyCompanyIdCompanyMemberCompanyMemberIdDelete(
          req.params,
          req
        ),
        200,
        'application/json',
        adminCompanyIdCompanyMemberIdTransformOutputs.adminCompanyCompanyIdCompanyMemberCompanyMemberIdDelete
      );
    }
  );

  /**
   * Operation ID: adminCompanyCompanyIdCompanyMemberCompanyMemberIdGet
   * Summary: Get company-member based on {companyMemberId}, from company {companyId}, from _admin
   *
   */

  router.get(
    '/company/:companyId/company-member/:companyMemberId' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware(
      'apiAdminCompanyCompanyIdCompanyMemberCompanyMemberIdRead'
    ),
    /* Validate the request data and return validation errors */
    celebrate(
      adminCompanyIdCompanyMemberIdValidators.adminCompanyCompanyIdCompanyMemberCompanyMemberIdGet
    ),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminCompanyIdCompanyMemberIdDomain.adminCompanyCompanyIdCompanyMemberCompanyMemberIdGet(
          req.params,
          req
        ),
        200,
        'application/json',
        adminCompanyIdCompanyMemberIdTransformOutputs.adminCompanyCompanyIdCompanyMemberCompanyMemberIdGet
      );
    }
  );

  /**
   * Operation ID: adminCompanyCompanyIdCompanyMemberCompanyMemberIdPut
   * Summary: Update a company-member based on {companyMemberId}, from company {companyId}, from _admin
   *
   */

  router.put(
    '/company/:companyId/company-member/:companyMemberId' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware(
      'apiAdminCompanyCompanyIdCompanyMemberCompanyMemberIdUpdate'
    ),
    /* Validate the request data and return validation errors */
    celebrate(
      adminCompanyIdCompanyMemberIdValidators.adminCompanyCompanyIdCompanyMemberCompanyMemberIdPut
    ),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminCompanyIdCompanyMemberIdDomain.adminCompanyCompanyIdCompanyMemberCompanyMemberIdPut(
          req.body,
          req.params,
          req
        ),
        200,
        'application/json',
        adminCompanyIdCompanyMemberIdTransformOutputs.adminCompanyCompanyIdCompanyMemberCompanyMemberIdPut
      );
    }
  );

  return router;
}
