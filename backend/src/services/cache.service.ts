import { getRedisClient, isRedisReady } from "../config/redis";

interface MemoryCacheEntry {
  value: any;
  expiresAt: number;
}

// In-memory L1 cache for instant (0ms) response even without Redis
const memoryCache = new Map<string, MemoryCacheEntry>();
const MAX_MEMORY_KEYS = 1000;

// Garbage collect expired memory keys every 3 minutes
if (typeof setInterval !== "undefined") {
  const gcTimer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of memoryCache.entries()) {
      if (v.expiresAt <= now) {
        memoryCache.delete(k);
      }
    }
  }, 180000);
  if (gcTimer && typeof gcTimer.unref === "function") {
    gcTimer.unref();
  }
}

export class CacheService {
  /**
   * Fetch item from L1 Memory or L2 Redis. Returns null if expired or offline.
   */
  static async get<T>(key: string): Promise<T | null> {
    const now = Date.now();

    // 1. Check ultra-fast L1 memory cache first (0ms latency)
    const memItem = memoryCache.get(key);
    if (memItem) {
      if (memItem.expiresAt > now) {
        return memItem.value as T;
      }
      memoryCache.delete(key);
    }

    // 2. Check L2 Redis if available
    try {
      if (isRedisReady()) {
        const client = getRedisClient();
        if (client) {
          const data = await client.get(key);
          if (data) {
            const parsed = JSON.parse(data) as T;
            // Backfill L1 memory cache for next instant read
            memoryCache.set(key, { value: parsed, expiresAt: now + 30000 }); // 30s L1 buffer
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn(`[CacheService.get] Error reading key "${key}":`, (err as Error).message);
    }

    return null;
  }

  /**
   * Store item in L1 Memory and L2 Redis with TTL in seconds (default 10 mins = 600s).
   */
  static async set(key: string, value: unknown, ttlSeconds = 600): Promise<void> {
    const now = Date.now();
    const expiresAt = now + (ttlSeconds > 0 ? ttlSeconds * 1000 : 86400000);

    // 1. Save to L1 Memory cache
    if (memoryCache.size >= MAX_MEMORY_KEYS) {
      // Evict first 100 oldest keys to prevent unbounded memory growth
      let count = 0;
      for (const k of memoryCache.keys()) {
        memoryCache.delete(k);
        if (++count > 100) break;
      }
    }
    memoryCache.set(key, { value, expiresAt });

    // 2. Save to L2 Redis if available
    try {
      if (isRedisReady()) {
        const client = getRedisClient();
        if (client) {
          const serialized = JSON.stringify(value);
          if (ttlSeconds > 0) {
            await client.set(key, serialized, "EX", ttlSeconds);
          } else {
            await client.set(key, serialized);
          }
        }
      }
    } catch (err) {
      console.warn(`[CacheService.set] Error caching key "${key}":`, (err as Error).message);
    }
  }

  /**
   * Delete a single key from both L1 Memory and L2 Redis.
   */
  static async del(key: string): Promise<void> {
    memoryCache.delete(key);

    try {
      if (isRedisReady()) {
        const client = getRedisClient();
        if (client) {
          await client.del(key);
        }
      }
    } catch (err) {
      console.warn(`[CacheService.del] Error deleting key "${key}":`, (err as Error).message);
    }
  }

  /**
   * Delete all keys matching a glob pattern (e.g. "products:*", "categories:*").
   */
  static async delPattern(pattern: string): Promise<void> {
    // 1. Clear matching keys from L1 Memory cache
    const regex = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`);
    for (const k of memoryCache.keys()) {
      if (regex.test(k)) {
        memoryCache.delete(k);
      }
    }

    // 2. Clear matching keys from L2 Redis using non-blocking SCAN
    try {
      if (isRedisReady()) {
        const client = getRedisClient();
        if (client) {
          let cursor = "0";
          do {
            const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
            cursor = nextCursor;
            if (keys.length > 0) {
              await client.del(...keys);
            }
          } while (cursor !== "0");
        }
      }
    } catch (err) {
      console.warn(`[CacheService.delPattern] Error scanning pattern "${pattern}":`, (err as Error).message);
    }
  }

  /**
   * Cache Invalidation Helper: Invalidate category caches and dependent lists.
   */
  static async clearCategoryCache(): Promise<void> {
    await Promise.all([
      CacheService.delPattern("categories:*"),
      CacheService.delPattern("category:*"),
      CacheService.delPattern("products:*"), // Products embed category data & counts
    ]);
  }

  /**
   * Cache Invalidation Helper: Invalidate product caches, single product, and stats.
   */
  static async clearProductCache(productId?: string): Promise<void> {
    const promises: Promise<void>[] = [
      CacheService.delPattern("products:*"),
      CacheService.delPattern("categories:*"), // Product count in categories changed
      CacheService.del("stats:hero"),
    ];

    if (productId) {
      promises.push(CacheService.del(`product:${productId}`));
      promises.push(CacheService.delPattern(`product:${productId}:*`));
    }

    await Promise.all(promises);
  }
}

export default CacheService;
