import { SetMetadata } from '@nestjs/common';

export interface RelationConfig {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  entity: any;
  property: string;
  autoCreate?: boolean;
  cascade?: boolean;
}

export interface CrudOptions {
  relations?: RelationConfig[];
  searchableFields?: string[];
  defaultSort?: { field: string; order: 'ASC' | 'DESC' };
  pagination?: {
    defaultLimit: number;
    maxLimit: number;
  };
  fileFields?: {
    single?: string;    // Field name for single file upload
    multiple?: string;  // Field name for multiple file uploads
    image?: string;     // Field name for image upload
  };
}

export const CRUD_OPTIONS_KEY = 'crud_options';

/**
 * Decorator to configure CRUD options for a service
 */
export function CrudConfig(options: CrudOptions) {
  return SetMetadata(CRUD_OPTIONS_KEY, options);
}

/**
 * Decorator for CRUD operations with error handling
 */
export function CrudOperation(operation: 'create' | 'update' | 'getAll' | 'getSingle' | 'delete') {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const logger = target.logger || console;
      
      try {
        logger.log(`Starting ${operation} operation`);
        const result = await originalMethod.apply(this, args);
        logger.log(`${operation} operation completed successfully`);
        return result;
      } catch (error) {
        logger.error(`${operation} operation failed: ${error.message}`, error.stack);
        
        // Handle specific error types
        if (error.name === 'QueryFailedError') {
          throw new Error(`Database error during ${operation}: ${error.message}`);
        } else if (error.name === 'ValidationError') {
          throw new Error(`Validation error during ${operation}: ${error.message}`);
        } else if (error.name === 'NotFoundError') {
          throw new Error(`Entity not found during ${operation}: ${error.message}`);
        }
        
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Decorator for handling relations automatically
 */
export function HandleRelations(relations: string[]) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        // Pre-process relations
        const processedArgs = await this.preprocessRelations(args, relations);
        
        // Execute original method
        const result = await originalMethod.apply(this, processedArgs);
        
        // Post-process relations
        await this.postprocessRelations(result, relations);
        
        return result;
      } catch (error) {
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Decorator for transaction management
 */
export function WithTransaction() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const result = await originalMethod.apply(this, [queryRunner, ...args]);
        await queryRunner.commitTransaction();
        return result;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    };

    return descriptor;
  };
}

/**
 * Decorator for pagination handling
 */
export function WithPagination(defaultLimit: number = 10, maxLimit: number = 100) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const queryDto = args[0];
      
      // Validate and set pagination parameters
      if (queryDto) {
        queryDto.page = Math.max(1, queryDto.page || 1);
        queryDto.limit = Math.min(maxLimit, Math.max(1, queryDto.limit || defaultLimit));
      }

      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
