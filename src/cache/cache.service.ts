import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Set a value in cache with optional TTL
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete a value from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Clear all cache
   */
  async reset(): Promise<void> {
    try {
      const manager = this.cacheManager as any;
      if (typeof manager.reset === 'function') {
        await manager.reset();
      } else if (manager.store && typeof manager.store.reset === 'function') {
        await manager.store.reset();
      }
    } catch (error) {
      this.logger.error('Cache reset error:', error);
    }
  }

  /**
   * Generate cache key with namespace
   */
  generateKey(namespace: string, ...parts: (string | number)[]): string {
    return `${namespace}:${parts.join(':')}`;
  }

  /**
   * Cache user-specific data
   */
  async cacheUserData(userId: string, key: string, data: any, ttl?: number): Promise<void> {
    const cacheKey = this.generateKey('user', userId, key);
    await this.set(cacheKey, data, ttl);
  }

  /**
   * Get user-specific cached data
   */
  async getUserData<T>(userId: string, key: string): Promise<T | undefined> {
    const cacheKey = this.generateKey('user', userId, key);
    return this.get<T>(cacheKey);
  }

  /**
   * Invalidate user cache
   */
  async invalidateUserCache(userId: string): Promise<void> {
    // Note: This is a simplified version. In production with Redis, you might want
    // to use pattern-based deletion if supported
    const patterns = [
      'analytics',
      'statistics',
      'dashboard',
      'profile',
    ];

    for (const pattern of patterns) {
      await this.del(this.generateKey('user', userId, pattern));
    }
  }

  /**
   * Cache AI response
   */
  async cacheAIResponse(queryHash: string, response: any, ttl: number = 3600): Promise<void> {
    const cacheKey = this.generateKey('ai', 'response', queryHash);
    await this.set(cacheKey, response, ttl);
  }

  /**
   * Get cached AI response
   */
  async getCachedAIResponse<T>(queryHash: string): Promise<T | undefined> {
    const cacheKey = this.generateKey('ai', 'response', queryHash);
    return this.get<T>(cacheKey);
  }

  /**
   * Cache analytics data
   */
  async cacheAnalytics(userId: string, type: string, data: any, ttl: number = 600): Promise<void> {
    const cacheKey = this.generateKey('analytics', userId, type);
    await this.set(cacheKey, data, ttl);
  }

  /**
   * Get cached analytics
   */
  async getCachedAnalytics<T>(userId: string, type: string): Promise<T | undefined> {
    const cacheKey = this.generateKey('analytics', userId, type);
    return this.get<T>(cacheKey);
  }
}
