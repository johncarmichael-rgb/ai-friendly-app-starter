import NodegenRequest from '@/http/interfaces/NodegenRequest';
import express from 'express';

/**
 * Required by the generated http/ layer (apiCaching middleware).
 * All actual caching is handled directly via InMemoryCache.
 */
class CacheService {
  public middleware(req: NodegenRequest, res: express.Response, next: express.NextFunction, transformOutputMap: any) {
    next();
  }
}

export default new CacheService();
