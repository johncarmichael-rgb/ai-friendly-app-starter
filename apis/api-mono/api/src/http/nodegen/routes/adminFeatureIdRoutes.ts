import express from 'express';

import { celebrate } from 'celebrate';

import permissionMiddleware from '../middleware/permissionMiddleware';
import asyncValidationMiddleware from '../middleware/asyncValidationMiddleware';
import adminFeatureIdValidators from '../validators/adminFeatureIdValidators';
import AdminFeatureIdDomain from '../../../domains/AdminFeatureIdDomain';
import adminFeatureIdTransformOutputs from '../transformOutputs/adminFeatureIdTransformOutput';
import GenerateItExpressResponse from '@/http/nodegen/interfaces/GenerateItExpressResponse';

export default function () {
  const router = express.Router();

  /**
   * Operation ID: adminFeatureFeatureIdDelete
   * Summary: Delete a feature based on {featureId}, from _admin
   *
   */

  router.delete(
    '/feature/:featureId' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminFeatureFeatureIdDelete'),
    /* Validate the request data and return validation errors */
    celebrate(adminFeatureIdValidators.adminFeatureFeatureIdDelete),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminFeatureIdDomain.adminFeatureFeatureIdDelete(req.params, req),
        200,
        'application/json',
        adminFeatureIdTransformOutputs.adminFeatureFeatureIdDelete
      );
    }
  );

  /**
   * Operation ID: adminFeatureFeatureIdGet
   * Summary: Get feature based on {featureId}, from _admin
   *
   */

  router.get(
    '/feature/:featureId' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminFeatureFeatureIdRead'),
    /* Validate the request data and return validation errors */
    celebrate(adminFeatureIdValidators.adminFeatureFeatureIdGet),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminFeatureIdDomain.adminFeatureFeatureIdGet(req.params, req),
        200,
        'application/json',
        adminFeatureIdTransformOutputs.adminFeatureFeatureIdGet
      );
    }
  );

  /**
   * Operation ID: adminFeatureFeatureIdPatch
   * Summary: Update part of a feature based on {featureId}, from _admin
   *
   */

  router.patch(
    '/feature/:featureId' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminFeatureFeatureIdUpdate'),
    /* Validate the request data and return validation errors */
    celebrate(adminFeatureIdValidators.adminFeatureFeatureIdPatch),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminFeatureIdDomain.adminFeatureFeatureIdPatch(
          req.body,
          req.params,
          req
        ),
        200,
        'application/json',
        adminFeatureIdTransformOutputs.adminFeatureFeatureIdPatch
      );
    }
  );

  return router;
}
