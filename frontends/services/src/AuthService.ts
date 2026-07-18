import Cookies from 'js-cookie';

export default class AuthService {
  private static SESSION_COOKIE_NAME = 'sessionId';
  private static LOGOUT_ENDPOINT = '/api/auth/logout';
  private static onLogoutCallback?: () => void;

  static setup(config: { onLogout?: () => void }) {
    AuthService.onLogoutCallback = config.onLogout;
  }

  /**
   * The sessionId cookie is httpOnly and cannot be read by JavaScript.
   * Session validity is enforced server-side; the HttpService 401
   * interceptor handles expired or missing sessions.
   */
  static hasSessionCookie(): boolean {
    return Cookies.get(AuthService.SESSION_COOKIE_NAME) !== undefined;
  }

  static async logout(baseApiUrl: string): Promise<void> {
    try {
      await fetch(`${baseApiUrl}${AuthService.LOGOUT_ENDPOINT}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      AuthService.clearClientCookies();
      if (AuthService.onLogoutCallback) {
        AuthService.onLogoutCallback();
      }
    }
  }

  private static clearClientCookies(): void {
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach((cookieName) => {
      Cookies.remove(cookieName);
    });
  }

  static isLoggedIn(): boolean {
    return AuthService.hasSessionCookie();
  }
}
