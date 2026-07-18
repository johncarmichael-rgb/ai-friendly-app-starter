import config from '@/config';
import express from 'express';
import adminRoutes from './routes/adminRoutes';
import adminCompanyIdRoutes from './routes/adminCompanyIdRoutes';
import adminCompanyIdCompanyMemberIdRoutes from './routes/adminCompanyIdCompanyMemberIdRoutes';
import adminCompanyIdFeatureCodeRoutes from './routes/adminCompanyIdFeatureCodeRoutes';
import adminCompanyIdRoleNameRoutes from './routes/adminCompanyIdRoleNameRoutes';
import adminFeatureIdRoutes from './routes/adminFeatureIdRoutes';
import adminPermissionIdRoutes from './routes/adminPermissionIdRoutes';
import adminRenameRoutes from './routes/adminRenameRoutes';
import adminUserIdRoutes from './routes/adminUserIdRoutes';
import companyMemberRoutes from './routes/companyMemberRoutes';
import companyMemberCompanyMemberIdRoutes from './routes/companyMemberCompanyMemberIdRoutes';
import healthRoutes from './routes/healthRoutes';
import permissionsRoutes from './routes/permissionsRoutes';
import userRoutes from './routes/userRoutes';

export interface RoutesImporter {
  basePath?: string
}

export const baseUrl = '/api';

export default function (app: express.Application, options: RoutesImporter = {basePath: baseUrl}) {
  const basePath = (options.basePath || '').replace(/\/+$/, '');

  app.use(basePath + '/_admin', adminRoutes());

  app.use(basePath + '/_admin', adminCompanyIdRoutes());

  app.use(basePath + '/_admin', adminCompanyIdCompanyMemberIdRoutes());

  app.use(basePath + '/_admin', adminCompanyIdFeatureCodeRoutes());

  app.use(basePath + '/_admin', adminCompanyIdRoleNameRoutes());

  app.use(basePath + '/_admin', adminFeatureIdRoutes());

  app.use(basePath + '/_admin', adminPermissionIdRoutes());

  app.use(basePath + '/_admin', adminRenameRoutes());

  app.use(basePath + '/_admin', adminUserIdRoutes());

  app.use(basePath + '/company-member', companyMemberRoutes());

  app.use(basePath + '/company-member', companyMemberCompanyMemberIdRoutes());

  app.use(basePath + '/health', healthRoutes());

  app.use(basePath + '/permissions', permissionsRoutes());

  app.use(basePath + '/user', userRoutes());

  }
