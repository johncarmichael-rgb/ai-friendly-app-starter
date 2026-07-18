/**
 * Update feature properties (code cannot be changed)
 */
export interface FeaturePatch {
  /**
   * Detailed description of what the feature provides
   */
  description?: string;
  /**
   * Whether the feature is currently available for assignment
   */
  isActive?: boolean;
  /**
   * Display name of the feature
   */
  name?: string;
}
