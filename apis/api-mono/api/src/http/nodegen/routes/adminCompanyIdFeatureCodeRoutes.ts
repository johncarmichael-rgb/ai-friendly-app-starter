import express from 'express';

import { celebrate } from 'celebrate';

import permissionMiddleware from '../middleware/permissionMiddleware';
import asyncValidationMiddleware from '../middleware/asyncValidationMiddleware';
import adminCompanyIdFeatureCodeValidators from '../validators/adminCompanyIdFeatureCodeValidators';
import AdminCompanyIdFeatureCodeDomain from '../../../domains/AdminCompanyIdFeatureCodeDomain';
import adminCompanyIdFeatureCodeTransformOutputs from '../transformOutputs/adminCompanyIdFeatureCodeTransformOutput';
import GenerateItExpressResponse from '@/http/nodegen/interfaces/GenerateItExpressResponse';

export default function () {
  const router = express.Router();

  /**
   * Operation ID: adminCompanyCompanyIdFeatureCodesFeatureCodeDelete
   * Summary: Delete a feature-codes based on {featureCode}, from company {companyId}, from _admin
   *
   */

  router.delete(
    '/company/:companyId/feature-codes/:featureCode' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware(
      'apiAdminCompanyCompanyIdFeatureCodesFeatureCodeDelete'
    ),
    /* Validate the request data and return validation errors */
    celebrate(
      adminCompanyIdFeatureCodeValidators.adminCompanyCompanyIdFeatureCodesFeatureCodeDelete
    ),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminCompanyIdFeatureCodeDomain.adminCompanyCompanyIdFeatureCodesFeatureCodeDelete(
          req.params,
          req
        ),
        200,
        'application/json',
        adminCompanyIdFeatureCodeTransformOutputs.adminCompanyCompanyIdFeatureCodesFeatureCodeDelete
      );
    }
  );

  /**
   * Operation ID: adminCompanyCompanyIdFeatureCodesFeatureCodePost
   * Summary: Create a feature-codes based on {featureCode}, from company {companyId}, from _admin
   *
   */

  router.post(
    '/company/:companyId/feature-codes/:featureCode' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware(
      'apiAdminCompanyCompanyIdFeatureCodesFeatureCodeCreate'
    ),
    /* Validate the request data and return validation errors */
    celebrate(
      adminCompanyIdFeatureCodeValidators.adminCompanyCompanyIdFeatureCodesFeatureCodePost
    ),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminCompanyIdFeatureCodeDomain.adminCompanyCompanyIdFeatureCodesFeatureCodePost(
          req.params,
          req
        ),
        200,
        'application/json',
        adminCompanyIdFeatureCodeTransformOutputs.adminCompanyCompanyIdFeatureCodesFeatureCodePost
      );
    }
  );

  return router;
}
