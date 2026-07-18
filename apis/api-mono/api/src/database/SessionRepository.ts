import { SessionModel, SessionClass } from '@/database/models/SessionModel';
import { BaseRepository } from '@/database/BaseRepository';
import InMemoryCache, { CacheKey } from '@/services/InMemoryCache';

class SessionRepository extends BaseRepository<SessionClass> {
  constructor() {
    super(SessionModel);
  }

  create(input: {
    sessionId: string;
    userId: string;
    userRoles: string[];
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
    companyId?: string;
  }) {
    const newSession = new this.model({
      ...input,
      lastAccessedAt: new Date(),
    });
    return newSession.save();
  }

  async findBySessionId(sessionId: string) {
    const cacheEntry = CacheKey.session(sessionId);
    const cached = InMemoryCache.get<SessionClass>(cacheEntry);
    if (cached) {
      console.log('CACHE HIT ON SESSION FETCH');
      return cached;
    }

    const session = await this.model.findOne({
      sessionId,
      expiresAt: { $gt: new Date() }, // Only return non-expired sessions
    });

    if (session) {
      InMemoryCache.set(cacheEntry, session);
    }

    return session;
  }

  findByUserId(userId: string) {
    return this.model.find({
      userId,
      expiresAt: { $gt: new Date() },
    });
  }

  async updateLastAccessed(sessionId: string) {
    return this.model.findOneAndUpdate({ sessionId }, { lastAccessedAt: new Date() }, { returnDocument: 'after' });
  }

  async deleteBySessionId(sessionId: string) {
    InMemoryCache.invalidate(CacheKey.session(sessionId).key);
    return this.model.deleteOne({ sessionId });
  }

  async deleteAllUserSessions(userId: string) {
    // Invalidate all cached sessions for this user.
    // We must query first to get sessionIds, since the cache is keyed by sessionId.
    const sessions = await this.model.find({ userId }).select('sessionId');
    for (const s of sessions) {
      InMemoryCache.invalidate(CacheKey.session(s.sessionId).key);
    }
    return this.model.deleteMany({ userId });
  }

  async updateCompanyId(sessionId: string, companyId: string) {
    InMemoryCache.invalidate(CacheKey.session(sessionId).key);
    return this.model.findOneAndUpdate({ sessionId }, { companyId }, { returnDocument: 'after' });
  }

  async updateWorkosSessionId(sessionId: string, workosSessionId: string) {
    return this.model.findOneAndUpdate({ sessionId }, { workosSessionId }, { returnDocument: 'after' });
  }

  async deleteExpiredSessions() {
    return this.model.deleteMany({
      expiresAt: { $lt: new Date() },
    });
  }
}

export default new SessionRepository();
