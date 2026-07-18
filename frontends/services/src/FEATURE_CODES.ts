/**
 * Feature codes for the application.
 * These codes are used to enable/disable features for companies.
 *
 * IMPORTANT: This file is duplicated in apis/api-mono/api/src/constants/FEATURE_CODES.ts
 * Any changes here must be reflected there as well.
 */
export const FEATURE_CODES = {
  /** Example feature demonstrating the per-company feature-gate mechanism */
  EXAMPLE_FEATURE: 'example-feature',
} as const;

export type FeatureCode = (typeof FEATURE_CODES)[keyof typeof FEATURE_CODES];

/** Array of all feature codes for iteration/validation */
export const ALL_FEATURE_CODES = Object.values(FEATURE_CODES);
