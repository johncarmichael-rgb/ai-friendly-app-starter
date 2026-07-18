import express from 'express';

import { celebrate } from 'celebrate';

import permissionMiddleware from '../middleware/permissionMiddleware';
import asyncValidationMiddleware from '../middleware/asyncValidationMiddleware';
import adminValidators from '../validators/adminValidators';
import AdminDomain from '../../../domains/AdminDomain';
import adminTransformOutputs from '../transformOutputs/adminTransformOutput';
import GenerateItExpressResponse from '@/http/nodegen/interfaces/GenerateItExpressResponse';

export default function () {
  const router = express.Router();

  /**
   * Operation ID: adminCompanyGet
   * Summary: Get company, from _admin
   *
   */

  router.get(
    '/company' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminCompanyRead'),
    /* Validate the request data and return validation errors */
    celebrate(adminValidators.adminCompanyGet),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminDomain.adminCompanyGet(req.query, req),
        200,
        'application/json',
        adminTransformOutputs.adminCompanyGet
      );
    }
  );

  /**
   * Operation ID: adminCompanyPost
   * Summary: Create a company, from _admin
   *
   */

  router.post(
    '/company' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminCompanyCreate'),
    /* Validate the request data and return validation errors */
    celebrate(adminValidators.adminCompanyPost),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminDomain.adminCompanyPost(req.body, req),
        200,
        'application/json',
        adminTransformOutputs.adminCompanyPost
      );
    }
  );

  /**
   * Operation ID: adminFeatureGet
   * Summary: Get feature, from _admin
   *
   */

  router.get(
    '/feature' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminFeatureRead'),
    /* Validate the request data and return validation errors */
    celebrate(adminValidators.adminFeatureGet),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminDomain.adminFeatureGet(req.query, req),
        200,
        'application/json',
        adminTransformOutputs.adminFeatureGet
      );
    }
  );

  /**
   * Operation ID: adminPermissionGet
   * Summary: Get permission, from _admin
   *
   */

  router.get(
    '/permission' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminPermissionRead'),
    /* Validate the request data and return validation errors */
    celebrate(adminValidators.adminPermissionGet),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminDomain.adminPermissionGet(req.query, req),
        200,
        'application/json',
        adminTransformOutputs.adminPermissionGet
      );
    }
  );

  /**
   * Operation ID: adminPermissionPost
   * Summary: Create a permission, from _admin
   *
   */

  router.post(
    '/permission' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminPermissionCreate'),
    /* Validate the request data and return validation errors */
    celebrate(adminValidators.adminPermissionPost),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminDomain.adminPermissionPost(req.body, req),
        200,
        'application/json',
        adminTransformOutputs.adminPermissionPost
      );
    }
  );

  /**
   * Operation ID: adminUserFilterOptionsGet
   * Summary: Get user-filter-options, from _admin
   *
   */

  router.get(
    '/user-filter-options' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminUserFilterOptionsRead'),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminDomain.adminUserFilterOptionsGet(req),
        200,
        'application/json',
        adminTransformOutputs.adminUserFilterOptionsGet
      );
    }
  );

  /**
   * Operation ID: adminUsersGet
   * Summary: Get users, from _admin
   *
   */

  router.get(
    '/users' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['isSuperAdmin']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiAdminUsersRead'),
    /* Validate the request data and return validation errors */
    celebrate(adminValidators.adminUsersGet),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await AdminDomain.adminUsersGet(req.query, req),
        200,
        'application/json',
        adminTransformOutputs.adminUsersGet
      );
    }
  );

  return router;
}
