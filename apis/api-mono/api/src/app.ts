import http, { Http } from '@/http';
import FrontendAssetsService from '@/services/FrontendAssetsService';
import config from '@/config';

// Main export to start the app
export default async (port: number): Promise<Http> => {
  // NB: db connections live in runStartup() and are intentionally NOT awaited
  // here, so the caller can open the port before the DB connection is up.
  // HttpOptions argument. See the @/http/index.ts
  return http(port, {
    appMiddlewareOptions: config.appMiddlewareOptions,
    requestMiddlewareAfter: [FrontendAssetsService.frontendAssetsMiddleware.bind(FrontendAssetsService)],
  });
};
