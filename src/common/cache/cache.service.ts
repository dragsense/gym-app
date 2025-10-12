import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service';

export interface CacheOptions {
  ttl?: number; // seconds
  prefix?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  clears: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new LoggerService(CacheService.name);
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    clears: 0,
  };

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  private getPrefixedKey(key: string, prefix?: string): string {
    const defaultPrefix = this.configService.get<string>('cache.prefix', 'app');
    const keyPrefix = prefix || defaultPrefix;
    return `${keyPrefix}:${key}`;
  }

  private getDefaultTTL(): number {
    return this.configService.get<number>('cache.defaultTtl', 300);
  }

  async get<T = any>(key: string, options?: CacheOptions): Promise<T | null> {
    const prefixedKey = this.getPrefixedKey(key, options?.prefix);
    try {
      const value = await this.cacheManager.get<T>(prefixedKey);
      if (value !== undefined && value !== null) {
        this.stats.hits++;
        return value;
      }
      this.stats.misses++;
      return null;
    } catch (error) {
      this.logger.error(`Cache GET error for ${prefixedKey}`, error);
      return null;
    }
  }

  async set<T = any>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const prefixedKey = this.getPrefixedKey(key, options?.prefix);
    const ttl = options?.ttl ?? this.getDefaultTTL();
    try {
      await this.cacheManager.set(prefixedKey, value, ttl * 1000); // ms
      this.stats.sets++;
    } catch (error) {
      this.logger.error(`Cache SET error for ${prefixedKey}`, error);
    }
  }

  async del(key: string, options?: CacheOptions): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key, options?.prefix);
    try {
      await this.cacheManager.del(prefixedKey);
      this.stats.deletes++;
      return true;
    } catch (error) {
      this.logger.error(`Cache DELETE error for ${prefixedKey}`, error);
      return false;
    }
  }

  /**
   * Safely clear cache depending on store type (Redis, Dragonfly, Memory)
   */
  async clear(): Promise<void> {
    try {
      const manager = this.cacheManager as any; // Bypass typing
      const store = manager.store ?? manager.stores?.[0];

      if (store && typeof store.reset === 'function') {
        await store.reset();
        this.logger.debug('✅ Cache store reset executed');
      } else if (typeof manager.reset === 'function') {
        await manager.reset();
        this.logger.debug('✅ Cache manager reset executed');
      } else {
        this.logger.warn('⚠️ No reset() method found on cache store — skipping clear');
      }

      this.stats.clears++;
    } catch (error) {
      this.logger.error('Cache CLEAR error', error);
    }
  }

  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    const val = await this.get(key, options);
    return val !== null && val !== undefined;
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, options?: CacheOptions): Promise<T> {
    const cached = await this.get<T>(key, options);
    if (cached) return cached;
    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  getHitRatio(): number {
    const total = this.stats.hits + this.stats.misses;
    return total === 0 ? 0 : (this.stats.hits / total) * 100;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const testKey = 'health-check';
      const testValue = 'ok';
      
      await this.set(testKey, testValue, { ttl: 10 });
      const retrieved = await this.get(testKey);
      await this.del(testKey);
      
      return retrieved === testValue;
    } catch (error) {
      this.logger.error('Cache health check failed', error);
      return false;
    }
  }
}
