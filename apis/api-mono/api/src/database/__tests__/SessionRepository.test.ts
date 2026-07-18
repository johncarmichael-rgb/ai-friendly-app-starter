import SessionRepository from '../SessionRepository';
import InMemoryCache, { CacheKey } from '@/services/InMemoryCache';
import { SessionModel } from '@/database/models/SessionModel';

jest.mock('@/database/models/SessionModel', () => ({
  SessionModel: {
    findOne: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

jest.mock('@/services/InMemoryCache', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    invalidate: jest.fn(),
  },
  CacheKey: {
    session: (sessionId: string) => ({ key: `session:${sessionId}`, ttl: 60_000 }),
  },
}));

const mockSession = {
  _id: 'doc-1',
  sessionId: 'sess-abc',
  userId: 'user-1',
  userRoles: [],
  companyId: 'comp-1',
  expiresAt: new Date(Date.now() + 60_000),
};

describe('SessionRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findBySessionId', () => {
    it('should return cached session on cache hit without querying MongoDB', async () => {
      (InMemoryCache.get as jest.Mock).mockReturnValue(mockSession);

      const result = await SessionRepository.findBySessionId('sess-abc');

      expect(result).toBe(mockSession);
      expect(InMemoryCache.get).toHaveBeenCalledWith(CacheKey.session('sess-abc'));
      expect(SessionModel.findOne).not.toHaveBeenCalled();
    });

    it('should query MongoDB on cache miss and cache the result', async () => {
      (InMemoryCache.get as jest.Mock).mockReturnValue(null);
      (SessionModel.findOne as jest.Mock).mockResolvedValue(mockSession);

      const result = await SessionRepository.findBySessionId('sess-abc');

      expect(result).toBe(mockSession);
      expect(SessionModel.findOne).toHaveBeenCalledWith({
        sessionId: 'sess-abc',
        expiresAt: { $gt: expect.any(Date) },
      });
      expect(InMemoryCache.set).toHaveBeenCalledWith(CacheKey.session('sess-abc'), mockSession);
    });

    it('should not cache when session is not found in MongoDB', async () => {
      (InMemoryCache.get as jest.Mock).mockReturnValue(null);
      (SessionModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await SessionRepository.findBySessionId('sess-missing');

      expect(result).toBeNull();
      expect(InMemoryCache.set).not.toHaveBeenCalled();
    });
  });

  describe('deleteBySessionId', () => {
    it('should invalidate the cache entry before deleting from MongoDB', async () => {
      (SessionModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      await SessionRepository.deleteBySessionId('sess-abc');

      expect(InMemoryCache.invalidate).toHaveBeenCalledWith(CacheKey.session('sess-abc').key);
      expect(SessionModel.deleteOne).toHaveBeenCalledWith({ sessionId: 'sess-abc' });
    });
  });

  describe('deleteAllUserSessions', () => {
    it('should invalidate all cached sessions for the user then delete', async () => {
      const sessions = [{ sessionId: 'sess-1' }, { sessionId: 'sess-2' }];
      const mockFind = { select: jest.fn().mockResolvedValue(sessions) };
      (SessionModel.find as jest.Mock).mockReturnValue(mockFind);
      (SessionModel.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 2 });

      await SessionRepository.deleteAllUserSessions('user-1');

      expect(SessionModel.find).toHaveBeenCalledWith({ userId: 'user-1' });
      expect(mockFind.select).toHaveBeenCalledWith('sessionId');
      expect(InMemoryCache.invalidate).toHaveBeenCalledWith(CacheKey.session('sess-1').key);
      expect(InMemoryCache.invalidate).toHaveBeenCalledWith(CacheKey.session('sess-2').key);
      expect(InMemoryCache.invalidate).toHaveBeenCalledTimes(2);
      expect(SessionModel.deleteMany).toHaveBeenCalledWith({ userId: 'user-1' });
    });

    it('should handle user with no sessions gracefully', async () => {
      const mockFind = { select: jest.fn().mockResolvedValue([]) };
      (SessionModel.find as jest.Mock).mockReturnValue(mockFind);
      (SessionModel.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      await SessionRepository.deleteAllUserSessions('user-none');

      expect(InMemoryCache.invalidate).not.toHaveBeenCalled();
      expect(SessionModel.deleteMany).toHaveBeenCalledWith({ userId: 'user-none' });
    });
  });

  describe('updateCompanyId', () => {
    it('should invalidate the cache entry before updating MongoDB', async () => {
      (SessionModel.findOneAndUpdate as jest.Mock).mockResolvedValue({ ...mockSession, companyId: 'comp-new' });

      await SessionRepository.updateCompanyId('sess-abc', 'comp-new');

      expect(InMemoryCache.invalidate).toHaveBeenCalledWith(CacheKey.session('sess-abc').key);
      expect(SessionModel.findOneAndUpdate).toHaveBeenCalledWith(
        { sessionId: 'sess-abc' },
        { companyId: 'comp-new' },
        { returnDocument: 'after' },
      );
    });
  });

  describe('updateLastAccessed', () => {
    it('should update lastAccessedAt in MongoDB without touching the cache', async () => {
      (SessionModel.findOneAndUpdate as jest.Mock).mockResolvedValue(mockSession);

      await SessionRepository.updateLastAccessed('sess-abc');

      expect(SessionModel.findOneAndUpdate).toHaveBeenCalledWith(
        { sessionId: 'sess-abc' },
        { lastAccessedAt: expect.any(Date) },
        { returnDocument: 'after' },
      );
      expect(InMemoryCache.invalidate).not.toHaveBeenCalled();
    });
  });

  describe('updateWorkosSessionId', () => {
    it('should update the WorkOS session ID in MongoDB', async () => {
      (SessionModel.findOneAndUpdate as jest.Mock).mockResolvedValue(mockSession);

      await SessionRepository.updateWorkosSessionId('sess-abc', 'wos-123');

      expect(SessionModel.findOneAndUpdate).toHaveBeenCalledWith(
        { sessionId: 'sess-abc' },
        { workosSessionId: 'wos-123' },
        { returnDocument: 'after' },
      );
    });
  });

  describe('deleteExpiredSessions', () => {
    it('should delete sessions with expiresAt in the past', async () => {
      (SessionModel.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 5 });

      await SessionRepository.deleteExpiredSessions();

      expect(SessionModel.deleteMany).toHaveBeenCalledWith({
        expiresAt: { $lt: expect.any(Date) },
      });
    });
  });
});
