import { LoggerService } from '@/common/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Resource } from '../entities/resource.entity';
import { ResourcesService } from '../services/resources.service';

@Injectable()
export class ResourceSeed {
  private readonly logger = new LoggerService(ResourceSeed.name);
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly dataSource: DataSource,
  ) {}

  async run(): Promise<void> {
    this.logger.log('🌱 Starting resource seeding...');

    const entities = this.dataSource.entityMetadatas;
    const resources: Partial<Resource>[] = [];

    for (const entity of entities) {
      // Skip system tables and our permission tables
      if (this.shouldSkipEntity(entity.name)) {
        continue;
      }

      const resource: Partial<Resource> = {
        name: entity.tableName,
        entityName: entity.name,
        displayName: this.getDisplayName(entity.name),
        description: this.getDescription(entity.name),
        isActive: true,
      };

      resources.push(resource);
    }

    // Insert or update resources using service
    for (const resource of resources) {
      try {
        // Try to find existing resource
        const existingResource = await this.resourcesService
          .getSingle({ name: resource.name })
          .catch(() => null);

        if (existingResource) {
          this.logger.log(`Resource already exists: ${resource.name}`);
        } else {
          // Create new resource using service
          await this.resourcesService.create(resource);
          this.logger.log(`Created resource: ${resource.name}`);
        }
      } catch (error: unknown) {
        this.logger.error(
          `Error creating resource ${resource.name}:`,
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    this.logger.log(`✅ Seeded ${resources.length} resources`);
  }

  /**
   * Check if entity should be skipped
   */
  private shouldSkipEntity(entityName: string): boolean {
    const skipList = [
      'Resource',
      'Role',
      'Permission',
      'ActivityLog', // Skip activity logs as they're system-generated
    ];

    return skipList.includes(entityName);
  }

  /**
   * Get display name for entity
   */
  private getDisplayName(entityName: string): string {
    const displayNames: Record<string, string> = {};

    return displayNames[entityName] || entityName;
  }

  /**
   * Get description for entity
   */
  private getDescription(entityName: string): string {
    const descriptions: Record<string, string> = {};

    return descriptions[entityName] || `${entityName} entity management`;
  }
}
