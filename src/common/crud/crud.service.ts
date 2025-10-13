import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository, FindOptionsWhere, FindManyOptions, DataSource, QueryRunner, ObjectLiteral, EntityManager } from 'typeorm';
import { IPaginatedResponse } from 'shared/interfaces';
import { ICrudService } from './interfaces/crud.interface';
import { CrudOptions } from 'shared/decorators';
import { CrudEventService } from './services/crud-event.service';
import { CrudEvent } from 'shared/interfaces/crud-events.interface';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class CrudService<T extends ObjectLiteral> implements ICrudService<T> {
  private readonly logger = new LoggerService(CrudService.name);
  protected readonly repository: Repository<T>;
  protected readonly dataSource: DataSource;
  protected readonly eventService: CrudEventService;
  protected options: CrudOptions;
  constructor(
    repository: Repository<T>,
    dataSource: DataSource,
    eventService: CrudEventService,
    options?: CrudOptions, // ✅ optional, child can pass this
  ) {
    this.repository = repository;
    this.dataSource = dataSource;
    this.eventService = eventService;

    // ✅ Merge default + custom options directly here
    this.options = {
      pagination: { defaultLimit: 10, maxLimit: 100 },
      defaultSort: { field: 'createdAt', order: 'DESC' },
      searchableFields: ['email'],
      ...options,
    };
  }


  setOptions(options: CrudOptions) {
    // Merge provided options with defaults instead of replacing
    this.options = {
      ...this.options,
      ...options
    }
  }

  /**
   * Create a new entity with relation management and event emission
   */
  async create<TCreateDto>(createDto: TCreateDto): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Emit before create event
      await this.emitEvent('before:create', null, createDto);

      const entity = this.repository.create(createDto as any);
      const savedEntity = await queryRunner.manager.save(entity);
      const finalEntity = Array.isArray(savedEntity) ? savedEntity[0] : savedEntity;

      await queryRunner.commitTransaction();

      // Get the complete entity with relations for return
      const completeEntity = await this.getSingle(finalEntity.id);

      // Emit after create event
      await this.emitEvent('create', completeEntity, createDto);

      return completeEntity;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error creating entity: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create entity: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update an existing entity with relation management and event emission
   */
  async update<TUpdateDto>(key: string | number | Record<string, any>, updateDto: TUpdateDto, callback?: (entity: T, manager: EntityManager) => Promise<void>): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {

      const existingEntity = await this.getSingle(key);
      if (callback) {
        await callback(existingEntity, queryRunner.manager);
      }

      // Emit before update event
      await this.emitEvent('before:update', existingEntity, updateDto);

      await queryRunner.manager.update(this.repository.target, existingEntity.id, updateDto as any);
      await queryRunner.commitTransaction();

      // Get updated entity with relations for return
      const updatedEntity = await this.getSingle(existingEntity.id);

      // Emit after update event
      await this.emitEvent('update', updatedEntity, updateDto);

      return updatedEntity;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error updating entity: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to update entity: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }



  /**
   * Get all entities without pagination
   */
  async getAll<TQueryDto>(queryDto: TQueryDto, options?: { relations?: string[]; select?: string[] }): Promise<T[]> {
    try {
      const {
        search,
        sortBy = this.options.defaultSort?.field || 'createdAt',
        sortOrder = this.options.defaultSort?.order || 'DESC',

        ...filters
      } = queryDto as any;

      const query = this.repository.createQueryBuilder('entity');

      const { relations = [], select = [] } = options || {};
      // Add relations
      if (relations.length > 0) {
        relations.forEach(relation => {
          query.leftJoinAndSelect(`entity.${relation}`, relation);
        });
      }

      // Add select fields
      if (select.length > 0) {
        query.select(select.map(field => `entity.${field}`));
      }

      // Apply search if provided
      if (search) {
        const searchableFields = this.options.searchableFields || [];
        if (searchableFields.length > 0) {
          // Check if we need to join relations for search
          const relationsNeeded = new Set<string>();
          searchableFields.forEach(field => {
            if (field.includes('.')) {
              const [relationName] = field.split('.');
              relationsNeeded.add(relationName);
            }
          });

          // Join relations needed for search
          relationsNeeded.forEach(relationName => {
            query.leftJoin(`entity.${relationName}`, relationName);
          });

          const searchConditions = searchableFields
            .map(field => {
              // Handle nested fields (e.g., profile.firstName)
              if (field.includes('.')) {
                const [relationName, relationField] = field.split('.');
                return `${relationName}.${relationField} ILIKE :search`;
              } else {
                // Handle direct entity fields
                return `entity.${field} ILIKE :search`;
              }
            })
            .join(' OR ');
          query.andWhere(`(${searchConditions})`, { search: `%${search}%` });
        }
      }

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            query.andWhere(`entity.${key} IN (:...${key})`, { [key]: value });
          } else {
            query.andWhere(`entity.${key} = :${key}`, { [key]: value });
          }
        }
      });

      // Apply sorting
      const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      query.orderBy(`entity.${sortBy}`, sortDirection as 'ASC' | 'DESC');

      return await query.getMany();

    } catch (error) {
      this.logger.error(`Error getting all entities without pagination: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to retrieve entities: ${error.message}`);
    }
  }

  /**
   * Get entities with pagination (internal method)
   */
  async get<TQueryDto>(queryDto: TQueryDto, options?: {
    relations?: {
      name: string;
      select: string[];
      searchableFields: string[];
    }[]; select?: string[]
  }): Promise<IPaginatedResponse<T>> {
    try {
      const {
        page = 1,
        limit = this.options.pagination?.defaultLimit || 10,
        search,
        sortBy = this.options.defaultSort?.field || 'createdAt',
        sortOrder = this.options.defaultSort?.order || 'DESC',
        ...filters
      } = queryDto as any;

      // Validate pagination limits
      const maxLimit = this.options.pagination?.maxLimit || 100;
      const validatedLimit = Math.min(limit, maxLimit);
      const skip = (page - 1) * validatedLimit;

      const query = this.repository.createQueryBuilder('entity');

      const { relations = [] as { name: string; select: string[], searchableFields: string[] }[], 
      select = [] } = options || {};
      // Add relations
      if (relations.length > 0) {
        relations.forEach(relation => {
          query.leftJoin(`entity.${relation.name}`, relation.name);
          if (relation.select.length > 0) {
            query.addSelect(relation.select.map(field => `${relation.name}.${field}`));
          } else {
            query.addSelect(`${relation.name}`);
          }

          if (relation.searchableFields.length > 0 && search) {
            relation.searchableFields.forEach(field => {
              query.orWhere(`${relation.name}.${field} ILIKE :search`, { search: `%${search}%` });
            });
          }
        });


      }

      // Add select fields
      if (select.length > 0) {
        query.select(select.map(field => `entity.${field}`));
      }

      // Apply search if provided
      if (search) {
        const searchableFields = this.options.searchableFields || [];
        if (searchableFields.length > 0) {
          const searchConditions = searchableFields
            .map(field => `entity.${field} ILIKE :search`)
            .join(' OR ');
          query.andWhere(`(${searchConditions})`, { search: `%${search}%` });
        }
      }

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            query.andWhere(`entity.${key} IN (:...${key})`, { [key]: value });
          } else {
            query.andWhere(`entity.${key} = :${key}`, { [key]: value });
          }
        }
      });

      // Apply sorting
      const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      query.orderBy(`entity.${sortBy}`, sortDirection as 'ASC' | 'DESC');

      const [data, total] = await query
        .skip(skip)
        .take(validatedLimit)
        .getManyAndCount();

      const lastPage = Math.ceil(total / validatedLimit);

      return {
        data,
        total,
        page,
        limit: validatedLimit,
        lastPage,
        hasNextPage: page < lastPage,
        hasPrevPage: page > 1,
      };

    } catch (error) {
      this.logger.error(`Error getting all entities: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to retrieve entities: ${error.message}`);
    }
  }

  /**
   * Get a single entity by any key with nested support (NO pagination)
   */
  async getSingle(key: string | number | Record<string, any>, options?: { relations?: string[]; select?: string[] }): Promise<T> {
    try {
      let whereCondition: FindOptionsWhere<T>;

      // Handle different key types
      if (typeof key === 'string' || typeof key === 'number') {
        // If key is string or number, assume it's an ID
        whereCondition = { id: key } as unknown as FindOptionsWhere<T>;
      } else if (typeof key === 'object' && key !== null) {
        // If key is an object, use it as where condition with nested support
        whereCondition = this.buildNestedWhereCondition(key);
      } else {
        throw new BadRequestException('Invalid key provided for getSingle');
      }

      const findOptions: FindManyOptions<T> = {
        where: whereCondition,
      };

      const { relations = [], select = [] } = options || {};

      if (relations.length > 0) {
        findOptions.relations = relations;
      }

      if (select.length > 0) {
        findOptions.select = select as (keyof T)[];
      }

      const entity = await this.repository.findOne(findOptions);

      if (!entity) {
        const keyDescription = typeof key === 'object' ? JSON.stringify(key) : key;
        throw new NotFoundException(`Entity with key ${keyDescription} not found`);
      }

      return entity;

    } catch (error) {
      this.logger.error(`Error getting single entity: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to retrieve entity: ${error.message}`);
    }
  }

  /**
   * Delete an entity by ID and return the deleted entity
   */
  async delete(key: string | number | Record<string, any>): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      const existingEntity = await this.getSingle(key);

      // Emit before delete event
      await this.emitEvent('before:delete', existingEntity);


      await queryRunner.manager.delete(this.repository.target, existingEntity.id);
      await queryRunner.commitTransaction();

      // Emit after delete event
      await this.emitEvent('delete', existingEntity);

      return existingEntity;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error deleting entity: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to delete entity: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get repository for the entity
   */
  getRepository(): Repository<T> {
    return this.repository;
  }

  /**
   * Emit CRUD events
   */
  private async emitEvent(operation: string, entity: T | null, data?: any): Promise<void> {
    try {
      const event: CrudEvent<T> = {
        operation: operation as any,
        entity: entity as T,
        entityId: entity ? (entity as any).id : undefined,
        data,
        timestamp: new Date(),
      };

      await this.eventService.emit(event);
    } catch (error) {
      this.logger.error(`Error emitting ${operation} event: ${error.message}`, error.stack);
      // Don't throw error for event emission failures
    }
  }


  /**
   * Build nested where condition for complex queries
   */
  private buildNestedWhereCondition(key: Record<string, any>): FindOptionsWhere<T> {
    const whereCondition: any = {};

    for (const [field, value] of Object.entries(key)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Handle nested objects (relations)
        whereCondition[field] = this.buildNestedWhereCondition(value);
      } else if (Array.isArray(value)) {
        // Handle array values (IN queries)
        whereCondition[field] = value;
      } else if (typeof value === 'string' && value.includes('%')) {
        // Handle LIKE queries
        whereCondition[field] = value;
      } else {
        // Handle simple equality
        whereCondition[field] = value;
      }
    }

    return whereCondition as FindOptionsWhere<T>;
  }
}