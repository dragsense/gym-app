import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { ActionRegistryService } from '@/common/helper/services/action-registry.service';

@Processor('schedule')
@Injectable()
export class ScheduleProcessor {
  private readonly logger = new Logger(ScheduleProcessor.name);

  constructor(
    private readonly actionRegistryService: ActionRegistryService,
  ) {}

  /**
   * Handle all scheduled jobs using action registry
   */
  @Process('*')
  async handleScheduledJob(job: Job): Promise<void> {
    const { action, ...data } = job.data;
    
    this.logger.log(`Processing scheduled job ${job.id} with action: ${action}`);
    
    try {
      // Get the handler from the action registry
      const actionHandler = this.actionRegistryService.getAction(action);
      
      if (!actionHandler) {
        this.logger.warn(`No handler found for action: ${action}`);
        return;
      }

      // Execute the handler with job data
      await actionHandler.handler(data, data.entityId, data.userId);
      
      this.logger.log(`Scheduled job ${job.id} completed successfully`);
    } catch (error) {
      this.logger.error(`Scheduled job ${job.id} failed:`, error);
      throw error;
    }
  }
}
