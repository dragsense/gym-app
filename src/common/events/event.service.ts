import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventService as IEventService } from './interface/event.interface';

@Injectable()
export class EventService implements IEventService {
  private readonly logger = new Logger(EventService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Emit event using NestJS EventEmitter2 (simple approach)
   */
  emit(eventType: string, payload: any): void {
    this.logger.log(`Emitting ${eventType} event`);
    this.eventEmitter.emit(eventType, payload);
  }

  /**
   * Create and emit an event with structured data
   */
  emitEvent(
    type: string, 
    data: any, 
    source?: string, 
    metadata?: Record<string, any>
  ): void {
    const event = {
      type,
      data,
      timestamp: new Date(),
      source,
      metadata
    };
    
    this.emit(type, event);
  }
}
