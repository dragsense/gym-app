import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { ScheduleService } from '../schedule.service';
import { Schedule } from '../entities/schedule.entity';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class ScheduleExecutorService implements OnModuleInit {
  private readonly logger = new LoggerService(ScheduleExecutorService.name);

  constructor(
    private readonly scheduleService: ScheduleService,
    @InjectQueue('schedule') private scheduleQueue: Queue,
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
    await this.cleanupPreviousSchedules();

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
  * Clean up previous day's schedules from Bull queue
  */
  private async cleanupPreviousSchedules(): Promise<void> {
    try {
      this.logger.log('Cleaning up previous day\'s schedules...');

      // Get all jobs from the schedule queue
      const allJobs = await this.scheduleQueue.getJobs(['waiting', 'active', 'completed', 'failed', 'delayed']);

      // Remove all jobs from the schedule queue
      for (const job of allJobs) {
        try {
          await job.remove();
          this.logger.log(`Removed job: ${job.id} from schedule queue`);
        } catch (error) {
          this.logger.error(`Failed to remove job ${job.id}: ${error.message}`);
        }
      }

      // Clean the queue completely
      await this.scheduleQueue.clean(0, 'completed');
      await this.scheduleQueue.clean(0, 'failed');

      this.logger.log('Previous day\'s schedules cleaned up successfully');
    } catch (error) {
      this.logger.error(`Failed to cleanup previous schedules: ${error.message}`);
    }
  }

  /**
   * Setup individual schedule using Bull Queue repeat functionality
   */
  async setupSchedule(schedule: Schedule): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const nextRunDate = new Date(schedule.nextRunDate);
      nextRunDate.setHours(0, 0, 0, 0);

      if (nextRunDate.getTime() === today.getTime()) {
        await this.scheduleJob(schedule);
      }
    } catch (error) {
      this.logger.error(`Failed to setup schedule ${schedule.title}: ${error.message}`);
    }
  }


  /**
   * Unified job scheduling using Bull Queue repeat functionality
   */
  private async scheduleJob(schedule: Schedule): Promise<void> {
    const timeOfDay = schedule.timeOfDay || '00:00';
    const [startHour, startMinute] = timeOfDay.split(':').map(Number);

    // Calculate start time for today
    const startTime = new Date();
    startTime.setHours(startHour, startMinute, 0, 0);


    const jobOptions: any = {
      delay: startTime.getTime() - Date.now(),
      removeOnFail: schedule.retryOnFailure ? 50 : 0,
      attempts:  schedule.retryOnFailure ? schedule.maxRetries : 1,
    };

    // If interval is specified, use Bull Queue repeat functionality
    if (schedule.interval) {
      const endTimeStr = schedule.endTime || '23:59';
      const [endHour, endMinute] = endTimeStr.split(':').map(Number);

      // Calculate end time for today
      const endTime = new Date();
      endTime.setHours(endHour, endMinute, 0, 0);

      // If end time has passed, set for tomorrow
      if (endTime <= new Date()) {
        endTime.setDate(endTime.getDate() + 1);
      }

      // Use Bull Queue repeat with interval
      jobOptions.repeat = {
        every: schedule.interval * 60 * 1000, // Convert minutes to milliseconds
        until: endTime,
      };
    }

    const job = await this.scheduleQueue.add(schedule.action, {
      ...schedule.data,
      scheduleId: schedule.id,
      isRepeating: !!schedule.interval,
      entityId: schedule.entityId,
    }, jobOptions);

    this.logger.log(`Scheduled job: ${schedule.title} at ${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')} (Job ID: ${job.id})`);
  }


}

