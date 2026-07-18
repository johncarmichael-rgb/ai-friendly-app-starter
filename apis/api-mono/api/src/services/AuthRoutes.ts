import express from 'express';
import { randomUUID } from 'crypto';
import config from '@/config';
import WorkOSService from '@/services/WorkOSService';
import SessionRepository from '@/database/SessionRepository';
import CompanyMemberRepository from '@/database/CompanyMemberRepository';
import AuthUserSessionService from '@/services/AuthUserSessionService';
import { SESSION_COOKIE_NAME } from '@/services/SessionMiddleware';
import { escapeHtml } from '@/utils/escapeHtml';

export const AUTH_ROUTES = {
  LOGIN: '/api/auth/login',
  CALLBACK: '/api/auth/callback',
  LOGOUT: '/api/auth/logout',
  SELECT_COMPANY: '/api/auth/select-company',
  SET_COMPANY: '/api/auth/set-company',
} as const;

/**
 * Mount hard-coded authentication routes.
 *
 * These routes are baked into the application middleware (template override)
 * rather than defined in the OpenAPI spec, because they are infrastructure-level
 * concerns that should never change.
 *
 * Routes:
 *   GET  /api/auth/login    — Redirect to WorkOS AuthKit sign-in page
 *   GET  /api/auth/callback — Handle WorkOS callback, create session, set cookie
 *   POST /api/auth/logout   — Clear session and cookie
 *   GET  /api/auth/logout   — Clear session and cookie (convenience for browser navigation)
 */
export function mountAuthRoutes(app: express.Application): void {
  // Root redirect — send / to /users (the default landing page)
  app.get('/', (_req, res) => res.redirect('/users'));

  app.get(AUTH_ROUTES.LOGIN, handleLogin);
  app.get(AUTH_ROUTES.CALLBACK, handleCallback);
  app.post(AUTH_ROUTES.LOGOUT, handleLogout);
  app.get(AUTH_ROUTES.LOGOUT, handleLogout);
  app.get(AUTH_ROUTES.SELECT_COMPANY, handleSelectCompanyPage);
  app.post(AUTH_ROUTES.SET_COMPANY, express.json(), handleSetCompany);
}

/**
 * GET /api/auth/login
 * Redirect the user to WorkOS AuthKit sign-in page.
 * If a returnTo query param is present, encode it into the state so the
 * callback can redirect the user back to their original destination.
 */
function handleLogin(req: express.Request, res: express.Response): void {
  console.log('Handling login request', req.query);
  const returnTo = typeof req.query.returnTo === 'string' ? req.query.returnTo : undefined;
  const statePayload = JSON.stringify({ nonce: randomUUID(), returnTo });
  const state = Buffer.from(statePayload).toString('base64url');
  const authUrl = WorkOSService.getAuthorizationUrl(state);
  console.log('Redirecting to WorkOS AuthKit', authUrl);
  res.redirect(authUrl);
}

/**
 * GET /api/auth/callback
 * Exchange the authorization code for a user object and tokens,
 * find or create the user, create a session, set the session cookie,
 * and serve a confirmation page.
 *
 * Unlike Auth0, WorkOS returns the user object directly in the
 * authenticate response — no separate /userinfo call needed.
 */
