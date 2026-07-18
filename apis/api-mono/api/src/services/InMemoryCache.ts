/**
 * Typed cache key builders.
 *
 * Every cache key in the application MUST be constructed via one of these
 * builders. This makes it trivial to find all read/write/invalidation sites
 * for a given cache type via "Find All References".
 *
 * To add a new cache type, add a new entry here — do NOT use raw strings.
 */
export interface CacheKeyEntry {
  key: string;
  ttl: number;
}

export const CacheKey = {
  /** Session lookup by sessionId. */
  session: (sessionId: string): CacheKeyEntry => ({ key: `session:${sessionId}`, ttl: 60_000 }),
} as const;

/**
 * InMemoryCache
 *
 * Lightweight in-process cache with TTL expiry and explicit invalidation.
 * Designed to reduce MongoDB load for frequently-read, rarely-written data
 * such as sessions, company records, and membership lookups.
 *
 * Single-instance skeleton: no cross-pod broadcast — each `invalidate*`
 * call only evicts from this process's cache, and TTL bounds staleness
 * if an eviction site is ever missed.
 */
class InMemoryCache {
  private store = new Map<string, { value: any; expiresAt: number }>();
  private cleanupIntervalMs = 60_000;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startCleanupTimer();
  }

  /**
   * Retrieve a cached value. Returns null on miss or expiry.
   */
  get<T>(key: string | CacheKeyEntry): T | null {
    const k = typeof key === 'string' ? key : key.key;
    const entry = this.store.get(k);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt < Date.now()) {
      this.store.delete(k);
      return null;
    }
    return entry.value as T;
  }

  /**
   * Store a value with a TTL in milliseconds.
   * TTL is taken from the CacheKeyEntry.
   */
  set(key: CacheKeyEntry, value: any): void {
    this.store.set(key.key, { value, expiresAt: Date.now() + key.ttl });
  }

  /**
   * Remove a single cache entry by exact key.
   */
  invalidate(key: string): void {
    this.store.delete(key);
  }

  /**
   * Remove all cache entries whose key starts with the given prefix.
   * Use for broad invalidation, e.g. all entries for a companyId.
   */
  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Remove all cache entries whose key contains the given fragment.
   * Use for scoped invalidation when the fragment isn't a prefix, e.g.
   * userId in the middle of a key.
   */
  invalidateByKeyFragment(fragment: string): void {
    for (const key of this.store.keys()) {
      if (key.includes(fragment)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Current number of entries (for monitoring/tests).
   */
  get size(): number {
    return this.store.size;
  }

  /**
   * Periodically evict expired entries to prevent unbounded memory growth.
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store) {
        if (entry.expiresAt < now) {
          this.store.delete(key);
        }
      }
    }, this.cleanupIntervalMs);

    // Allow the process to exit without waiting for the timer
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Tear down the cleanup timer. Used in tests.
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.store.clear();
  }
}

export default new InMemoryCache();
