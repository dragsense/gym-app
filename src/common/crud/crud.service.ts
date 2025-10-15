import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository, FindOptionsWhere, FindManyOptions, DataSource, QueryRunner, ObjectLiteral, EntityManager, Between as TypeOrmBetween } from 'typeorm';
import { IPaginatedResponse } from 'shared/interfaces';
import { CrudOptions, ICrudService } from './interfaces/crud.interface';
import { EventService } from '../events/event.service';
import { LoggerService } from '../logger/logger.service';
import { getQueryFilters, getRelationFilters, QueryFilterOptions, RelationFilterOptions } from 'shared/decorators/crud.dto.decorators';

@Injectable()
export class CrudService<T extends ObjectLiteral> implements ICrudService<T> {
  private readonly logger = new LoggerService(CrudService.name);
  protected readonly repository: Repository<T>;
  protected readonly dataSource: DataSource;
  protected readonly eventService: EventService;
  protected options: CrudOptions;
  constructor(
    repository: Repository<T>,
    dataSource: DataSource,
    eventService: EventService,
    options?: CrudOptions, // ✅ optional, child can pass this
  ) {
    this.repository = repository;
    this.dataSource = dataSource;
    this.eventService = eventService;

    // ✅ Merge default + custom options directly here
    this.options = {
      pagination: { defaultLimit: 10, maxLimit: 100 },
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
  async create<TCreateDto>(createDto: TCreateDto, callbacks?: {
    beforeCreate?: (manager: EntityManager) => any | Promise<any>;
    afterCreate?: (result: any, manager: EntityManager) => any | Promise<any>;
  }): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let processedData = createDto;

      // Execute beforeCreate callback if provided
      if (callbacks?.beforeCreate) {
        processedData = await callbacks.beforeCreate(queryRunner.manager);
      }

      // Emit before create event
      await this.emitEvent('before:create', null, processedData);

      const entity = this.repository.create(processedData as any);
      const savedEntity = await queryRunner.manager.save(entity);
      const finalEntity = Array.isArray(savedEntity) ? savedEntity[0] : savedEntity;

      // Get the complete entity with relations for return
      const completeEntity = await this.getSingle(finalEntity.id);

      // Execute afterCreate callback if provided
      if (callbacks?.afterCreate) {
        await callbacks.afterCreate(completeEntity, queryRunner.manager);
      }


      // Commit transaction after all callbacks
      await queryRunner.commitTransaction();      // Emit after create event
      await this.emitEvent('create', completeEntity, processedData);

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
  async update<TUpdateDto>(key: string | number | Record<string, any>,
    updateDto: TUpdateDto, callbacks?: {
      beforeUpdate?: (entity: T, manager: EntityManager) => any | Promise<any>;
      afterUpdate?: (updatedEntity: T, manager: EntityManager) => any | Promise<any>;
    }): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {

      const existingEntity = await this.getSingle(key);

      let processedData = updateDto;

      // Execute beforeUpdate callback if provided
      if (callbacks?.beforeUpdate) {
        processedData = await callbacks.beforeUpdate(existingEntity, queryRunner.manager);
      }



      // Emit before update event
      await this.emitEvent('before:update', existingEntity, processedData);

      await queryRunner.manager.update(this.repository.target, existingEntity.id, processedData as any);

      // Get updated entity with relations for return
      const updatedEntity = await this.getSingle(existingEntity.id);

      // Execute afterUpdate callback if provided
      if (callbacks?.afterUpdate) {
        await callbacks.afterUpdate(updatedEntity, queryRunner.manager);
      }

      // Commit transaction after all callbacks
      await queryRunner.commitTransaction();

      // Emit after update event
      await this.emitEvent('update', updatedEntity, processedData);

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
  async getAll<TQueryDto>(queryDto: TQueryDto, dtoClass: any, callbacks?: {
    beforeQuery?: (query: any) => any | Promise<any>;
    afterQuery?: (query: any, result: any) => any | Promise<any>;
  }): Promise<T[]> {
    try {
      const {
        search,
        sortBy = this.options.defaultSort?.field,
        sortOrder = this.options.defaultSort?.order,
        ...filters
      } = queryDto as any;

      const query = this.repository.createQueryBuilder('entity');

      // Apply simplified relations and select system
      this.applyRelationsAndSelect(query, queryDto, dtoClass);

      // Apply search functionality
      this.applySearch(query, queryDto, search);



      // Apply query decorator filters
      this.applyQueryFilters(query, queryDto, dtoClass);

      // Apply relation filters
      this.applyRelationFilters(query, queryDto, dtoClass);

      // Apply legacy filters (for backward compatibility)
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

      // Add sort field to selection (handles nested relations too)
      const allRestrictedFields = this.options.restrictedFields || [];
      const sortField = this.addSortFieldToSelection(query, sortBy, queryDto, allRestrictedFields);

      if (sortField) {
        query.orderBy(sortField, sortDirection as 'ASC' | 'DESC');
      }


      // Execute beforeQuery callback if provided
      if (callbacks?.beforeQuery) {
        await callbacks.beforeQuery(query);
      }

      const result = await query.getMany();

      // Execute afterQuery callback if provided
      if (callbacks?.afterQuery) {
        await callbacks.afterQuery(query, result);
      }

      return result;

    } catch (error) {
      this.logger.error(`Error getting all entities without pagination: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to retrieve entities: ${error.message}`);
    }
  }

  /**
   * Get entities with pagination (internal method)
   */
  async get<TQueryDto>(queryDto: TQueryDto, dtoClass?: any, callbacks?: {
    beforeQuery?: (query: any) => any | Promise<any>;
    afterQuery?: (query: any, result: any) => any | Promise<any>;
  }): Promise<IPaginatedResponse<T>> {
    try {
      const {
        page = 1,
        limit = this.options.pagination?.defaultLimit || 10,
        search,
        sortBy = this.options.defaultSort?.field || 'createdAt',
        sortOrder = this.options.defaultSort?.order || 'DESC',
      } = queryDto as any;

      // Validate pagination limits
      const maxLimit = this.options.pagination?.maxLimit || 100;
      const validatedLimit = Math.min(limit, maxLimit);
      const skip = (page - 1) * validatedLimit;

      const query = this.repository.createQueryBuilder('entity');




      // Apply simplified relations and select system
      this.applyRelationsAndSelect(query, queryDto, dtoClass);

      // Apply search functionality
      this.applySearch(query, queryDto, search);



      // Apply query decorator filters
      this.applyQueryFilters(query, queryDto, dtoClass);

      // Apply relation filters
      this.applyRelationFilters(query, queryDto, dtoClass);



      // Apply sorting
      const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // Add sort field to selection (handles nested relations too)
      const allRestrictedFields = this.options.restrictedFields || [];

      const sortField = this.addSortFieldToSelection(query, sortBy, queryDto, allRestrictedFields);

      if (sortField) {
        query.orderBy(sortField, sortDirection as 'ASC' | 'DESC');
      }

      // Execute beforeQuery callback if provided
      if (callbacks?.beforeQuery) {
        await callbacks.beforeQuery(query);
      }


      const [data, total] = await query
        .skip(skip)
        .take(validatedLimit)
        .getManyAndCount();

      // Execute afterQuery callback if provided
      if (callbacks?.afterQuery) {
        await callbacks.afterQuery(query, { data, total });
      }

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
  async getSingle<TQueryDto>(key: string | number | Record<string, any>,
    queryDto?: TQueryDto, dtoClass?: any): Promise<T> {
    try {
      const query = this.repository.createQueryBuilder('entity');

      // Handle different key types
      if (typeof key === 'string' || typeof key === 'number') {
        // If key is string or number, assume it's an ID
        query.andWhere('entity.id = :id', { id: key });
      } else if (typeof key === 'object' && key !== null) {
        // If key is an object, handle nested conditions with dot notation
        // Only apply nested conditions if relations are defined
        const relations = (queryDto as any)._relations || [];

        Object.entries(key).forEach(([field, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (field.includes('.')) {
              // For nested fields, check if the relation path exists in _relations
              const relationPath = field.split('.')[0]; // e.g., 'profile' from 'profile.firstName'
              const fullRelationPath = this.getRelationPath(field, relations); // e.g., 'profile.documents' from 'profile.documents.name'

              if (relations.includes(relationPath) || relations.includes(fullRelationPath)) {
                // Create safe parameter name to avoid conflicts
                const paramName = this.createSafeParameterName(field);
                query.andWhere(`${field} = :${paramName}`, { [paramName]: value });
              }
              // If relation not defined, ignore the nested condition
            } else {
              // Direct entity field - always apply
              query.andWhere(`entity.${field} = :${field}`, { [field]: value });
            }
          }
        });
      } else {
        throw new BadRequestException('Invalid key provided for getSingle');
      }

      // Apply simplified relations and select system only
      if (queryDto) {
        this.applyRelationsAndSelect(query, queryDto, dtoClass);
      }

      const entity = await query.getOne();

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
  async delete(key: string | number | Record<string, any>, callbacks?: {
    beforeDelete?: (entity: any, manager: EntityManager) => any | Promise<any>;
    afterDelete?: (entity: any, manager: EntityManager) => any | Promise<any>;
  }): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      const existingEntity = await this.getSingle(key);

      // Execute beforeDelete callback if provided
      if (callbacks?.beforeDelete) {
        await callbacks.beforeDelete(existingEntity, queryRunner.manager);
      }

      // Emit before delete event
      await this.emitEvent('before:delete', existingEntity);

      await queryRunner.manager.delete(this.repository.target, existingEntity.id);

      // Execute afterDelete callback if provided
      if (callbacks?.afterDelete) {
        await callbacks.afterDelete(existingEntity, queryRunner.manager);
      }

      // Commit transaction after all callbacks
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
   * Emit CRUD events using NestJS EventEmitter
   */
  private emitEvent(operation: string, entity: T | null, data?: any): void {
    try {
      const eventData = {
        entity: entity as T,
        entityId: entity ? (entity as any).id : undefined,
        operation,
        source: this.repository.metadata.name,
        tableName: this.repository.metadata.tableName,
        timestamp: new Date(),
        ...data
      };

      this.eventService.emit(`crud.${operation}`, eventData);
    } catch (error) {
      this.logger.error(`Error emitting ${operation} event: ${error.message}`, error.stack);
      // Don't throw error for event emission failures
    }
  }


  /**
   * Apply simplified relations and select system using _relations, _select, and _searchable
   * 
   * Behavior:
   * 1. _select can include both main entity fields and specific relation fields
   * 2. _relations can include nested relations (e.g., "profile.documents")
   * 3. Relation fields in _select are ONLY allowed if their parent relation is explicitly defined in _relations
   * 4. Only the specific fields in _select are returned, not entire relations
   * 5. ID fields are automatically included for all relations (e.g., profile.firstName includes profile.id)
   * 6. If no _select provided: uses default selectableFields, or selects all if empty
   * 7. Restricted fields are always filtered out silently (no errors thrown)
   * 8. Restricted fields are defined in backend configuration only (security)
   * 
   * Examples:
   * - GET /users?_relations=profile&_select=email,profile.firstName (gets email + profile.id + profile.firstName)
   * - GET /users?_relations=profile.documents&_select=email,profile.documents.name (gets email + profile.id + documents.id + profile.documents.name)
   * - GET /users?_relations=profile (gets default user fields + ALL profile fields)
   * - GET /users?_relations=profile.documents (gets default user fields + ALL profile + ALL documents fields)
   * - GET /users?_select=email,profile.documents.name (profile.documents.name IGNORED - profile.documents not in _relations)
   * - GET /users?_relations=profile&_select=email,profile.documents.name (profile.documents.name IGNORED - profile.documents not in _relations)
   * - GET /users?_select=id,email,password (password filtered out, only id,email returned)
   * - GET /users (uses default selectableFields, no relations)
   */
  private applyRelationsAndSelect(query: any, queryDto: any, dtoClass?: any): void {
    const _relations = (queryDto as any)._relations;
    const _select = (queryDto as any)._select;

    // Clear any default selections to start fresh, but keep entity.id for TypeORM internals
    query.select([]);
    query.addSelect('entity.id'); // Always include id for TypeORM's DISTINCT operations

    // Get restricted fields from backend configuration only (security)
    const allRestrictedFields = this.options.restrictedFields || [];

    // Apply relations if specified (including nested relations)
    if (_relations && Array.isArray(_relations)) {
      _relations.forEach((relationPath: string) => {
        if (relationPath && relationPath.trim()) {
          const cleanPath = relationPath.trim();

          if (cleanPath.includes('.')) {
            // Nested relation (e.g., "profile.documents")
            // For "profile.documents" we need to join profile first, then documents
            const parts = cleanPath.split('.');
            let currentPath = '';
            let currentAlias = '';

            parts.forEach((part, index) => {
              if (index === 0) {
                // First level: entity.profile
                currentPath = `entity.${part}`;
                currentAlias = part;
                query.leftJoin(currentPath, currentAlias)
                  .addSelect(`${currentAlias}.id`);
              } else {
                // Subsequent levels: profile.documents
                const newPath = `${currentAlias}.${part}`;
                const newAlias = `${currentAlias}_${part}`;
                query.leftJoin(newPath, newAlias)
                  .addSelect(`${newAlias}.id`);
                currentAlias = newAlias;
              }
            });
          } else {
            // Simple relation (e.g., "profile")
            query.leftJoin(`entity.${cleanPath}`, cleanPath)
              .addSelect(`${cleanPath}.id`);
          }
        }
      });
    }

    // Helper function to check if field is restricted
    const isFieldRestricted = (field: string): boolean => {
      return allRestrictedFields.includes(field) ||
        allRestrictedFields.some(restricted => field.startsWith(restricted + '.'));
    };

    // Helper function to add field to select (with restriction check)
    const addFieldToSelect = (field: string): boolean => {
      const cleanField = field.trim();

      // Skip if field is restricted (silently filter, no error)
      if (isFieldRestricted(cleanField)) {
        return false;
      }

      // Add the field to select
      if (cleanField.includes('.')) {
        // Nested field (e.g., profile.firstName)
        query.addSelect(cleanField);
      } else {
        // Direct entity field
        // Skip adding entity.id since we already added it at the beginning
        if (cleanField !== 'id') {
          query.addSelect(`entity.${cleanField}`);
        }
      }
      return true;
    };

    // Helper function to check if field is a main entity field (not a relation field)
    const isMainEntityField = (field: string): boolean => {
      // Main entity fields don't contain dots (e.g., "email", "id")
      // Relation fields contain dots (e.g., "profile.firstName", "profile.documents.name")
      return !field.includes('.');
    };

    // Helper function to get all relation paths needed from a field
    const getRelationPaths = (field: string): string[] => {
      // For "profile.documents.name" -> ["profile", "profile.documents"]
      // For "profile.firstName" -> ["profile"]
      const parts = field.split('.');
      const paths: string[] = [];
      let currentPath = '';

      for (let i = 0; i < parts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}.${parts[i]}` : parts[i];
        paths.push(currentPath);
      }

      return paths;
    };

    // Get all explicitly defined relations from _relations parameter
    const explicitlyDefinedRelations = new Set<string>();
    if (_relations && Array.isArray(_relations)) {
      _relations.forEach((relationPath: string) => {
        if (relationPath && relationPath.trim()) {
          const cleanPath = relationPath.trim();
          explicitlyDefinedRelations.add(cleanPath);

          // Also add all parent paths for nested relations
          // For "profile.documents" also add "profile"
          if (cleanPath.includes('.')) {
            const parts = cleanPath.split('.');
            let currentPath = '';
            for (let i = 0; i < parts.length - 1; i++) {
              currentPath = currentPath ? `${currentPath}.${parts[i]}` : parts[i];
              explicitlyDefinedRelations.add(currentPath);
            }
          }
        }
      });
    }

    // Helper function to check if a relation field is allowed
    const isRelationFieldAllowed = (field: string): boolean => {
      // For "profile.documents.versions.number", we need "profile.documents.versions" to be defined
      const parts = field.split('.');
      let currentPath = '';

      for (let i = 0; i < parts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}.${parts[i]}` : parts[i];
        if (!explicitlyDefinedRelations.has(currentPath)) {
          return false;
        }
      }
      return true;
    };

    // Collect relation paths needed from _select (only for explicitly defined relations)
    const relationsFromSelect = new Set<string>();
    if (_select && Array.isArray(_select)) {
      _select.forEach((fieldPath: string) => {
        if (fieldPath && fieldPath.trim()) {
          const cleanField = fieldPath.trim();
          if (!isMainEntityField(cleanField)) {
            // Only collect relations if the field is allowed (parent relation is defined)
            if (isRelationFieldAllowed(cleanField)) {
              const relationPaths = getRelationPaths(cleanField);
              relationPaths.forEach(path => relationsFromSelect.add(path));
            }
          }
        }
      });
    }

    // Apply select fields
    if (_select && Array.isArray(_select) && _select.length > 0) {
      // User provided specific fields to select
      _select.forEach((fieldPath: string) => {
        if (fieldPath && fieldPath.trim()) {
          const cleanField = fieldPath.trim();

          if (isMainEntityField(cleanField)) {
            // Main entity field (e.g., "email", "id") - always allowed
            addFieldToSelect(cleanField);
          } else {
            // Relation field (e.g., "profile.firstName", "profile.documents.name")
            // Only allow if the parent relation is explicitly defined in _relations
            if (isRelationFieldAllowed(cleanField)) {
              addFieldToSelect(cleanField);
            }
            // If not allowed, silently ignore (no error)
          }
        }
      });
    } else {
      // No specific select provided - use default selectable fields from configuration
      const selectableFields = this.options.selectableFields || [];

      if (selectableFields.length > 0) {
        // Use ONLY the selectable fields (whitelist approach)
        selectableFields.forEach(field => {
          if (isMainEntityField(field)) {
            // Main entity field - add it
            addFieldToSelect(field);
          } else {
            // Relation field - only add if relation is explicitly defined
            if (isRelationFieldAllowed(field)) {
              addFieldToSelect(field);
              // Add relation paths needed for this field
              const relationPaths = getRelationPaths(field);
              relationPaths.forEach(path => relationsFromSelect.add(path));
            }
          }
        });
      } else {
        // No default selectable fields - select all entity fields (filter restricted)
        // Only select main entity fields, not relations
        // Don't use query.addSelect('entity') as it selects ALL fields including restricted ones
        // Instead, select only non-restricted main entity fields
        const entityMetadata = this.repository.metadata;
        entityMetadata.columns.forEach(column => {
          const fieldName = column.propertyName;
          if (!isFieldRestricted(fieldName)) {
            query.addSelect(`entity.${fieldName}`);
          }
        });
      }
    }

    // Special case: If no _select provided but _relations specified, 
    // only select all fields from relations if no selectableFields are configured
    if ((!_select || !Array.isArray(_select) || _select.length === 0) &&
      _relations && Array.isArray(_relations) && _relations.length > 0) {

      const selectableFields = this.options.selectableFields || [];

      if (selectableFields.length === 0) {
        // No selectableFields configured - select all fields from the explicitly defined relations
        explicitlyDefinedRelations.forEach((relationPath: string) => {
          query.addSelect(relationPath);
        });
      }
      // If selectableFields exist, they are already handled in the _select logic above
    }

    // Merge relations from _relations and relations needed from _select
    const allRelationsNeeded = new Set<string>();

    // Add relations from _relations parameter
    explicitlyDefinedRelations.forEach(relationPath => {
      allRelationsNeeded.add(relationPath);
    });

    // Add relations needed from _select parameter (already filtered for allowed relations)
    relationsFromSelect.forEach(relationPath => {
      allRelationsNeeded.add(relationPath);
    });

    // Apply relations but only select specific fields, not entire relations
    // The relations are already joined above, now we just need to select specific fields
    // No need to add entire relations here since we're selecting specific fields in the _select logic above
  }


  /**
   * Add sort field to selection if relation exists in _relations
   */
  private addSortFieldToSelection(query: any, sortBy: string, queryDto: any, allRestrictedFields: string[]): string {
    if (!sortBy || !sortBy.trim()) return '';

    // Check if field is restricted
    const isFieldRestricted = allRestrictedFields.includes(sortBy) ||
      allRestrictedFields.some(restricted => sortBy.startsWith(restricted + '.'));

    if (isFieldRestricted) return '';

    // For nested fields, check if the relation is defined in _relations
    if (sortBy.includes('.')) {
      const _relations = (queryDto as any)._relations || [];
      const relationPath = this.getRelationPath(sortBy, _relations);

      // Only add if the relation path exists in _relations
      if (!relationPath || !_relations.includes(relationPath)) {
        return ''; // Don't add sort field if relation not defined
      }
    }

    // Add the sort field if not already selected
    const sortField = sortBy.includes('.') ? sortBy : `entity.${sortBy}`;
    
    // Check if sort field is already selected
    const currentSelections = query.expressionMap.selects || [];
    const isSortFieldAlreadySelected = currentSelections.some((select: any) => 
      select.selection === sortField
    );
    
    if (!isSortFieldAlreadySelected) {
      query.addSelect(sortField);
    }

    return sortField;
  }

  /**
   * Apply query filters based on decorator metadata
   */
  private applyQueryFilters(query: any, queryDto: any, dtoClass?: any): void {
    if (!dtoClass) return;

    const queryFilters = getQueryFilters(dtoClass);

    Object.entries(queryFilters).forEach(([propertyKey, filterOptions]: [string, QueryFilterOptions]) => {
      const value = queryDto[propertyKey];

      if (value === undefined || value === null || value === '') {
        return;
      }

      const field = filterOptions.field || propertyKey;
      let processedValue = value;

      // Apply transform if provided
      if (filterOptions.transform) {
        try {
          processedValue = filterOptions.transform(value);
        } catch (error) {
          this.logger.warn(`Transform failed for field ${field}: ${error.message}`);
          return;
        }
      }

      // Build proper field reference with entity prefix
      const fieldReference = this.buildFieldReference(field);

      // Create safe parameter name to avoid conflicts
      const paramName = this.createSafeParameterName(propertyKey);

      try {
        // Handle different filter types
        switch (filterOptions.type) {
          case 'between':
            if (Array.isArray(processedValue) && processedValue.length === 2) {
              const [startValue, endValue] = processedValue;
              
              // Handle partial ranges intelligently
              if (startValue && endValue) {
                // Both values provided - use BETWEEN
                query.andWhere(`${fieldReference} BETWEEN :${paramName}_start AND :${paramName}_end`, {
                  [`${paramName}_start`]: startValue,
                  [`${paramName}_end`]: endValue
                });
              } else if (startValue && !endValue) {
                // Only start value provided - use greaterThan
                query.andWhere(`${fieldReference} >= :${paramName}_start`, {
                  [`${paramName}_start`]: startValue
                });
              } else if (!startValue && endValue) {
                // Only end value provided - use lessThan
                query.andWhere(`${fieldReference} <= :${paramName}_end`, {
                  [`${paramName}_end`]: endValue
                });
              }
              // If both are null/undefined, no filter is applied
            }
            break;

          case 'lessThan':
            query.andWhere(`${fieldReference} < :${paramName}`, { [paramName]: processedValue });
            break;

          case 'greaterThan':
            query.andWhere(`${fieldReference} > :${paramName}`, { [paramName]: processedValue });
            break;

          case 'lessThanOrEqual':
            query.andWhere(`${fieldReference} <= :${paramName}`, { [paramName]: processedValue });
            break;

          case 'greaterThanOrEqual':
            query.andWhere(`${fieldReference} >= :${paramName}`, { [paramName]: processedValue });
            break;

          case 'like':
            query.andWhere(`${fieldReference} ILIKE :${paramName}`, { [paramName]: `%${processedValue}%` });
            break;

          case 'in':
            if (Array.isArray(processedValue)) {
              query.andWhere(`${fieldReference} IN (:...${paramName})`, { [paramName]: processedValue });
            }
            break;

          case 'notIn':
            if (Array.isArray(processedValue)) {
              query.andWhere(`${fieldReference} NOT IN (:...${paramName})`, { [paramName]: processedValue });
            }
            break;

          case 'isNull':
            if (processedValue === true) {
              query.andWhere(`${fieldReference} IS NULL`);
            } else if (processedValue === false) {
              query.andWhere(`${fieldReference} IS NOT NULL`);
            }
            break;

          case 'isNotNull':
            if (processedValue === true) {
              query.andWhere(`${fieldReference} IS NOT NULL`);
            } else if (processedValue === false) {
              query.andWhere(`${fieldReference} IS NULL`);
            }
            break;

          case 'equals':
            query.andWhere(`${fieldReference} = :${paramName}`, { [paramName]: processedValue });
            break;

          case 'notEquals':
            query.andWhere(`${fieldReference} != :${paramName}`, { [paramName]: processedValue });
            break;

          default:
            // Fallback to simple equality
            query.andWhere(`${fieldReference} = :${paramName}`, { [paramName]: processedValue });
            break;
        }
      } catch (error) {
        this.logger.error(`Error applying query filter for field ${field}: ${error.message}`, error.stack);
        // Continue with other filters instead of breaking the entire query
      }
    });
  }

  /**
   * Apply relation filters based on decorator metadata
   */
  private applyRelationFilters(query: any, queryDto: any, dtoClass?: any): void {
    if (!dtoClass) {
      return;
    }

    const relationFilters = getRelationFilters(dtoClass);

    Object.entries(relationFilters).forEach(([propertyKey, relationPath]: [string, string]) => {
      const value = queryDto[propertyKey];

      if (value === undefined || value === null || value === '') {
        return;
      }

      // Get the filter type from other decorators (like @Equals, @Like, etc.)
      const queryFilters = getQueryFilters(dtoClass);
      const filterOptions = queryFilters[propertyKey];
      const type = filterOptions?.type || 'equals';
      const transform = filterOptions?.transform;

      let processedValue = value;

      // Apply transform if provided
      if (transform) {
        try {
          processedValue = transform(value);
        } catch (error) {
          this.logger.warn(`Transform failed for relation field ${relationPath}: ${error.message}`);
          return;
        }
      }

      // The relationPath is the complete field reference (e.g., 'profile.firstName')
      const fieldReference = relationPath;

      // Create safe parameter name to avoid conflicts
      const paramName = this.createSafeParameterName(`${relationPath.replace(/\./g, '_')}_${propertyKey}`);

      try {
        // Handle different filter types for relations
        switch (type) {
          case 'between':
            if (Array.isArray(processedValue) && processedValue.length === 2) {
              const [startValue, endValue] = processedValue;
              
              // Handle partial ranges intelligently
              if (startValue && endValue) {
                // Both values provided - use BETWEEN
                query.andWhere(`${fieldReference} BETWEEN :${paramName}_start AND :${paramName}_end`, {
                  [`${paramName}_start`]: startValue,
                  [`${paramName}_end`]: endValue
                });
              } else if (startValue && !endValue) {
                // Only start value provided - use greaterThan
                query.andWhere(`${fieldReference} >= :${paramName}_start`, {
                  [`${paramName}_start`]: startValue
                });
              } else if (!startValue && endValue) {
                // Only end value provided - use lessThan
                query.andWhere(`${fieldReference} <= :${paramName}_end`, {
                  [`${paramName}_end`]: endValue
                });
              }
              // If both are null/undefined, no filter is applied
            }
            break;

          case 'lessThan':
            query.andWhere(`${fieldReference} < :${paramName}`, { [paramName]: processedValue });
            break;

          case 'greaterThan':
            query.andWhere(`${fieldReference} > :${paramName}`, { [paramName]: processedValue });
            break;

          case 'lessThanOrEqual':
            query.andWhere(`${fieldReference} <= :${paramName}`, { [paramName]: processedValue });
            break;

          case 'greaterThanOrEqual':
            query.andWhere(`${fieldReference} >= :${paramName}`, { [paramName]: processedValue });
            break;

          case 'like':
            query.andWhere(`${fieldReference} ILIKE :${paramName}`, { [paramName]: `%${processedValue}%` });
            break;

          case 'in':
            if (Array.isArray(processedValue)) {
              query.andWhere(`${fieldReference} IN (:...${paramName})`, { [paramName]: processedValue });
            }
            break;

          case 'notIn':
            if (Array.isArray(processedValue)) {
              query.andWhere(`${fieldReference} NOT IN (:...${paramName})`, { [paramName]: processedValue });
            }
            break;

          case 'isNull':
            if (processedValue === true) {
              query.andWhere(`${fieldReference} IS NULL`);
            } else if (processedValue === false) {
              query.andWhere(`${fieldReference} IS NOT NULL`);
            }
            break;

          case 'isNotNull':
            if (processedValue === true) {
              query.andWhere(`${fieldReference} IS NOT NULL`);
            } else if (processedValue === false) {
              query.andWhere(`${fieldReference} IS NULL`);
            }
            break;

          case 'equals':
            query.andWhere(`${fieldReference} = :${paramName}`, { [paramName]: processedValue });
            break;

          case 'notEquals':
            query.andWhere(`${fieldReference} != :${paramName}`, { [paramName]: processedValue });
            break;

          default:
            // Fallback to simple equality
            query.andWhere(`${fieldReference} = :${paramName}`, { [paramName]: processedValue });
            break;
        }
      } catch (error) {
        this.logger.error(`Error applying relation filter for field ${fieldReference}: ${error.message}`, error.stack);
        // Continue with other filters instead of breaking the entire query
      }
    });
  }

  /**
   * Apply search functionality using searchable fields
   */
  private applySearch(query: any, queryDto: any, search?: string): void {
    if (!search) {
      return;
    }

    const _searchable = (queryDto as any)._searchable;

    // Get restricted fields from backend configuration only (security)
    const allRestrictedFields = this.options.restrictedFields || [];

    // Helper function to check if field is restricted
    const isFieldRestricted = (field: string): boolean => {
      return allRestrictedFields.includes(field) ||
        allRestrictedFields.some(restricted => field.startsWith(restricted + '.'));
    };

    let searchableFields: string[] = [];

    // Use _searchable if provided, otherwise fallback to default searchable fields
    if (_searchable && Array.isArray(_searchable) && _searchable.length > 0) {
      searchableFields = _searchable;
    } else {
      // Fallback to default searchable fields from backend configuration
      const defaultSearchableFields = this.options.searchableFields || [];
      searchableFields = defaultSearchableFields;
    }

    if (searchableFields.length > 0) {
      const searchConditions = searchableFields
        .filter(field => field && field.trim())
        .filter(field => !isFieldRestricted(field.trim())) // Filter restricted fields from search
        .map(field => {
          const cleanField = field.trim();
          if (cleanField.includes('.')) {
            // Nested field (e.g., profile.firstName)
            return `${cleanField} ILIKE :search`;
          } else {
            // Direct entity field
            return `entity.${cleanField} ILIKE :search`;
          }
        })
        .join(' OR ');

      if (searchConditions) {
        query.andWhere(`(${searchConditions})`, { search: `%${search}%` });
      }
    }
  }

  /**
   * Build proper field reference with entity prefix for nested fields
   */
  private buildFieldReference(field: string): string {
    // If field contains a dot, it's a nested field (e.g., profile.firstName)
    if (field.includes('.')) {
      return field; // Already has proper format
    }
    // For direct entity fields, prefix with entity.
    return `entity.${field}`;
  }

  /**
   * Create safe parameter name to avoid conflicts with SQL keywords
   */
  private createSafeParameterName(propertyKey: string): string {
    // Replace dots and special characters with underscores
    return propertyKey.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Get relation path from nested field
   */
  private getRelationPath(field: string, relations: string[]): string {
    const parts = field.split('.');
    if (parts.length <= 1) return parts[0];

    // Find the longest matching relation path
    for (let i = parts.length - 1; i >= 1; i--) {
      const relationPath = parts.slice(0, i).join('.');
      if (relations.includes(relationPath)) {
        return relationPath;
      }
    }

    return parts[0]; // Fallback to first part
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