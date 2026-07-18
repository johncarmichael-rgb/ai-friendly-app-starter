/**
 * Authenticated user data — the common shape used by all auth flows
 * (IAP, Auth0, WorkOS).  Keeping a single interface avoids coupling the
 * services layer to the generated http layer.
 */
export interface AuthUserData {
  email: string;
  sub: string;
  name?: string;
  picture?: string;
  aud: string;
  iss: string;
  iat: number;
  exp: number;
}
