import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { Resource } from '../entities/resource.entity';

@Injectable()
export class ResourceSeeder {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Seed all entities as resources
   */
  async seed(): Promise<void> {
    console.log('🌱 Starting resource seeding...');

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

    // Insert or update resources
    for (const resource of resources) {
      await this.resourceRepository.upsert(
        resource,
        ['name'] // Conflict resolution on name
      );
    }

    console.log(`✅ Seeded ${resources.length} resources`);
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
    const displayNames: Record<string, string> = {
   };

    return displayNames[entityName] || entityName;
  }

  /**
   * Get description for entity
   */
  private getDescription(entityName: string): string {
    const descriptions: Record<string, string> = {
    };

    return descriptions[entityName] || `${entityName} entity management`;
  }
}
