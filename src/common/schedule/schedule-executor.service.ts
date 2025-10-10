import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { CronExpressionParser } from 'cron-parser';
import { ScheduleService } from './schedule.service';
import { Schedule } from './entities/schedule.entity';
import { LoggerService } from '../logger/logger.service';
import { EScheduleFrequency, EScheduleStatus } from 'shared/enums/schedule.enum';

@Injectable()
export class ScheduleExecutorService implements OnModuleInit {
  private readonly logger = new LoggerService(ScheduleExecutorService.name);
  private scheduledJobs: Map<number, CronJob[]> = new Map();

  constructor(
    private readonly scheduleService: ScheduleService,
  ) { }

  /**
   * Run on application boot
   * Get all schedules for today and set up cron jobs
   */
  async onModuleInit() {
    this.logger.log('🚀 Application started - Setting up schedules for today...');
    await this.setupDailySchedules();
  }

  /**
   * Run at midnight (start of day)
   * Get all schedules for today and set up cron jobs
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async setupDailySchedules() {
    this.logger.log('🕐 Setting up schedules for today...');

    // Clear previous jobs
    this.clearAllJobs();

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
          this.scheduleFixedTimeJob(schedule, startHour, startMinute);
        } else {

          // If HAS interval - schedule jobs based on interval
          const endTimeStr = schedule.endTime || '23:59';
          const [endHour, endMinute] = endTimeStr.split(':').map(Number);

          this.scheduleIntervalJobs(schedule, startHour, startMinute, endHour, endMinute);
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
   * Schedule a fixed-time job (no interval)
   */
  private scheduleFixedTimeJob(schedule: Schedule, hour: number, minute: number): void {


    const cronTime = `${minute} ${hour} * * *`; // Run at specific time daily

    const job = new CronJob(cronTime, async () => {
      try {
        await this.performAction(schedule);
        await this.scheduleService.trackExecution(schedule.id, true);
        await this.scheduleService.executeAndUpdateNext(schedule.id);
        // Reset retry count on success
        await this.scheduleService.updateSchedule(schedule.id, { currentRetries: 0 } as any);
        this.logger.log(`✅ Executed: ${schedule.title}`);
      } catch (error) {
        await this.handleExecutionFailure(schedule, error.message);
      }
    });

    job.start();
    this.addJob(schedule.id, job);

    this.logger.log(`📅 Scheduled: ${schedule.title} at ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
  }

  /**
   * Schedule interval-based jobs
   */
  private scheduleIntervalJobs(
    schedule: Schedule,
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number,
  ): void {
    const jobs: CronJob[] = [];

    // Calculate all execution times based on interval
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    for (let timeInMinutes = startTimeInMinutes; timeInMinutes <= endTimeInMinutes; timeInMinutes += schedule.interval!) {
      const hour = Math.floor(timeInMinutes / 60);
      const minute = timeInMinutes % 60;

      // Skip if beyond 24 hours
      if (hour >= 24) break;

      const cronTime = `${minute} ${hour} * * *`;

      const job = new CronJob(cronTime, async () => {
        try {
          await this.performAction(schedule);
          await this.scheduleService.trackExecution(schedule.id, true);
          // Reset retry count on success
          await this.scheduleService.updateSchedule(schedule.id, { currentRetries: 0 } as any);
          this.logger.log(`✅ Executed interval: ${schedule.title} at ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        } catch (error) {
          await this.handleExecutionFailure(schedule, error.message);
        }
      });

      job.start();
      jobs.push(job);
    }

    // Schedule job to update next run date at end of day
    const updateCronTime = `${endMinute} ${endHour} * * *`;
    const updateJob = new CronJob(updateCronTime, async () => {
      try {
        await this.scheduleService.executeAndUpdateNext(schedule.id);
        this.logger.log(`📅 Updated next run for: ${schedule.title}`);
      } catch (error) {
        this.logger.error(`Failed to update schedule: ${error.message}`);
      }
    });

    updateJob.start();
    jobs.push(updateJob);

    this.scheduledJobs.set(schedule.id, jobs);

    this.logger.log(`📅 Scheduled interval: ${schedule.title} every ${schedule.interval} min from ${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')} to ${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`);
  }

  /**
   * Perform the actual action
   */
  private async performAction(schedule: Schedule): Promise<void> {
    this.logger.log(`Executing: ${schedule.action} for entity ${schedule.entityId || 'N/A'}`);

    switch (schedule.action) {
      default:
        this.logger.warn(`Unknown action: ${schedule.action}`);
    }
  }

  /**
   * Add job to tracking map
   */
  private addJob(scheduleId: number, job: CronJob): void {
    const existingJobs = this.scheduledJobs.get(scheduleId) || [];
    existingJobs.push(job);
    this.scheduledJobs.set(scheduleId, existingJobs);
  }

  /**
   * Clear all scheduled jobs
   */
  private clearAllJobs(): void {
    for (const [scheduleId, jobs] of this.scheduledJobs.entries()) {
      for (const job of jobs) {
        job.stop();
      }
    }
    this.scheduledJobs.clear();
    this.logger.log('🧹 Cleared all previous jobs');
  }
}

