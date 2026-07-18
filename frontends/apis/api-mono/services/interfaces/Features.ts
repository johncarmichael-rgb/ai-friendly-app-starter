export type Features = Feature[];

export interface Feature {
  _id: string;
  /**
   * Unique identifier code for the feature (e.g., 'ai_assistant', 'workflow_automation')
   */
  code: string;
  createdAt: Date;
  createdBy: string;
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
  name: string;
  updatedAt: Date;
}
