import { Repository, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { IPaginatedResponse } from 'shared/interfaces';

export interface ICrudService<T extends ObjectLiteral> {
  /**
   * Create a new entity
   */
  create<TCreateDto>(createDto: TCreateDto): Promise<T>;

  /**
   * Update an existing entity
   */
  update<TUpdateDto>(id: number, updateDto: TUpdateDto): Promise<T>;

  /**
   * Get entities with pagination
   */
  get<TQueryDto>(queryDto: TQueryDto): Promise<IPaginatedResponse<T>>;

  /**
   * Get all entities without pagination
   */
  getAll<TQueryDto>(queryDto: TQueryDto): Promise<T[]>;

  /**
   * Get a single entity by any key
   */
  getSingle(key: string | number | Record<string, any>, options?: { relations?: string[]; select?: string[] }): Promise<T>;

  /**
   * Delete an entity by ID and return the deleted entity
   */
  delete(id: number): Promise<T>;

  /**
   * Get repository for the entity
   */
  getRepository(): Repository<T>;
}