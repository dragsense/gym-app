import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindManyOptions, DataSource, QueryRunner, ObjectLiteral } from 'typeorm';
import { IPaginatedResponse } from 'shared/interfaces';
import { ICrudService } from './interfaces/crud.interface';
import { CrudOptions, RelationConfig } from 'shared/decorators';
import { CrudEventService } from './services/crud-event.service';
import { CrudEvent } from 'shared/interfaces/crud-events.interface';

// Interfaces are now imported from shared/decorators

@Injectable()
export class CrudService<T extends ObjectLiteral> implements ICrudService<T> {
  private readonly logger = new Logger(CrudService.name);
  private queryRunner: QueryRunner;

  constructor(
    @InjectRepository(Repository<T>)
    private readonly repository: Repository<T>,
    private readonly dataSource: DataSource,
    private readonly eventService: CrudEventService,
    private readonly options: CrudOptions = {}
  ) {
    this.queryRunner = this.dataSource.createQueryRunner();
  }

  /**
   * Create a new entity with relation management and event emission
   */
  async create<TCreateDto>(createDto: TCreateDto): Promise<T> {
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();

    try {
      // Emit before create event
      await this.emitEvent('before:create', null, createDto);

      // Handle relations before creating main entity
      const processedDto = await this.handleRelations(createDto, 'create');
      
      const entity = this.repository.create(processedDto as any);
      const savedEntity = await this.queryRunner.manager.save(entity);
      // Handle case where save returns array (when saving multiple entities)
      const finalEntity = Array.isArray(savedEntity) ? savedEntity[0] : savedEntity;
      
      // Handle post-creation relations
      await this.handlePostCreateRelations(finalEntity, createDto, this.queryRunner);
      
      await this.queryRunner.commitTransaction();
      
      // Get the complete entity with relations for return
      const completeEntity = await this.repository.findOne({
        where: { id: (finalEntity as any).id } as unknown as FindOptionsWhere<T>,
        relations: this.getDefaultRelations()
      }) as T;

      // Emit after create event
      await this.emitEvent('create', completeEntity, createDto);

      return completeEntity;

    } catch (error) {
      await this.queryRunner.rollbackTransaction();
      this.logger.error(`Error creating entity: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create entity: ${error.message}`);
    } finally {
      await this.queryRunner.release();
    }
  }

  /**
   * Update an existing entity with relation management and event emission
   */
  async update<TUpdateDto>(id: number, updateDto: TUpdateDto): Promise<T> {
    await this.queryRunner.connect();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();

    try {
      const existingEntity = await this.repository.findOne({ 
        where: { id } as unknown as FindOptionsWhere<T> 
      });
      
      if (!existingEntity) {
        throw new NotFoundException(`Entity with ID ${id} not found`);
      }

      // Emit before update event
      await this.emitEvent('before:update', existingEntity, updateDto);

      // Handle relations before updating
      const processedDto = await this.handleRelations(updateDto, 'update', existingEntity);
      
      await this.queryRunner.manager.update(this.repository.target, id, processedDto as any);
      
      // Handle post-update relations
      await this.handlePostUpdateRelations(id, updateDto, this.queryRunner);
      
      await this.queryRunner.commitTransaction();
      
      // Get updated entity with relations for return
      const updatedEntity = await this.repository.findOne({
        where: { id } as unknown as FindOptionsWhere<T>,
        relations: this.getDefaultRelations()
      }) as T;

      // Emit after update event
      await this.emitEvent('update', updatedEntity, updateDto);

      return updatedEntity;

    } catch (error) {
      await this.queryRunner.rollbackTransaction();
      this.logger.error(`Error updating entity: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Failed to update entity: ${error.message}`);
    } finally {
      await this.queryRunner.release();
    }
  }



