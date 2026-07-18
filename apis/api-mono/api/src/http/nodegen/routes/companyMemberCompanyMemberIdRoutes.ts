import express from 'express';

import { celebrate } from 'celebrate';

import permissionMiddleware from '../middleware/permissionMiddleware';
import asyncValidationMiddleware from '../middleware/asyncValidationMiddleware';
import companyMemberCompanyMemberIdValidators from '../validators/companyMemberCompanyMemberIdValidators';
import CompanyMemberCompanyMemberIdDomain from '../../../domains/CompanyMemberCompanyMemberIdDomain';
import companyMemberCompanyMemberIdTransformOutputs from '../transformOutputs/companyMemberCompanyMemberIdTransformOutput';
import GenerateItExpressResponse from '@/http/nodegen/interfaces/GenerateItExpressResponse';

export default function () {
  const router = express.Router();

  /**
   * Operation ID: companyMemberCompanyIdCompanyMemberIdDelete
   * Summary: Delete a {companyId} based on {companyMemberId}, from company-member
   *
   */

  router.delete(
    '/:companyId/:companyMemberId' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['companyCheck']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiCompanyMemberCompanyIdCompanyMemberIdDelete'),
    /* Validate the request data and return validation errors */
    celebrate(
      companyMemberCompanyMemberIdValidators.companyMemberCompanyIdCompanyMemberIdDelete
    ),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await CompanyMemberCompanyMemberIdDomain.companyMemberCompanyIdCompanyMemberIdDelete(
          req.params,
          req
        ),
        200,
        undefined,
        companyMemberCompanyMemberIdTransformOutputs.companyMemberCompanyIdCompanyMemberIdDelete
      );
    }
  );

  /**
   * Operation ID: companyMemberCompanyIdCompanyMemberIdGet
   * Summary: Get {companyId} based on {companyMemberId}, from company-member
   *
   */

  router.get(
    '/:companyId/:companyMemberId' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['companyCheck']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiCompanyMemberCompanyIdCompanyMemberIdRead'),
    /* Validate the request data and return validation errors */
    celebrate(
      companyMemberCompanyMemberIdValidators.companyMemberCompanyIdCompanyMemberIdGet
    ),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await CompanyMemberCompanyMemberIdDomain.companyMemberCompanyIdCompanyMemberIdGet(
          req.params,
          req
        ),
        200,
        'application/json',
        companyMemberCompanyMemberIdTransformOutputs.companyMemberCompanyIdCompanyMemberIdGet
      );
    }
  );

  /**
   * Operation ID: companyMemberCompanyIdCompanyMemberIdPut
   * Summary: Update a {companyId} based on {companyMemberId}, from company-member
   *
   */

  router.put(
    '/:companyId/:companyMemberId' /* x-raw-body on path not found: Format the body */,
    express.json({
      limit: '50mb',
    }) /* x-async-validators on path found: Call an async validator function and throw an appropriate error */,
    asyncValidationMiddleware(['companyCheck']),
    /* x-permission on path found: Check permission of the incoming user */
    permissionMiddleware('apiCompanyMemberCompanyIdCompanyMemberIdUpdate'),
    /* Validate the request data and return validation errors */
    celebrate(
      companyMemberCompanyMemberIdValidators.companyMemberCompanyIdCompanyMemberIdPut
    ),
    async (req: any, res: GenerateItExpressResponse) => {
      res.inferResponseType(
        await CompanyMemberCompanyMemberIdDomain.companyMemberCompanyIdCompanyMemberIdPut(
          req.body,
          req.params,
          req
        ),
        200,
        'application/json',
        companyMemberCompanyMemberIdTransformOutputs.companyMemberCompanyIdCompanyMemberIdPut
      );
    }
  );

  return router;
}
