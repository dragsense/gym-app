import { Injectable, ExecutionContext } from '@nestjs/common';
import { DatabaseManager, TenantContext } from './database-manager.service';
import { Repository } from 'typeorm';

/**
 * Transparent Entity Router - Automatically routes entities to correct database/schema
 * No need to manually specify which database to use
 */
@Injectable()
export class EntityRouterService {
  constructor(private readonly databaseManager: DatabaseManager) {}

  /**
   * Extract tenant context from request
   */
  extractTenantContext(context: ExecutionContext): TenantContext | undefined {
    const request = context.switchToHttp().getRequest();
    
    // Try to get tenant ID from various sources
    const tenantId = 
      request.headers['x-tenant-id'] ||
      request.headers['tenant-id'] ||
      request.user?.tenantId ||
      request.user?.organizationId ||
      request.params?.tenantId;

    if (!tenantId) {
      return undefined;
    }

    return {
      tenantId: String(tenantId),
      organizationId: request.user?.organizationId,
    };
  }

  /**
   * Get repository with automatic tenant routing
   */
  getRepository<T extends Record<string, any>>(entity: any, context?: TenantContext): Repository<T> {
    return this.databaseManager.getRepository<T>(entity, context);
  }

  /**
   * Get read-only repository (replica)
   */
  getReadOnlyRepository<T extends Record<string, any>>(entity: any, context?: TenantContext): Repository<T> {
    return this.databaseManager.getReadOnlyRepository<T>(entity, context);
  }

  /**
   * Get archive repository
   */
  getArchiveRepository<T extends Record<string, any>>(entity: any, context?: TenantContext): Repository<T> {
    return this.databaseManager.getArchiveRepository<T>(entity, context);
  }

  /**
   * Execute query with automatic routing
   */
  async executeQuery(query: string, parameters: any[] = [], context?: TenantContext) {
    return this.databaseManager.executeQuery(query, parameters, context);
  }

  /**
   * Create tenant resources when new tenant registers
   */
  async createTenantResources(tenantId: string): Promise<void> {
    return this.databaseManager.createTenantResources(tenantId);
  }

  /**
   * Check if tenant exists
   */
  async tenantExists(tenantId: string): Promise<boolean> {
    return this.databaseManager.tenantExists(tenantId);
  }

  /**
   * Get current database mode
   */
  getMode() {
    return this.databaseManager.getMode();
  }
}
