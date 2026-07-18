import config from '@/config';

const WORKOS_BASE_URL = 'https://api.workos.com';

export interface WorkOSUser {
  object: 'user';
  id: string;
  email: string;
  email_verified: boolean;
  first_name: string | null;
  last_name: string | null;
  profile_picture_url: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
  external_id: string | null;
}

export interface WorkOSAuthResponse {
  user: WorkOSUser;
  organization_id?: string;
  access_token: string;
  refresh_token: string;
  authentication_method: string;
}

/**
 * WorkOSService
 *
 * Handles all direct WorkOS API interactions using raw REST calls (no SDK):
 * - Building AuthKit authorization URLs
 * - Exchanging authorization codes for user + tokens
 * - Building logout URLs
 */
class WorkOSService {
  /**
   * Build the WorkOS AuthKit authorization URL for the login redirect.
   * Uses provider=authkit so WorkOS handles all auth methods (password, SSO, OAuth, etc.)
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: String(config.workos.clientId),
      redirect_uri: String(config.workos.redirectUri),
      response_type: 'code',
      provider: 'authkit',
      ...(state ? { state } : {}),
    });

    return `${WORKOS_BASE_URL}/user_management/authorize?${params.toString()}`;
  }

  /**
   * Exchange an authorization code for a user object and tokens.
   * Single call — no separate /userinfo needed (unlike Auth0).
   */
  async authenticateWithCode(code: string): Promise<WorkOSAuthResponse> {
    const response = await fetch(`${WORKOS_BASE_URL}/user_management/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: String(config.workos.clientId),
        client_secret: String(config.workos.apiKey),
        code,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`WorkOS authenticate failed: ${response.status} ${error}`);
    }

    return response.json() as Promise<WorkOSAuthResponse>;
  }

  /**
   * Build the WorkOS logout URL.
   * After logout, WorkOS redirects to the configured "Sign-out redirect" in the dashboard.
   */
  getLogoutUrl(sessionId: string): string {
    const params = new URLSearchParams({
      session_id: sessionId,
    });

    return `${WORKOS_BASE_URL}/user_management/sessions/logout?${params.toString()}`;
  }
}

export default new WorkOSService();
