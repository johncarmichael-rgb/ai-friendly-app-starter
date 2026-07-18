import express from 'express';
import config from '@/config';
import SessionRepository from '@/database/SessionRepository';
import { frontendMap } from '@/services/FrontendAssetsService';
import { AUTH_ROUTES } from '@/services/AuthRoutes';

const SESSION_COOKIE_NAME = 'sessionId';
const LAST_ACCESSED_DEBOUNCE_MS = 5 * 60_000; // 5 minutes
const lastAccessedTimestamps = new Map<string, number>();

// Paths that do not require authentication
const PUBLIC_PATHS = [
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.CALLBACK,
  AUTH_ROUTES.LOGOUT,
  AUTH_ROUTES.SELECT_COMPANY,
  AUTH_ROUTES.SET_COMPANY,
  '/api/health',
];

/**
 * Check whether a request path should skip authentication.
 * Matches exact paths and prefix-based paths (e.g. /auth/callback?code=...).
 */
function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '?') || path.startsWith(p + '/'));
}

/**
 * Build a fully-qualified login redirect URL preserving the original request path.
 */
function buildLoginRedirectUrl(originalUrl: string): string {
  return `${config.appDetails.domain}${AUTH_ROUTES.LOGIN}?returnTo=${encodeURIComponent(originalUrl)}`;
}

// Pre-computed frontend prefixes — avoids Object.keys() on every request
const FRONTEND_PREFIXES = Object.keys(frontendMap);

/**
 * Check whether a request path targets a frontend app or a browser-navigable page.
 * If so, an unauthenticated user should be redirected to /auth/login
 * rather than receiving a 401 JSON response.
 *
 * Returns true for known frontend prefixes AND any non-API path (e.g. "/")
 * so that users always see a login page, not raw JSON.
 */
function isFrontendPath(path: string): boolean {
  if (FRONTEND_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix + '/'))) {
    return true;
  }
  // Any path that is NOT under /api/ is assumed to be browser navigation
  return !path.startsWith('/api/');
}

/**
 * Express middleware that validates the session cookie and attaches
 * session data to the request.
 *
 * Flow:
 * 1. Skip public paths (auth routes, health check)
 * 2. Read sessionId cookie
 * 3. Look up session in database (session has its own TTL expiry)
 * 4. Check companyId is set
 * 5. Update last accessed and attach sessionData to request
 */
// eslint-disable-next-line max-lines-per-function
export default function sessionMiddleware() {
  // eslint-disable-next-line max-lines-per-function
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      // 1. Skip authentication for public paths
      if (isPublicPath(req.path)) {
        return next();
      }

      // 2. Read session cookie
      const sessionId = req.cookies?.[SESSION_COOKIE_NAME];
      if (!sessionId) {
        console.log('No session cookie found');
        if (isFrontendPath(req.path)) {
          const redirect = buildLoginRedirectUrl(req.originalUrl);
          console.log('Redirecting to login', redirect);
          return res.redirect(redirect);
        }
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      // 3. Look up session (cache-first via repository)
      const session = await SessionRepository.findBySessionId(sessionId);
      if (!session) {
        if (isFrontendPath(req.path)) {
          return res.redirect(buildLoginRedirectUrl(req.originalUrl));
        }
        res.status(401).json({ message: 'Session expired or invalid' });
        return;
      }

      // 4. Check companyId is set (multi-company users must select one first).
      if (!session.companyId) {
        if (isFrontendPath(req.path)) {
          return res.redirect(`${AUTH_ROUTES.SELECT_COMPANY}?returnTo=${encodeURIComponent(req.originalUrl)}`);
        }
        res.status(403).json({ message: 'Company selection required' });
        return;
      }

      // 5. Update last accessed (debounced) and attach to request
      const now = Date.now();
      const lastWritten = lastAccessedTimestamps.get(session.sessionId) ?? 0;
      if (now - lastWritten > LAST_ACCESSED_DEBOUNCE_MS) {
        lastAccessedTimestamps.set(session.sessionId, now);
        void SessionRepository.updateLastAccessed(session.sessionId);
      }
      req.sessionData = session;

      next();
    } catch (error) {
      next(error);
    }
  };
}

export { SESSION_COOKIE_NAME };
