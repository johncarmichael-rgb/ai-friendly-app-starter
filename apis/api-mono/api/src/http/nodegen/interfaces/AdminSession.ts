export interface AdminSession {
  _id: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  lastAccessedAt?: Date;
  /**
   * Unique session identifier
   */
  sessionId: string;
  updatedAt: Date;
  userAgent?: string;
  userId: string;
  userRoles: string[];
}
