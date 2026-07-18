import express from 'express';

import { celebrate } from 'celebrate';

import permissionMiddleware from '../middleware/permissionMiddleware';
import asyncValidationMiddleware from '../middleware/asyncValidationMiddleware';
import adminCompanyIdValidators from '../validators/adminCompanyIdValidators';
import AdminCompanyIdDomain from '../../../domains/AdminCompanyIdDomain';
import adminCompanyIdTransformOutputs from '../transformOutputs/adminCompanyIdTransformOutput';
import GenerateItExpressResponse from '@/http/nodegen/interfaces/GenerateItExpressResponse';

export default function () {
  const router = express.Router();

  /**
   * Operation ID: adminCompanyCompanyIdCompanyMemberGet
   * Summary: Get company-member, from company {companyId}, from _admin
   *
   */

  router.get(
    '/company/:companyId/company-member' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminCompanyCompanyIdCompanyMemberRead'),
    /* Validate the request data and return validation errors */
    celebrate(adminCompanyIdValidators.adminCompanyCompanyIdCompanyMemberGet),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminCompanyIdDomain.adminCompanyCompanyIdCompanyMemberGet(
          req.params,
          req.query,
          req
        ),
        200,
        'application/json',
        adminCompanyIdTransformOutputs.adminCompanyCompanyIdCompanyMemberGet
      );
    }
  );

  /**
   * Operation ID: adminCompanyCompanyIdCompanyMemberPost
   * Summary: Create a company-member, from company {companyId}, from _admin
   *
   */

  router.post(
    '/company/:companyId/company-member' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminCompanyCompanyIdCompanyMemberCreate'),
    /* Validate the request data and return validation errors */
    celebrate(adminCompanyIdValidators.adminCompanyCompanyIdCompanyMemberPost),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminCompanyIdDomain.adminCompanyCompanyIdCompanyMemberPost(
          req.body,
          req.params,
          req
        ),
        200,
        'application/json',
        adminCompanyIdTransformOutputs.adminCompanyCompanyIdCompanyMemberPost
      );
    }
  );

  /**
   * Operation ID: adminCompanyCompanyIdFeatureCodesGet
   * Summary: Get feature-codes, from company {companyId}, from _admin
   *
   */

  router.get(
    '/company/:companyId/feature-codes' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminCompanyCompanyIdFeatureCodesRead'),
    /* Validate the request data and return validation errors */
    celebrate(adminCompanyIdValidators.adminCompanyCompanyIdFeatureCodesGet),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminCompanyIdDomain.adminCompanyCompanyIdFeatureCodesGet(
          req.params,
          req
        ),
        200,
        'application/json',
        adminCompanyIdTransformOutputs.adminCompanyCompanyIdFeatureCodesGet
      );
    }
  );

  /**
   * Operation ID: adminCompanyCompanyIdFeatureCodesPut
   * Summary: Update a feature-codes, from company {companyId}, from _admin
   *
   */

  router.put(
    '/company/:companyId/feature-codes' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminCompanyCompanyIdFeatureCodesUpdate'),
    /* Validate the request data and return validation errors */
    celebrate(adminCompanyIdValidators.adminCompanyCompanyIdFeatureCodesPut),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminCompanyIdDomain.adminCompanyCompanyIdFeatureCodesPut(
          req.body,
          req.params,
          req
        ),
        200,
        'application/json',
        adminCompanyIdTransformOutputs.adminCompanyCompanyIdFeatureCodesPut
      );
    }
  );

  /**
   * Operation ID: adminCompanyCompanyIdGet
   * Summary: Get company based on {companyId}, from _admin
   *
   */

  router.get(
    '/company/:companyId' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminCompanyCompanyIdRead'),
    /* Validate the request data and return validation errors */
    celebrate(adminCompanyIdValidators.adminCompanyCompanyIdGet),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminCompanyIdDomain.adminCompanyCompanyIdGet(req.params, req),
        200,
        'application/json',
        adminCompanyIdTransformOutputs.adminCompanyCompanyIdGet
      );
    }
  );

  /**
   * Operation ID: adminCompanyCompanyIdPut
   * Summary: Update a company based on {companyId}, from _admin
   *
   */

  router.put(
    '/company/:companyId' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminCompanyCompanyIdUpdate'),
    /* Validate the request data and return validation errors */
    celebrate(adminCompanyIdValidators.adminCompanyCompanyIdPut),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminCompanyIdDomain.adminCompanyCompanyIdPut(
          req.body,
          req.params,
          req
        ),
        200,
        'application/json',
        adminCompanyIdTransformOutputs.adminCompanyCompanyIdPut
      );
    }
  );

  return router;
}
