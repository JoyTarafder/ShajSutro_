import Redis, { RedisOptions } from "ioredis";

let redisClient: Redis | null = null;

const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = parseInt(process.env.REDIS_PORT || "6379", 10);
const redisPassword = process.env.REDIS_PASSWORD || undefined;

export const initRedis = (): Redis | null => {
  if (redisClient) return redisClient;

  // If explicitly disabled in env
  if (process.env.ENABLE_REDIS === "false") {
    console.log("ℹ Redis caching explicitly disabled via ENABLE_REDIS=false");
    return null;
  }

  const options: RedisOptions = {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 4000,
    retryStrategy: (times) => {
      // Limit reconnection retries to avoid spamming logs when Redis is offline
      if (times > 3) {
        return null;
      }
      return Math.min(times * 1000, 3000);
    },
  };

  if (redisPassword) {
    options.password = redisPassword;
  }

  try {
    if (redisUrl) {
      redisClient = new Redis(redisUrl, options);
    } else {
      redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        ...options,
      });
    }

    redisClient.on("connect", () => {
      console.log("✓ Redis connected successfully");
    });

    redisClient.on("error", (err: Error) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[Redis Cache Warning]: ${err.message} (Fallback to MongoDB direct queries)`);
      }
    });

    // Attempt initial async connection without blocking application startup
    redisClient.connect().catch((_err) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[Redis Notice]: Local Redis not found at ${redisUrl || `${redisHost}:${redisPort}`}. Operating in direct MongoDB mode.`);
      }
    });

    return redisClient;
  } catch (error) {
    console.warn("[Redis Init Error]:", error);
    redisClient = null;
    return null;
  }
};

export const getRedisClient = (): Redis | null => {
  if (!redisClient) {
    return initRedis();
  }
  return redisClient;
};

export const isRedisReady = (): boolean => {
  return redisClient !== null && redisClient.status === "ready";
};

export default getRedisClient;
