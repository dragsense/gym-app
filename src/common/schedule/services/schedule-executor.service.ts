import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduleService } from '../schedule.service';
import { ScheduleRegistryService } from './schedule-registry.service';
import { Schedule } from '../entities/schedule.entity';
import { LoggerService } from '../../logger/logger.service';
import { BullQueueService } from '../../bull-queue/bull-queue.service';

@Injectable()
export class ScheduleExecutorService implements OnModuleInit {
  private readonly logger = new LoggerService(ScheduleExecutorService.name);
  private scheduledJobs: Map<number, string[]> = new Map(); // Store Bull Queue job IDs instead of CronJob instances

  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly scheduleRegistry: ScheduleRegistryService,
    private readonly bullQueueService: BullQueueService,
  ) { }

  /**
   * Run on application boot
   * Get all schedules for today and set up Bull Queue jobs
   */
  async onModuleInit() {
    this.logger.log('🚀 Application started - Setting up schedules for today...');
    await this.setupDailySchedules();
  }

  /**
   * Run at midnight (start of day)
   * Get all schedules for today and set up Bull Queue jobs
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async setupDailySchedules() {
    this.logger.log('🕐 Setting up schedules for today...');

    // Clear previous jobs
    await this.clearAllJobs();

    const todaySchedules = await this.scheduleService.getTodaysSchedules();

    if (todaySchedules.length === 0) {
      this.logger.log('No schedules for today');
      return;
    }

    this.logger.log(`Found ${todaySchedules.length} schedule(s) for today`);

    for (const schedule of todaySchedules) {
      await this.setupSchedule(schedule);
    }

    this.logger.log('✅ Daily schedules setup completed');
  }

  /**
   * Setup individual schedule
   */
  async setupSchedule(schedule: Schedule): Promise<void> {
    try {

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if schedule has expired
      if (schedule.endDate) {

        const endDate = new Date(schedule.endDate);
        endDate.setHours(0, 0, 0, 0);

        if (today > endDate) {
          await this.scheduleService.updateSchedule(schedule.id, { status: 'completed' as any });
          this.logger.log(`⏰ Schedule expired: ${schedule.title}`);
          return;
        }
      }



      const nextRunDate = new Date(schedule.nextRunDate);
      nextRunDate.setHours(0, 0, 0, 0);

      if (nextRunDate.getTime() === today.getTime()) {


        const timeOfDay = schedule.timeOfDay || '00:00';
        const [startHour, startMinute] = timeOfDay.split(':').map(Number);

        // If NO interval - schedule ONE job at timeOfDay
        if (!schedule.interval) {
          await this.scheduleFixedTimeJob(schedule, startHour, startMinute);
        } else {

          // If HAS interval - schedule jobs based on interval
          const endTimeStr = schedule.endTime || '23:59';
          const [endHour, endMinute] = endTimeStr.split(':').map(Number);

          await this.scheduleIntervalJobs(schedule, startHour, startMinute, endHour, endMinute);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to setup schedule ${schedule.title}: ${error.message}`);
    }
  }



  /**
   * Handle execution failure with retry logic
   */
  private async handleExecutionFailure(schedule: Schedule, errorMessage: string): Promise<void> {
    await this.scheduleService.trackExecution(schedule.id, false, errorMessage);
    this.logger.error(`❌ Failed: ${schedule.title} - ${errorMessage}`);

    // Check if retry is enabled and we haven't exceeded max retries
    if (schedule.retryOnFailure && schedule.currentRetries < schedule.maxRetries) {
      const newRetryCount = schedule.currentRetries + 1;
      await this.scheduleService.updateSchedule(schedule.id, { currentRetries: newRetryCount } as any);

      this.logger.log(`🔄 Scheduling retry ${newRetryCount}/${schedule.maxRetries} for: ${schedule.title} in ${schedule.retryDelayMinutes} minutes`);

      // Schedule retry after delay
      setTimeout(async () => {
        this.logger.log(`🔄 Retrying (${newRetryCount}/${schedule.maxRetries}): ${schedule.title}`);
        try {
          await this.performAction(schedule);
          await this.scheduleService.trackExecution(schedule.id, true);
          // Reset retry count on success
          await this.scheduleService.updateSchedule(schedule.id, { currentRetries: 0 } as any);
          this.logger.log(`✅ Retry succeeded: ${schedule.title}`);
        } catch (retryError) {
          // Recursive retry handling
          await this.handleExecutionFailure(schedule, retryError.message);
        }
      }, schedule.retryDelayMinutes * 60 * 1000);
    } else if (schedule.retryOnFailure && schedule.currentRetries >= schedule.maxRetries) {
      this.logger.error(`❌ Max retries (${schedule.maxRetries}) reached for: ${schedule.title}`);
      // Reset retry count for next execution
      await this.scheduleService.updateSchedule(schedule.id, { currentRetries: 0 } as any);
    }
  }

  /**
   * Schedule a fixed-time job (no interval) using Bull Queue
   */
  private async scheduleFixedTimeJob(schedule: Schedule, hour: number, minute: number): Promise<void> {
    const runDate = new Date();
    runDate.setHours(hour, minute, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (runDate <= new Date()) {
      runDate.setDate(runDate.getDate() + 1);
    }

    const delay = runDate.getTime() - Date.now();

    const job = await this.bullQueueService.addJob({
      queueName: 'schedule',
      jobName: schedule.action,
      action: schedule.action,
      data: schedule.data,
      entityId: schedule.entityId,
      options: {
        delay,
      },
    }
    );

    this.addJob(schedule.id, job.id!.toString());
    this.logger.log(`📅 Scheduled: ${schedule.title} at ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} (Job ID: ${job.id})`);
  }

  /**
   * Schedule interval-based jobs using Bull Queue
   */
  private async scheduleIntervalJobs(
    schedule: Schedule,
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number,
  ): Promise<void> {
    const jobIds: string[] = [];

    // Calculate all execution times based on interval
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    for (let timeInMinutes = startTimeInMinutes; timeInMinutes <= endTimeInMinutes; timeInMinutes += schedule.interval!) {
      const hour = Math.floor(timeInMinutes / 60);
      const minute = timeInMinutes % 60;

      // Skip if beyond 24 hours
      if (hour >= 24) break;

      const runDate = new Date();
      runDate.setHours(hour, minute, 0, 0);

      // If the time has already passed today, schedule for tomorrow
      if (runDate <= new Date()) {
        runDate.setDate(runDate.getDate() + 1);
      }

      const delay = runDate.getTime() - Date.now();

      const job = await this.bullQueueService.addJob(
        {
          queueName: 'schedule',
          jobName: schedule.action,
          action: schedule.action,
          data: schedule.data,
          entityId: schedule.entityId,
        },
      );

      jobIds.push(job.id!.toString());
    }

    // Schedule job to update next run date at end of day
    const updateRunDate = new Date();
    updateRunDate.setHours(endHour, endMinute, 0, 0);

    if (updateRunDate <= new Date()) {
      updateRunDate.setDate(updateRunDate.getDate() + 1);
    }

    const updateDelay = updateRunDate.getTime() - Date.now();

    const updateJob = await this.bullQueueService.addJob({
      queueName: 'schedule',
      jobName: 'update-next-run',
      action: 'update-next-run',
      data: { scheduleId: schedule.id },
      options: {
        delay: updateDelay,
      },
    });

    jobIds.push(updateJob.id!.toString());
    this.scheduledJobs.set(schedule.id, jobIds);

    this.logger.log(`📅 Scheduled interval: ${schedule.title} every ${schedule.interval} min from ${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')} to ${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')} (${jobIds.length} jobs)`);
  }

  /**
   * Unified schedule execution method
   */
  private async executeSchedule(schedule: Schedule, updateNextRun: boolean): Promise<void> {
    try {
      await this.performAction(schedule);
      await this.scheduleService.trackExecution(schedule.id, true);

      if (updateNextRun) {
        await this.scheduleService.executeAndUpdateNext(schedule.id);
      }

      await this.scheduleService.updateSchedule(schedule.id, { currentRetries: 0 } as any);
      this.logger.log(`✅ Executed: ${schedule.title}`);
    } catch (error) {
      await this.handleExecutionFailure(schedule, error.message);
    }
  }

  /**
   * Perform the actual action using the registry
   */
  private async performAction(schedule: Schedule): Promise<void> {
    this.logger.log(`Executing: ${schedule.action} for entity ${schedule.entityId || 'N/A'}`);
    await this.scheduleRegistry.executeAction(schedule.action, schedule.data, schedule.entityId);
  }

  /**
   * Add job to tracking map
   */
  private addJob(scheduleId: number, jobId: string): void {
    const existingJobs = this.scheduledJobs.get(scheduleId) || [];
    existingJobs.push(jobId);
    this.scheduledJobs.set(scheduleId, existingJobs);
  }

  /**
   * Clear all scheduled jobs
   */
  private async clearAllJobs(): Promise<void> {
    for (const [scheduleId, jobIds] of this.scheduledJobs.entries()) {
      for (const jobId of jobIds) {
        try {
          await this.bullQueueService.removeJob('schedule', jobId);
        } catch (error) {
          this.logger.warn(`Failed to remove job ${jobId}: ${error.message}`);
        }
      }
    }
    this.scheduledJobs.clear();
    this.logger.log('🧹 Cleared all previous jobs');
  }
}

