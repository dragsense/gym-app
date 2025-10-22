/**
 * Usage Examples for Unified Database System
 * 
 * The system automatically handles:
 * - Single Database Mode: Main DB + Auto-Replica + Auto-Archive
 * - Multi-Schema Mode: Main DB + Per-Tenant Schemas + Auto-Replicas + Auto-Archives
 * - Multi-Database Mode: Main DB + Per-Tenant DBs + Auto-Replicas + Auto-Archives
 */

import { Injectable } from '@nestjs/common';
import { EntityRouterService } from './entity-router.service';
import { User } from '@/modules/v1/users/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly entityRouter: EntityRouterService,
  ) {}

  // Example 1: Normal usage - system automatically routes to correct DB/schema
  async findAllUsers(tenantId?: string) {
    const context = tenantId ? { tenantId } : undefined;
    const userRepo = this.entityRouter.getRepository(User, context);
    return userRepo.find();
  }

  // Example 2: Read-only operations (uses replica automatically)
  async findUserStats(tenantId?: string) {
    const context = tenantId ? { tenantId } : undefined;
    const userRepo = this.entityRouter.getReadOnlyRepository(User, context);
    return userRepo.query('SELECT COUNT(*) as total FROM users');
  }

  // Example 3: Archive operations
  async archiveUser(userId: number, tenantId?: string) {
    const context = tenantId ? { tenantId } : undefined;
    
    // Get user from main DB
    const mainRepo = this.entityRouter.getRepository(User, context);
    const user = await mainRepo.findOne({ where: { id: userId } });
    
    if (user) {
      // Move to archive
      const archiveRepo = this.entityRouter.getArchiveRepository(User, context);
      await archiveRepo.save({ ...user, archivedAt: new Date() });
      await mainRepo.remove(user);
    }
  }

  // Example 4: Create new tenant (system auto-creates everything)
  async createNewTenant(tenantId: string) {
    // System automatically creates:
    // - Schema/DB for tenant
    // - Replica for tenant  
    // - Archive for tenant
    await this.entityRouter.createTenantResources(tenantId);
    
    // Now you can use the tenant context
    const userRepo = this.entityRouter.getRepository(User, { tenantId });
    // All operations will automatically route to tenant's schema/DB
  }

  // Example 5: Custom query with automatic routing
  async getTenantData(tenantId: string) {
    return this.entityRouter.executeQuery(
      'SELECT * FROM users WHERE created_at > $1',
      [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)], // Last 30 days
      { tenantId }
    );
  }
}

/**
 * How it works:
 * 
 * 1. Set DB_MODE in environment:
 *    - DB_MODE=single (default)
 *    - DB_MODE=multi-schema  
 *    - DB_MODE=multi-database
 * 
 * 2. System automatically:
 *    - Creates main DB + replica + archive
 *    - Routes entities based on tenant context
 *    - Creates tenant resources when needed
 * 
 * 3. No manual configuration needed:
 *    - Just use entityRouter.getRepository()
 *    - System handles all routing automatically
 * 
 * 4. Tenant context comes from:
 *    - Request headers (x-tenant-id)
 *    - JWT token (tenantId)
 *    - Manual context object
 */
