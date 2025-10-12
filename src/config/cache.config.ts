import { registerAs } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';

export default registerAs('cache', () => ({
  host: process.env.CACHE_HOST || process.env.DRAGONFLY_HOST || 'localhost',
  port: parseInt(process.env.CACHE_PORT || process.env.DRAGONFLY_PORT || '6379', 10),
  password: process.env.CACHE_PASSWORD || process.env.DRAGONFLY_PASSWORD,
  db: parseInt(process.env.CACHE_DB || process.env.DRAGONFLY_DB || '1', 10),
  defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL || '300', 10), // seconds
  maxItems: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10),
  prefix: process.env.CACHE_PREFIX || 'app',
  enabled: process.env.CACHE_ENABLED !== 'false',
}));

export const getCacheConfig = async (configService: ConfigService) => {
  const cacheConfig = configService.get('cache');

  // ✅ When cache disabled -> use in-memory fallback
  if (!cacheConfig.enabled) {
    return {
      store: 'memory',
      ttl: cacheConfig.defaultTtl * 1000, // Convert to milliseconds
      max: cacheConfig.maxItems,
    };
  }

  // ✅ When using Dragonfly (Redis-compatible)
  const store = await redisStore({
    host: cacheConfig.host,
    port: cacheConfig.port,
    password: cacheConfig.password,
    db: cacheConfig.db,
    ttl: cacheConfig.defaultTtl * 1000, // Convert to milliseconds
    keyPrefix: `${cacheConfig.prefix}:`,
    maxRetriesPerRequest: 5,
    connectTimeout: 5000,
    enableReadyCheck: true,
  });

  return { store };
};