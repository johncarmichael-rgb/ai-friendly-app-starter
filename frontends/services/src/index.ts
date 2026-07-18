/**
 * Services Package Entry Point
 *
 * Exports all services for use in frontend applications
 */

export { default as HttpService } from './HttpService';
export { default as AuthService } from './AuthService';
export type { RequestObject } from './HttpService';
export { FEATURE_CODES, ALL_FEATURE_CODES } from './FEATURE_CODES';
export type { FeatureCode } from './FEATURE_CODES';
export {
  CONSUMER_EMAIL_DOMAINS,
  CONSUMER_EMAIL_DOMAIN_FAMILIES,
  DOMAIN_FORMAT_REGEX,
  isConsumerEmailDomain,
} from './CONSUMER_EMAIL_DOMAINS';

// Shared React Hooks
export {
  useHasPermissionGroup,
  useHasPermissionGroups,
  useHasAnyPermissionGroup,
  useHasAllPermissionGroups,
} from './hooks';

export { default as SocketService } from './SocketService';
export type { SocketServiceConfig } from './SocketService';
