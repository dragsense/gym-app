import { SetMetadata } from '@nestjs/common';
import { CrudEventListener } from '../interfaces/crud-events.interface';

export const CRUD_EVENT_LISTENERS_KEY = 'crud_event_listeners';

/**
 * Decorator to register event listeners for CRUD operations
 */
export function CrudEventListener(eventType: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const listener: CrudEventListener = async (event) => {
      return await originalMethod.call(target, event);
    };

    // Store the listener metadata
    const existingListeners = Reflect.getMetadata(CRUD_EVENT_LISTENERS_KEY, target.constructor) || [];
    existingListeners.push({ eventType, listener, methodName: propertyName });
    Reflect.defineMetadata(CRUD_EVENT_LISTENERS_KEY, existingListeners, target.constructor);

    return descriptor;
  };
}

/**
 * Decorator for after create events
 */
export function AfterCreate() {
  return CrudEventListener('create');
}

/**
 * Decorator for after update events
 */
export function AfterUpdate() {
  return CrudEventListener('update');
}

/**
 * Decorator for after delete events
 */
export function AfterDelete() {
  return CrudEventListener('delete');
}

/**
 * Decorator for before create events
 */
export function BeforeCreate() {
  return CrudEventListener('before:create');
}

/**
 * Decorator for before update events
 */
export function BeforeUpdate() {
  return CrudEventListener('before:update');
}

/**
 * Decorator for before delete events
 */
export function BeforeDelete() {
  return CrudEventListener('before:delete');
}

/**
 * Decorator to mark a method as an event handler
 */
export function EventHandler() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const event = args[0];
      if (event && typeof event === 'object' && event.operation) {
        this.logger?.log(`Handling ${event.operation} event in ${propertyName}`);
      }
      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