  /**
   * Get all entities without pagination
   */
  async getAll<TQueryDto>(queryDto: TQueryDto): Promise<T[]> {
    try {
      const {
        search,
        sortBy = this.options.defaultSort?.field || 'createdAt',
        sortOrder = this.options.defaultSort?.order || 'DESC',
        filters = {},
        relations = [],
        select = [],
        ...otherFilters
      } = queryDto as any;

      const query = this.repository.createQueryBuilder('entity');

      // Add relations
      const allRelations = [...this.getDefaultRelations(), ...relations];
      if (allRelations.length > 0) {
        allRelations.forEach(relation => {
          query.leftJoinAndSelect(`entity.${relation}`, relation);
        });
      }

      // Add select fields
      if (select.length > 0) {
        query.select(select.map(field => `entity.${field}`));
      }

      // Apply search if provided
      if (search) {
        const searchableFields = this.options.searchableFields || this.getDefaultSearchableFields();
        if (searchableFields.length > 0) {
          const searchConditions = searchableFields
            .map(field => `entity.${field} ILIKE :search`)
            .join(' OR ');
          query.andWhere(`(${searchConditions})`, { search: `%${search}%` });
        }
      }

      // Apply filters
      const allFilters = { ...filters, ...otherFilters };
      Object.entries(allFilters).forEach(([key, value]) => {
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
  async get<TQueryDto>(queryDto: TQueryDto): Promise<IPaginatedResponse<T>> {
    try {
      const {
        page = 1,
        limit = this.options.pagination?.defaultLimit || 10,
        search,
        sortBy = this.options.defaultSort?.field || 'createdAt',
        sortOrder = this.options.defaultSort?.order || 'DESC',
        filters = {},
        relations = [],
        select = [],
        ...otherFilters
      } = queryDto as any;

      // Validate pagination limits
      const maxLimit = this.options.pagination?.maxLimit || 100;
      const validatedLimit = Math.min(limit, maxLimit);
      const skip = (page - 1) * validatedLimit;

      const query = this.repository.createQueryBuilder('entity');

      // Add relations
      const allRelations = [...this.getDefaultRelations(), ...relations];
      if (allRelations.length > 0) {
        allRelations.forEach(relation => {
          query.leftJoinAndSelect(`entity.${relation}`, relation);
        });
      }

      // Add select fields
      if (select.length > 0) {
        query.select(select.map(field => `entity.${field}`));
      }

      // Apply search if provided
      if (search) {
        const searchableFields = this.options.searchableFields || this.getDefaultSearchableFields();
        if (searchableFields.length > 0) {
          const searchConditions = searchableFields
            .map(field => `entity.${field} ILIKE :search`)
            .join(' OR ');
          query.andWhere(`(${searchConditions})`, { search: `%${search}%` });
        }
      }

      // Apply filters
      const allFilters = { ...filters, ...otherFilters };
      Object.entries(allFilters).forEach(([key, value]) => {
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

      const allRelations = [...this.getDefaultRelations(), ...(options?.relations || [])];
      if (allRelations.length > 0) {
        findOptions.relations = allRelations;
      }

      if (options?.select) {
        findOptions.select = options.select as (keyof T)[];
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
  async delete(id: number): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingEntity = await this.repository.findOne({ 
        where: { id } as unknown as FindOptionsWhere<T>,
        relations: this.getDefaultRelations()
      });
      
      if (!existingEntity) {
        throw new NotFoundException(`Entity with ID ${id} not found`);
      }

      // Emit before delete event
      await this.emitEvent('before:delete', existingEntity);

      // Handle cascade deletes for relations
      await this.handleCascadeDelete(id, queryRunner);
      
      await queryRunner.manager.delete(this.repository.target, id);
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
   * Handle relations before create/update
   */
  private async handleRelations(dto: any, operation: 'create' | 'update', existingEntity?: T): Promise<any> {
    if (!this.options.relations) return dto;

    const processedDto = { ...dto };

    for (const relation of this.options.relations) {
      const relationData = dto[relation.property];
      
      if (relationData) {
        if (relation.type === 'one-to-one' && relation.autoCreate) {
          // Auto-create related entity
          const relatedEntity = await this.createRelatedEntity(relation.entity, relationData);
          processedDto[relation.property] = relatedEntity;
        } else if (relation.type === 'one-to-many' && relation.autoCreate) {
          // Auto-create multiple related entities
          const relatedEntities = await Promise.all(
            relationData.map((data: any) => this.createRelatedEntity(relation.entity, data))
          );
          processedDto[relation.property] = relatedEntities;
        }
      }
    }

    return processedDto;
  }

  /**
   * Handle relations after create
   */
  private async handlePostCreateRelations(entity: T, dto: any, queryRunner: QueryRunner): Promise<void> {
    if (!this.options.relations) return;

    for (const relation of this.options.relations) {
      const relationData = dto[relation.property];
      
      if (relationData && relation.type === 'many-to-many') {
        // Handle many-to-many relations
        await this.handleManyToManyRelation(entity, relation, relationData, queryRunner);
      }
    }
  }

  /**
   * Handle relations after update
   */
  private async handlePostUpdateRelations(id: number, dto: any, queryRunner: QueryRunner): Promise<void> {
    if (!this.options.relations) return;

    const entity = await queryRunner.manager.findOne(this.repository.target, {
      where: { id } as unknown as FindOptionsWhere<T>
    });

    if (!entity) return;

    for (const relation of this.options.relations) {
      const relationData = dto[relation.property];
      
      if (relationData && relation.type === 'many-to-many') {
        // Handle many-to-many relations
        await this.handleManyToManyRelation(entity, relation, relationData, queryRunner);
      }
    }
  }

  /**
   * Create related entity
   */
  private async createRelatedEntity(entityClass: any, data: any): Promise<any> {
    const repository = this.dataSource.getRepository(entityClass);
    const entity = repository.create(data);
    return await repository.save(entity);
  }

  /**
   * Handle many-to-many relations
   */
  private async handleManyToManyRelation(entity: T, relation: RelationConfig, relationData: any[], queryRunner: QueryRunner): Promise<void> {
    // This would need to be implemented based on your specific many-to-many setup
    // For now, just a placeholder
    this.logger.log(`Handling many-to-many relation for ${relation.property}`);
  }

  /**
   * Handle cascade delete
   */
  private async handleCascadeDelete(id: number, queryRunner: QueryRunner): Promise<void> {
    if (!this.options.relations) return;

    for (const relation of this.options.relations) {
      if (relation.cascade) {
        // Implement cascade delete logic based on relation type
        this.logger.log(`Cascading delete for relation ${relation.property}`);
      }
    }
  }

  /**
   * Get default relations
   */
  private getDefaultRelations(): string[] {
    return this.options.relations?.map(r => r.property) || [];
  }

  /**
   * Get default searchable fields
   */
  private getDefaultSearchableFields(): string[] {
    return ['name', 'title', 'description', 'email'];
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