import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { lookup as mimeLookup } from 'mime-types';
import config from '@/config';
import { Storage } from '@google-cloud/storage';
import { SessionData } from '@/services/SessionService';
import PermissionService from '@/services/PermissionService';
import { SYSTEM_SUPER_ADMIN } from '@/constants/ROLES';

// List of file extensions to treat as actual assets
const assetExtensions = /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|map|json|crx|xml|pem|zip|webmanifest)$/i;

// Frontend configuration mapping URL paths to bucket names and local folder paths
interface FrontendConfig {
  bucketName: string; // Name in GCS bucket
  localFolder: string; // Folder name in /frontends directory
  roleRequired?: string; // Role required to access the app
  permissionRequired?: string; // perm required to access the app
}

/**
 * !important: The API is namespaced under the segment "api"
 */
export const frontendMap: Record<string, FrontendConfig> = {
  '/users': {
    bucketName: 'user-main',
    localFolder: 'user-main',
  },
  '/admin': {
    bucketName: 'admin',
    localFolder: 'admin',
    roleRequired: 'SUPER_ADMIN',
  },
};

/**
 * Service for managing frontend assets from GCS (production) or local dist (development)
 */
class FrontendAssetsService {
  private bucketName: string;
  private storage: Storage;
  private isLocalDevelopment: boolean;
  private localDistPath: string;

  constructor() {
    this.bucketName = config.gcs.bucketName;

    // Initialize GCS client - automatically uses Application Default Credentials
    // (service account when running on Cloud Run)
    this.storage = new Storage();

    // Only serve locally via docker compose when NODE_ENV is explicitly 'local' (Docker Compose)
    this.isLocalDevelopment = config.env === 'local';

    // In Docker: /code/frontends (mounted from host)
    // __dirname is /code/build/services, so go up to /code then to frontends
    this.localDistPath = path.resolve(__dirname, '../../../frontends');
  }

  // eslint-disable-next-line max-lines-per-function
  async frontendAssetsMiddleware(req: Request, res: Response, next: any) {
    console.verbose(`[FrontendMiddleware] Request received: ${req.method} ${req.path}`);

    const normalizedPath = req.path;

    // Check if the request is for a frontend app
    for (const [prefix, config] of Object.entries(frontendMap)) {
      if (normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)) {
        // Check user level role
        if (config.roleRequired && !req.sessionData.userRoles.includes(config.roleRequired)) {
          return this.sendForbiddenPage({
            res,
            sessionData: req.sessionData,
          });
        }

        // Check permission against the user's role in the active company
        // (without companyId, PermissionService falls back to whichever active
        // membership Mongo returns first — letting permissions from one company
        // leak into another for multi-company users).
        if (
          config.permissionRequired &&
          req.sessionData.companyId &&
          !req.sessionData.userRoles.includes(SYSTEM_SUPER_ADMIN) &&
          !(await PermissionService.doesUserHavePermission({
            userId: req.sessionData.userId,
            companyId: req.sessionData.companyId,
            permission: config.permissionRequired,
          }))
        ) {
          return this.sendForbiddenPage({
            res,
            sessionData: req.sessionData,
          });
        }

        console.verbose(`[FrontendMiddleware] Matched prefix: ${prefix} → bucketName: ${config.bucketName}`);

        let assetPath = normalizedPath === prefix ? '/index.html' : normalizedPath.substring(prefix.length);

        // If path ends with / or is empty, serve index.html
        if (assetPath === '/' || assetPath === '') {
          assetPath = '/index.html';
        }

        console.verbose(`[FrontendMiddleware] Resolved assetPath: ${assetPath}`);

        // Check if this looks like an actual asset file (has file extension)
        if (!assetExtensions.test(assetPath)) {
          // Not an asset file, likely a route - serve index.html for React Router
          console.verbose('[FrontendMiddleware] Route detected, serving index.html for React Router');
          assetPath = '/index.html';
        }

        console.verbose(
          `[FrontendMiddleware] Calling FrontendAssetsService.proxyAsset(${config.bucketName}, ${assetPath})`,
        );

        await this.proxyAsset(config.bucketName, config.localFolder, assetPath, res);
        return;
      }
    }

    // Redirect root to /users
    if (normalizedPath === '/') {
      res.redirect(302, '/users');
      return;
    }

    // If the path looks like a frontend route (not an API call or asset), redirect to /users
    if (!normalizedPath.startsWith('/api') && !assetExtensions.test(normalizedPath)) {
      console.verbose(`[FrontendMiddleware] Unknown frontend path ${normalizedPath}, redirecting to /users`);
      res.redirect(302, '/users');
      return;
    }

