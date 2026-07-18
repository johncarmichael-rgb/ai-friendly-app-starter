import express from 'express';

import { celebrate } from 'celebrate';

import permissionMiddleware from '../middleware/permissionMiddleware';
import asyncValidationMiddleware from '../middleware/asyncValidationMiddleware';
import companyMemberValidators from '../validators/companyMemberValidators';
import CompanyMemberDomain from '../../../domains/CompanyMemberDomain';
import companyMemberTransformOutputs from '../transformOutputs/companyMemberTransformOutput';
import GenerateItExpressResponse from '@/http/nodegen/interfaces/GenerateItExpressResponse';

export default function () {
  const router = express.Router();

  /**
   * Operation ID: companyMemberCompanyIdGet
   * Summary: Get company-member based on {companyId}
   *
   */

  router.get(
    '/:companyId' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['companyCheck']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiCompanyMemberCompanyIdRead'),
    /* Validate the request data and return validation errors */
    celebrate(companyMemberValidators.companyMemberCompanyIdGet),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await CompanyMemberDomain.companyMemberCompanyIdGet(
          req.params,
          req.query,
          req
        ),
        200,
        'application/json',
        companyMemberTransformOutputs.companyMemberCompanyIdGet
      );
    }
  );

  /**
   * Operation ID: companyMemberCompanyIdPost
   * Summary: Create a company-member based on {companyId}
   *
   */

  router.post(
    '/:companyId' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['companyCheck']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiCompanyMemberCompanyIdCreate'),
    /* Validate the request data and return validation errors */
    celebrate(companyMemberValidators.companyMemberCompanyIdPost),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await CompanyMemberDomain.companyMemberCompanyIdPost(
          req.body,
          req.params,
          req
        ),
        200,
        'application/json',
        companyMemberTransformOutputs.companyMemberCompanyIdPost
      );
    }
  );

  return router;
}
