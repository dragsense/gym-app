import { Injectable, Logger } from '@nestjs/common';
import { CrudEvent, CrudEventListener, CrudEventRegistry } from 'shared/interfaces/crud-events.interface';

@Injectable()
export class CrudEventService implements CrudEventRegistry {
  private readonly logger = new Logger(CrudEventService.name);
  private readonly listeners = new Map<string, CrudEventListener[]>();

  /**
   * Register an event listener
   */
  register(eventType: string, listener: CrudEventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
    this.logger.log(`Registered listener for event: ${eventType}`);
  }

  /**
   * Unregister an event listener
   */
  unregister(eventType: string, listener: CrudEventListener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
        this.logger.log(`Unregistered listener for event: ${eventType}`);
      }
    }
  }

  /**
   * Emit an event to all registered listeners
   */
  async emit(event: CrudEvent): Promise<void> {
    const eventType = `${event.operation}`;
    const listeners = this.listeners.get(eventType) || [];
    const allListeners = [...listeners, ...(this.listeners.get('*') || [])];

    this.logger.log(`Emitting ${eventType} event to ${allListeners.length} listeners`);

    // Execute all listeners in parallel
    const promises = allListeners.map(async (listener) => {
      try {
        await listener(event);
      } catch (error) {
        this.logger.error(`Error in event listener for ${eventType}: ${error.message}`, error.stack);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Get all registered listeners for an event type
   */
  getListeners(eventType: string): CrudEventListener[] {
    return this.listeners.get(eventType) || [];
  }

  /**
   * Clear all listeners for an event type
   */
  clearListeners(eventType: string): void {
    this.listeners.delete(eventType);
    this.logger.log(`Cleared all listeners for event: ${eventType}`);
  }

  /**
   * Clear all listeners
   */
  clearAllListeners(): void {
    this.listeners.clear();
    this.logger.log('Cleared all event listeners');
  }
}