    console.verbose('[FrontendMiddleware] No frontend match, passing to next middleware');
    // Not a frontend asset, continue to next middleware
    next();
  }

  /**
   * Fetch and proxy a frontend asset from GCS (production) or local dist (development)
   * @param bucketName - The GCS bucket name / app identifier
   * @param localFolder - The local folder path in /frontends
   * @param assetPath - Path to the asset
   * @param res - Express response object
   */
  async proxyAsset(bucketName: string, localFolder: string, assetPath: string, res: Response): Promise<void> {
    console.verbose(
      `[FrontendAssets] proxyAsset called: bucketName=${bucketName}, localFolder=${localFolder}, assetPath=${assetPath}`,
    );
    console.verbose(`[FrontendAssets] Environment: ${config.env}, isLocalDevelopment=${this.isLocalDevelopment}`);
    console.verbose(`[FrontendAssets] Bucket: ${this.bucketName}`);

    if (this.isLocalDevelopment) {
      console.verbose('[FrontendAssets] Serving from LOCAL dist folder');
      return this.serveLocalAsset(bucketName, localFolder, assetPath, res);
    }
    console.verbose('[FrontendAssets] Serving from REMOTE GCS bucket');
    return this.serveRemoteAsset(bucketName, assetPath, res);
  }

  /**
   * Serve asset from local dist folder (development only)
   */
  private async serveLocalAsset(
    bucketName: string,
    localFolder: string,
    assetPath: string,
    res: Response,
  ): Promise<void> {
    try {
      const filePath = path.join(this.localDistPath, localFolder, 'dist', assetPath);

      console.verbose(
        `[FrontendAssets] Attempting to serve: bucketName=${bucketName}, localFolder=${localFolder}, assetPath=${assetPath}`,
      );
      console.verbose(`[FrontendAssets] Full path: ${filePath}`);
      console.verbose(`[FrontendAssets] localDistPath: ${this.localDistPath}`);

      // Security check - prevent directory traversal
      if (!filePath.startsWith(this.localDistPath)) {
        console.log('[FrontendAssets] Security check failed - path traversal attempt');
        res.status(403).send('Forbidden');
        return;
      }

      const fileContent = await fs.readFile(filePath);

      // Set content type based on file extension
      const contentType = mimeLookup(filePath) || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'no-cache'); // No cache in dev mode

      res.send(fileContent);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        res.status(404).send('Asset not found');
      } else {
        console.error(`Error serving local asset ${bucketName}/${assetPath}:`, error);
        res.status(500).send('Error reading asset');
      }
    }
  }

  /**
   * Stream asset from GCS (production only) using authenticated GCS client
   */
  // eslint-disable-next-line max-lines-per-function
  private async serveRemoteAsset(app: string, assetPath: string, res: Response): Promise<void> {
    try {
      // Remove leading slash from path to avoid double slashes
      const gcsPath = `${app}/${assetPath.startsWith('/') ? assetPath.substring(1) : assetPath}`;

      console.verbose(`[FrontendAssets] Fetching from GCS: gs://${this.bucketName}/${gcsPath}`);

      const file = this.storage.bucket(this.bucketName).file(gcsPath);
      const [exists] = await file.exists();
      if (!exists) {
        console.verbose(`[FrontendAssets] File not found in GCS: ${gcsPath}`);
        res.status(404).send('Asset not found');
        return;
      }

      console.verbose('[FrontendAssets] File exists, streaming to client');

      // Get file metadata for content type
      const [metadata] = await file.getMetadata();

      res.setHeader('Content-Type', metadata.contentType || mimeLookup(assetPath) || 'application/octet-stream');

      // Set cache headers based on file type
      // HTML: no-cache (always check for updates)
      // JS/CSS with hashes: longer cache (Vite adds content hashes to filenames)
      // Everything else: short cache
      if (assetPath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else if (assetPath.match(/\.(js|css)$/) && assetPath.includes('-')) {
        // Files with hashes in name (e.g., main-DxJaOcXl.js) can be cached longer
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        // Short cache for everything else (5 minutes)
        res.setHeader('Cache-Control', 'public, max-age=300');
      }

      // Stream file directly to response
      file
        .createReadStream()
        .on('error', (error: Error) => {
          console.error(`[FrontendAssets] Stream error for ${gcsPath}:`, error);
          if (!res.headersSent) {
            res.status(500).send('Error streaming asset');
          }
        })
        .pipe(res);

      console.verbose(`[FrontendAssets] Successfully started streaming ${gcsPath}`);
    } catch (error) {
      console.error(`[FrontendAssets] Error serving asset ${app}/${assetPath}:`, error);
      if (!res.headersSent) {
        res.status(500).send('Error fetching asset');
      }
    }
  }

  /**
   * Send a friendly HTML 403 Forbidden page
   */
  // eslint-disable-next-line max-lines-per-function
  private sendForbiddenPage(input: { res: Response; sessionData: SessionData }): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { res, sessionData } = input;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access Denied - 403 Forbidden</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #003459 0%, #007EA7 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 100%;
      padding: 48px 32px;
      text-align: center;
    }
    .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #003459 0%, #007EA7 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      color: white;
    }
    h1 {
      font-size: 32px;
      color: #00171F;
      margin-bottom: 16px;
      font-weight: 700;
    }
    .error-code {
      font-size: 18px;
      color: #475569;
      margin-bottom: 24px;
      font-weight: 500;
    }
    p {
      color: #475569;
      line-height: 1.6;
      margin-bottom: 16px;
      font-size: 16px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      color: #475569;
      font-size: 14px;
    }
    @media (max-width: 480px) {
      .container {
        padding: 32px 24px;
      }
      h1 {
        font-size: 24px;
      }
      .icon {
        width: 64px;
        height: 64px;
        font-size: 32px;
      }
    }
  </style>
</head>
<body>
<div class="container">
    <h1>Access Denied</h1>
    <div class="error-code">403 Forbidden</div>
    <p>You don't have permission to access this resource.</p>
    <p>This content may be restricted to certain roles within your organization. Contact your administrator to request access or verify your permissions.</p>
    <p style="margin-top: 24px;">If you were looking for the user app, <a href="/users" style="color: #007EA7; text-decoration: underline; font-weight: 600;">click here</a>.</p>
    <div class="footer">
      <p>${config.appDetails.name}</p>
    </div>
</div>
</body>
</html>
    `;

    res.status(403).setHeader('Content-Type', 'text/html').send(html);
  }
}

export default new FrontendAssetsService();
