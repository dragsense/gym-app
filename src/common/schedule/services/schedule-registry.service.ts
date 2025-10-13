import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';
import { ActionRegistryService, ActionHandler, ActionResult } from '../../bull-queue/services/action-registry.service';

@Injectable()
export class ScheduleRegistryService {
  private readonly logger = new LoggerService(ScheduleRegistryService.name);

  constructor(private readonly actionRegistry: ActionRegistryService) {}


  /**
   * Register a new action handler using the bull queue ActionRegistryService
   */
  registerAction(handler: ActionHandler): void {
    this.actionRegistry.registerAction(handler);
    this.logger.log(`Registered action for schedule: ${handler.name}`);
  }

  /**
   * Register multiple action handlers
   */
  registerActions(handlers: ActionHandler[]): void {
    handlers.forEach(handler => this.registerAction(handler));
  }

  /**
   * Unregister an action handler
   */
  unregisterAction(actionName: string): boolean {
    const removed = this.actionRegistry.unregisterAction(actionName);
    if (removed) {
      this.logger.log(`Unregistered action for schedule: ${actionName}`);
    }
    return removed;
  }

  /**
   * Get action handler details
   */
  getAction(actionName: string): ActionHandler | undefined {
    return this.actionRegistry.getAction(actionName);
  }

  executeAction(actionName: string, data?: Record<string, any>, entityId?: number, userId?: number): Promise<ActionResult> {
    return this.actionRegistry.executeAction(actionName, data, entityId, userId);
  }

  /**
   * Get all registered actions`
   */
  getAllActions(): ActionHandler[] {
    return this.actionRegistry.getAllActions();
  }

  /**
   * Clear all action handlers
   */
  clearAllActions(): void {
    const actions = this.getAllActions();
    actions.forEach(action => this.unregisterAction(action.name));
    this.logger.log('Cleared all registered actions for schedule');
  }
}
