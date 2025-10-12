export interface CrudEvent<T = any> {
  operation: 'create' | 'update' | 'delete' | 'getAll' | 'getSingle';
  entity: T;
  entityId?: number;
  data?: any;
  timestamp: Date;
  userId?: number;
}

export interface CrudEventData {
  before?: any;
  after?: any;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CrudEventListener<T = any> {
  (event: CrudEvent<T>): Promise<void> | void;
}

export interface CrudEventRegistry {
  register(eventType: string, listener: CrudEventListener): void;
  unregister(eventType: string, listener: CrudEventListener): void;
  emit(event: CrudEvent): Promise<void>;
}
