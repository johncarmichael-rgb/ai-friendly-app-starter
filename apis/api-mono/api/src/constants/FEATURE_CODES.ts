/**
 * Feature codes for the application.
 * These codes are used to enable/disable features for companies.
 *
 * IMPORTANT: The FEATURE_CODES object is duplicated in frontends/services/src/FEATURE_CODES.ts
 * Any changes to codes must be reflected there as well.
 */
export const FEATURE_CODES = {
  EXAMPLE_FEATURE: 'example-feature',
} as const;

export type FeatureCode = (typeof FEATURE_CODES)[keyof typeof FEATURE_CODES];

/** Array of all feature codes for iteration/validation */
export const ALL_FEATURE_CODES = Object.values(FEATURE_CODES);

/**
 * Feature definitions with metadata.
 * These are upserted into the database on startup.
 */
export interface FeatureDefinition {
  code: FeatureCode;
  name: string;
  description: string;
}

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  {
    code: FEATURE_CODES.EXAMPLE_FEATURE,
    name: 'Example Feature',
    description: 'Demonstrates the feature-gate mechanism: enable this code on a company to unlock gated behaviour',
  },
];
