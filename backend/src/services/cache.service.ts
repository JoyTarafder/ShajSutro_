import { getRedisClient, isRedisReady } from "../config/redis";

export class CacheService {
  /**
   * Fetch item from Redis cache. Returns null if not found or Redis is offline.
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      if (!isRedisReady()) return null;
      const client = getRedisClient();
      if (!client) return null;

      const data = await client.get(key);
      if (!data) return null;

      return JSON.parse(data) as T;
    } catch (err) {
      console.warn(`[CacheService.get] Error reading key "${key}":`, (err as Error).message);
      return null;
    }
  }

  /**
   * Store item in Redis cache with TTL in seconds (default 10 mins = 600s).
   */
  static async set(key: string, value: unknown, ttlSeconds = 600): Promise<void> {
    try {
      if (!isRedisReady()) return;
      const client = getRedisClient();
      if (!client) return;

      const serialized = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await client.set(key, serialized, "EX", ttlSeconds);
      } else {
        await client.set(key, serialized);
      }
    } catch (err) {
      console.warn(`[CacheService.set] Error caching key "${key}":`, (err as Error).message);
    }
  }

  /**
   * Delete a single key from Redis.
   */
  static async del(key: string): Promise<void> {
    try {
      if (!isRedisReady()) return;
      const client = getRedisClient();
      if (!client) return;

      await client.del(key);
    } catch (err) {
      console.warn(`[CacheService.del] Error deleting key "${key}":`, (err as Error).message);
    }
  }

  /**
   * Delete all keys matching a pattern safely using SCAN (non-blocking).
   */
  static async delPattern(pattern: string): Promise<void> {
    try {
      if (!isRedisReady()) return;
      const client = getRedisClient();
      if (!client) return;

      let cursor = "0";
      do {
        const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await client.del(...keys);
        }
      } while (cursor !== "0");
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
