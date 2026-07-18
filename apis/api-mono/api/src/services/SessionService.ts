import express from 'express';
import { randomUUID } from 'crypto';
import { SessionClass } from '@/database/models/SessionModel';
import SessionRepository from '@/database/SessionRepository';
import UserRepository from '@/database/UserRepository';

export type SessionData = SessionClass;

/**
 * SessionService
 *
 * Manages user sessions in the database for tracking and analytics.
 * Sessions are created per login and stored for audit purposes.
 * Authentication is handled by IAP JWT, not session cookies.
 */
class SessionService {
  private readonly SESSION_EXPIRY_DAYS = 30;

  /**
   * Connection metadata for WebSocket or other non-Express connections
   */
  extractConnectionMeta(req?: express.Request | { ipAddress?: string; userAgent?: string }): {
    ipAddress?: string;
    userAgent?: string;
  } {
    if (!req) {
      return {};
    }
    // Check if it's an Express request (has headers property)
    if ('headers' in req && 'socket' in req) {
      const expressReq = req as express.Request;
      return {
        ipAddress: expressReq.clientIp || expressReq.socket?.remoteAddress,
        userAgent: expressReq.headers['user-agent'],
      };
    }
    // Otherwise it's connection metadata
    return req as { ipAddress?: string; userAgent?: string };
  }

  /**
   * Create a new session for a user - stores in the db
   */
  async createSession(
    userId: string,
    req?: express.Request | { ipAddress?: string; userAgent?: string },
  ): Promise<SessionClass> {
    const sessionId = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.SESSION_EXPIRY_DAYS);

    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { ipAddress, userAgent } = this.extractConnectionMeta(req);

    // returnt eh newly created session in database
    return SessionRepository.create({
      sessionId,
      userId,
      userRoles: user.roles,
      expiresAt,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Find or create a session for a user
   * If a valid session exists, return it
   * Otherwise, create a new session
   */
  async findOrCreateSession(
    userId: string,
    req?: express.Request | { ipAddress?: string; userAgent?: string },
  ): Promise<SessionClass> {
    // Check if user has any valid sessions
    const existingSessions = await SessionRepository.findByUserId(userId);

    if (existingSessions && existingSessions.length > 0) {
      // Use the most recent session
      // todo Improve this to return the session that macthes their browser user agent string
      return existingSessions[0];
    }

    // No valid session exists, create new one
    return this.createSession(userId, req);
  }
}

export default new SessionService();