// eslint-disable-next-line max-lines-per-function
async function handleCallback(req: express.Request, res: express.Response): Promise<void> {
  const { code, error, error_description, state } = req.query;

  if (error) {
    console.error('[AuthRoutes] Callback error:', error, error_description);
    res.status(400).send(buildErrorPage(String(error_description || error)));
    return;
  }

  if (!code || typeof code !== 'string') {
    res.status(400).send(buildErrorPage('Missing authorization code'));
    return;
  }

  try {
    // Exchange code for user + tokens (single call)
    const authResponse = await WorkOSService.authenticateWithCode(code);
    const workosUser = authResponse.user;

    // Build the user name from WorkOS first_name / last_name
    const name = [workosUser.first_name, workosUser.last_name].filter(Boolean).join(' ') || undefined;

    // Find or create user and session
    const session = await AuthUserSessionService.handleAuthenticatedUser(
      {
        email: workosUser.email,
        sub: workosUser.id,
        name,
        picture: workosUser.profile_picture_url || undefined,
        aud: String(config.workos.clientId),
        iss: 'https://api.workos.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      req,
    );

    // Extract and store WorkOS session ID for logout (decode sid from JWT)
    const workosSessionId = extractWorkosSessionId(authResponse.access_token);
    if (workosSessionId) {
      void SessionRepository.updateWorkosSessionId(session.sessionId, workosSessionId);
    }

    // Set session cookie
    setSessionCookie(res, session.sessionId, session.expiresAt);

    // Determine company context
    const companies = await CompanyMemberRepository.findCompaniesForUser(session.userId);
    const returnTo = parseReturnTo(state);

    if (companies.length === 0) {
      // No tenant for this user — memberships are provisioned by an admin.
      res.status(403).send(buildErrorPage('No active company memberships found. Please contact your administrator.'));
      return;
    }

    if (companies.length > 1) {
      // Multi-company — redirect to company selection page
      const selectUrl = `${AUTH_ROUTES.SELECT_COMPANY}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;
      res.redirect(selectUrl);
      return;
    }

    // Single company — auto-select and proceed
    await SessionRepository.updateCompanyId(session.sessionId, companies[0].companyId);
    if (returnTo) {
      res.redirect(returnTo);
    } else {
      res.status(200).send(buildSuccessPage());
    }
  } catch (err) {
    console.error('[AuthRoutes] Callback processing failed:', err);
    res.status(500).send(buildErrorPage('Authentication failed. Please try again.'));
  }
}

/**
 * POST|GET /api/auth/logout
 * Delete the session from the database, clear the cookie, and redirect
 * to the application home page.
 */
async function handleLogout(req: express.Request, res: express.Response): Promise<void> {
  const sessionId = req.cookies?.[SESSION_COOKIE_NAME];
  let workosSessionId: string | undefined;

  if (sessionId) {
    // Look up session to get the WorkOS session ID before deleting
    const session = await SessionRepository.findBySessionId(sessionId).catch(() => null);
    if (session?.workosSessionId) {
      workosSessionId = session.workosSessionId;
    }

    await SessionRepository.deleteBySessionId(sessionId).catch((err) => {
      console.warn('[AuthRoutes] Failed to delete session:', err);
    });
  }

  // Clear cookie
  res.clearCookie(SESSION_COOKIE_NAME, {
    domain: String(config.workos.cookieDomain),
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  // Redirect through WorkOS logout to clear their session, then to the configured logout URL
  if (workosSessionId) {
    const workosLogoutUrl = WorkOSService.getLogoutUrl(workosSessionId);
    console.log('[AuthRoutes] Logging out of WorkOS session', workosLogoutUrl);
    res.redirect(workosLogoutUrl);
  } else {
    // No WorkOS session to invalidate — redirect directly
    const logoutRedirectUrl = String(config.workos.logoutRedirectUrl);
    console.log('[AuthRoutes] No WorkOS session, redirecting to', logoutRedirectUrl);
    res.redirect(logoutRedirectUrl);
  }
}

// ── Company selection ─────────────────────────────────────────────

/**
 * GET /api/auth/select-company
 * Render a company selection page for multi-company users.
 * Requires a valid session cookie (set during callback).
 */
async function handleSelectCompanyPage(req: express.Request, res: express.Response): Promise<void> {
  const sessionId = req.cookies?.[SESSION_COOKIE_NAME];
  if (!sessionId) {
    res.redirect(AUTH_ROUTES.LOGIN);
    return;
  }

  const session = await SessionRepository.findBySessionId(sessionId);
  if (!session) {
    res.redirect(AUTH_ROUTES.LOGIN);
    return;
  }

  const companies = await CompanyMemberRepository.findCompaniesForUser(session.userId);
  if (companies.length === 0) {
    // No tenant for this user — memberships are provisioned by an admin.
    res.status(403).send(buildErrorPage('No active company memberships found. Please contact your administrator.'));
    return;
  }

  if (companies.length === 1) {
    // Edge case: user had multi-company but one was removed mid-flow
    await SessionRepository.updateCompanyId(session.sessionId, companies[0].companyId);
    const returnTo = typeof req.query.returnTo === 'string' ? req.query.returnTo : undefined;
    res.redirect(returnTo || '/');
    return;
  }

  const returnTo = typeof req.query.returnTo === 'string' ? req.query.returnTo : '';
  res.status(200).send(buildSelectCompanyPage(companies, returnTo));
}

/**
 * POST /api/auth/set-company
 * Set the selected companyId on the user's session.
 * Body: { companyId: string, returnTo?: string }
 */
async function handleSetCompany(req: express.Request, res: express.Response): Promise<void> {
  const sessionId = req.cookies?.[SESSION_COOKIE_NAME];
  if (!sessionId) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const session = await SessionRepository.findBySessionId(sessionId);
  if (!session) {
    res.status(401).json({ message: 'Session expired or invalid' });
    return;
  }

  const { companyId, returnTo } = req.body || {};
  if (!companyId || typeof companyId !== 'string') {
    res.status(400).json({ message: 'companyId is required' });
    return;
  }

  // Validate user has access to the selected company
  const hasAccess = await CompanyMemberRepository.userHasAccessToCompany({
    companyId,
    userId: session.userId,
  });

  if (!hasAccess) {
    res.status(403).json({ message: 'Access denied to selected company' });
    return;
  }

  // Set companyId on session
  await SessionRepository.updateCompanyId(session.sessionId, companyId);

  // Redirect to original destination or default
  const redirectTo = typeof returnTo === 'string' && returnTo.startsWith('/') ? returnTo : '/';
  res.json({ success: true, redirectTo });
}

// ── JWT helper ────────────────────────────────────────────────────

/**
 * Extract the WorkOS session ID (`sid`) from the access token JWT.
 * We only decode (no verification needed — it came from our own callback).
 */
function extractWorkosSessionId(accessToken: string): string | undefined {
  try {
    const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64url').toString());
    return payload.sid;
  } catch {
    console.warn('[AuthRoutes] Failed to decode WorkOS access token');
    return undefined;
  }
}

// ── State helpers ─────────────────────────────────────────────────

/**
 * Decode the returnTo URL from the base64url-encoded state param.
 * Only allows relative paths (starting with /) to prevent open-redirect attacks.
 */
function parseReturnTo(state: unknown): string | undefined {
  if (typeof state !== 'string') {
    return undefined;
  }
  try {
    const payload = JSON.parse(Buffer.from(state, 'base64url').toString());
    if (typeof payload.returnTo === 'string' && payload.returnTo.startsWith('/')) {
      return payload.returnTo;
    }
  } catch {
    // Malformed state — ignore
  }
  return undefined;
}

// ── Cookie helper ──────────────────────────────────────────────────

function setSessionCookie(res: express.Response, sessionId: string, expiresAt: Date): void {
  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    domain: String(config.workos.cookieDomain),
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: expiresAt,
  });
}

// ── HTML page builders ─────────────────────────────────────────────

function buildSuccessPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Logged In</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #003459; color: white;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: white; color: #1a1a1a; border-radius: 16px;
      padding: 48px 32px; text-align: center; max-width: 380px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    .icon { font-size: 64px; margin-bottom: 16px; }
    h1 { font-size: 24px; font-weight: 600; margin-bottom: 12px; }
    p { font-size: 14px; color: #475569; line-height: 1.6; }
    .hint { margin-top: 16px; font-size: 12px; color: #94a3b8; }
  </style>
  <script>
    // Attempt to auto-close this tab after a short delay
    setTimeout(function() { window.close(); }, 3000);
  </script>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>You're logged in!</h1>
    <p>You can close this tab and return to the app.</p>
    <p class="hint">This tab will try to close automatically…</p>
  </div>
</body>
</html>`;
}

function buildErrorPage(message: string): string {
  const escaped = escapeHtml(message);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Error</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #003459; color: white;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: white; color: #1a1a1a; border-radius: 16px;
      padding: 48px 32px; text-align: center; max-width: 380px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    .icon { font-size: 64px; margin-bottom: 16px; }
    h1 { font-size: 24px; font-weight: 600; margin-bottom: 12px; }
    p { font-size: 14px; color: #475569; line-height: 1.6; }
    a { color: #003459; text-decoration: underline; margin-top: 16px; display: inline-block; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">❌</div>
    <h1>Login Failed</h1>
    <p>${escaped}</p>
    <a href="/api/auth/login">Try again</a>
  </div>
</body>
</html>`;
}

// eslint-disable-next-line max-lines-per-function
function buildSelectCompanyPage(
  companies: { companyId: string; name: string; logo?: string }[],
  returnTo: string,
): string {
  const companyCards = companies
    .map((c) => {
      const safeName = escapeHtml(c.name);
      const safeId = escapeHtml(c.companyId);
      const logoHtml = c.logo
        ? `<img src="${escapeHtml(c.logo)}" alt="${safeName}" class="company-logo" />`
        : `<div class="company-logo placeholder">${safeName.charAt(0).toUpperCase()}</div>`;
      return `<button class="company-card" data-company-id="${safeId}">${logoHtml}<span class="company-name">${safeName}</span></button>`;
    })
    .join('\n      ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Select Company</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #003459; color: white;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: white; color: #1a1a1a; border-radius: 16px;
      padding: 48px 32px; text-align: center; max-width: 420px; width: 100%;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    h1 { font-size: 22px; font-weight: 600; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: #64748b; margin-bottom: 24px; }
    .company-list { display: flex; flex-direction: column; gap: 12px; }
    .company-card {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px; border: 1px solid #e2e8f0; border-radius: 10px;
      background: #f8fafc; cursor: pointer; transition: all 0.15s;
      font-size: 15px; font-weight: 500; color: #1a1a1a;
      text-align: left; width: 100%;
    }
    .company-card:hover { border-color: #003459; background: #eff6ff; }
    .company-card:active { transform: scale(0.98); }
    .company-card.loading { opacity: 0.6; pointer-events: none; }
    .company-logo {
      width: 36px; height: 36px; border-radius: 8px; object-fit: cover;
      flex-shrink: 0;
    }
    .company-logo.placeholder {
      background: #003459; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 600;
    }
    .company-name { flex: 1; }
    .error-msg { color: #dc2626; font-size: 13px; margin-top: 12px; display: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Select a company</h1>
    <p class="subtitle">You belong to multiple companies. Choose one to continue.</p>
    <div class="company-list">
      ${companyCards}
    </div>
    <p class="error-msg" id="error-msg"></p>
  </div>
  <script>
    document.querySelectorAll('.company-card').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var companyId = btn.getAttribute('data-company-id');
        btn.classList.add('loading');
        document.getElementById('error-msg').style.display = 'none';

        fetch('${AUTH_ROUTES.SET_COMPANY}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ companyId: companyId, returnTo: ${JSON.stringify(returnTo)} })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.success) {
            window.location.href = data.redirectTo;
          } else {
            btn.classList.remove('loading');
            var errEl = document.getElementById('error-msg');
            errEl.textContent = data.message || 'Something went wrong';
            errEl.style.display = 'block';
          }
        })
        .catch(function() {
          btn.classList.remove('loading');
          var errEl = document.getElementById('error-msg');
          errEl.textContent = 'Network error. Please try again.';
          errEl.style.display = 'block';
        });
      });
    });
  </script>
</body>
</html>`;
}
