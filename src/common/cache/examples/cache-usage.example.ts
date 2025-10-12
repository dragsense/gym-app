import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache.service';
import { Cache, CacheEvict, CachePut } from '../../../decorators/cache.decorator';

@Injectable()
export class ExampleService {
  constructor(private readonly cacheService: CacheService) {}

  // Example 1: Basic cache usage
  async getUserData(userId: string): Promise<any> {
    const cacheKey = `user:${userId}`;
    
    // Try to get from cache first
    let userData = await this.cacheService.get(cacheKey);
    
    if (!userData) {
      // If not in cache, fetch from database
      userData = await this.fetchUserFromDatabase(userId);
      
      // Store in cache for 5 minutes
      await this.cacheService.set(cacheKey, userData, { ttl: 300 });
    }
    
    return userData;
  }

  // Example 2: Using getOrSet pattern
  async getUserProfile(userId: string): Promise<any> {
    return this.cacheService.getOrSet(
      `user:profile:${userId}`,
      () => this.fetchUserProfileFromDatabase(userId),
      { ttl: 600 } // 10 minutes
    );
  }

  // Example 3: Using decorators
  @Cache('user:stats:{userId}', 300) // Cache for 5 minutes
  async getUserStats(userId: string): Promise<any> {
    // This method will be automatically cached
    return this.calculateUserStats(userId);
  }

  // Example 4: Cache eviction
  @CacheEvict(['user:{userId}', 'user:profile:{userId}'])
  async updateUser(userId: string, userData: any): Promise<any> {
    // This will clear cache entries for this user
    const updatedUser = await this.updateUserInDatabase(userId, userData);
    return updatedUser;
  }

  // Example 5: Cache put (update cache after operation)
  @CachePut('user:latest:{userId}', 300)
  async createUserActivity(userId: string, activity: any): Promise<any> {
    // This will update the cache with the new activity
    return this.saveUserActivity(userId, activity);
  }

  // Example 6: Batch operations (manual implementation)
  async getMultipleUsers(userIds: string[]): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    for (const id of userIds) {
      result[id] = await this.cacheService.get(`user:${id}`);
    }
    return result;
  }

  // Example 7: Cache statistics
  async getCacheStats(): Promise<any> {
    const stats = this.cacheService.getStats();
    const hitRatio = this.cacheService.getHitRatio();
    
    return {
      ...stats,
      hitRatio: `${hitRatio.toFixed(2)}%`,
    };
  }

  // Example 8: Health check
  async isCacheHealthy(): Promise<boolean> {
    return this.cacheService.healthCheck();
  }

  // Private methods (simulate database operations)
  private async fetchUserFromDatabase(userId: string): Promise<any> {
    // Simulate database call
    return { id: userId, name: `User ${userId}`, email: `user${userId}@example.com` };
  }

  private async fetchUserProfileFromDatabase(userId: string): Promise<any> {
    // Simulate database call
    return { id: userId, profile: { bio: 'User bio', avatar: 'avatar.jpg' } };
  }

  private async calculateUserStats(userId: string): Promise<any> {
    // Simulate expensive calculation
    return { id: userId, stats: { posts: 10, followers: 100 } };
  }

  private async updateUserInDatabase(userId: string, userData: any): Promise<any> {
    // Simulate database update
    return { id: userId, ...userData, updatedAt: new Date() };
  }

  private async saveUserActivity(userId: string, activity: any): Promise<any> {
    // Simulate saving activity
    return { id: userId, activity, timestamp: new Date() };
  }
}
