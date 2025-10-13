import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduleService } from '../schedule.service';
import { LoggerService } from '../../logger/logger.service';
import { BullQueueService } from '../../bull-queue/bull-queue.service';

@Injectable()
export class ScheduleBullService implements OnModuleInit {
  private readonly logger = new LoggerService(ScheduleBullService.name);
  private readonly scheduleQueueName = 'schedule';

  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly bullQueueService: BullQueueService,
  ) {}

  async onModuleInit() {
    this.logger.log('Schedule Bull Service initialized');
    await this.bullQueueService.createQueue({
      name: this.scheduleQueueName,
      options: {
        removeOnComplete: true,
      },
    });
    await this.setupDailySchedules();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async setupDailySchedules() {
    this.logger.log('Setting up schedules for today...');

    // First, clean up yesterday's schedules from Bull queue
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

    this.logger.log('Daily schedules setup completed');
  }

  /**
   * Clean up previous day's schedules from Bull queue
   */
  private async cleanupPreviousSchedules(): Promise<void> {
    try {
      this.logger.log('Cleaning up previous day\'s schedules...');
      
      // Get all jobs from the schedule queue
      const allJobs = await this.bullQueueService.getJobs(this.scheduleQueueName);
      
      // Remove all jobs from the schedule queue
      for (const job of allJobs) {
        try {
          await this.bullQueueService.removeJob(this.scheduleQueueName, job.id.toString());
          this.logger.log(`Removed job: ${job.id} from schedule queue`);
        } catch (error) {
          this.logger.error(`Failed to remove job ${job.id}: ${error.message}`);
        }
      }
      
      // Clean the queue completely
      await this.bullQueueService.cleanQueue(this.scheduleQueueName, 0);
      
      this.logger.log('Previous day\'s schedules cleaned up successfully');
    } catch (error) {
      this.logger.error(`Failed to cleanup previous schedules: ${error.message}`);
    }
  }

  async setupSchedule(schedule: any): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (schedule.endDate) {
        const endDate = new Date(schedule.endDate);
        endDate.setHours(0, 0, 0, 0);

        if (today > endDate) {
          await this.scheduleService.updateSchedule(schedule.id, { status: 'completed' as any });
          this.logger.log(`Schedule expired: ${schedule.title}`);
          return;
        }
      }

      const nextRunDate = new Date(schedule.nextRunDate);
      nextRunDate.setHours(0, 0, 0, 0);

      if (nextRunDate.getTime() === today.getTime()) {
        const timeOfDay = schedule.timeOfDay || '00:00';
        const [startHour, startMinute] = timeOfDay.split(':').map(Number);

        if (!schedule.interval) {
          await this.scheduleFixedTimeJob(schedule, startHour, startMinute);
        } else {
          const endTimeStr = schedule.endTime || '23:59';
          const [endHour, endMinute] = endTimeStr.split(':').map(Number);
          await this.scheduleIntervalJobs(schedule, startHour, startMinute, endHour, endMinute);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to setup schedule ${schedule.title}: ${error.message}`);
    }
  }

  private async scheduleFixedTimeJob(schedule: any, hour: number, minute: number): Promise<void> {
    const runDate = new Date();
    runDate.setHours(hour, minute, 0, 0);
    
    if (runDate <= new Date()) {
      runDate.setDate(runDate.getDate() + 1);
    }

    const delay = runDate.getTime() - Date.now();

    await this.bullQueueService.addJob(
      {
        queueName: this.scheduleQueueName,
        jobName: schedule.action,
        action: schedule.action,
        data: schedule.data,
        entityId: schedule.entityId,
        userId: schedule.userId,
        options: {
          delay,
        },
      }
    );

    this.logger.log(`Scheduled: ${schedule.title} at ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
  }

  private async scheduleIntervalJobs(
    schedule: any,
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number,
  ): Promise<void> {
    // Calculate start time for today
    const startTime = new Date();
    startTime.setHours(startHour, startMinute, 0, 0);
    
    if (startTime <= new Date()) {
      startTime.setDate(startTime.getDate() + 1);
    }

    // Calculate end time for today
    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);
    
    if (endTime <= new Date()) {
      endTime.setDate(endTime.getDate() + 1);
    }

    // Use addScheduledJob function with repeat options
    await this.addScheduledJob(
      schedule.action,
      {
        ...schedule.data,
        scheduleId: schedule.id,
        scheduleTitle: schedule.title,
        interval: schedule.interval,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isInterval: true,
      },
      startTime.getTime() - Date.now(),
      schedule.entityId,
      schedule.userId
    );

    this.logger.log(`Scheduled interval job: ${schedule.title} every ${schedule.interval} min from ${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')} to ${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`);
  }

  /**
   * Helper function to add a scheduled job using BullQueueService
   * Uses schedule entity data directly
   */
  private async addScheduledJob(
    action: string,
    data?: Record<string, any>,
    delay?: number,
    entityId?: number,
    userId?: number,
  ): Promise<any> {
    const options: any = {};
    
    if (delay) {
      options.delay = delay;
    }
    
    // Check if this is an interval job based on schedule entity data
    if (data?.isInterval && data?.interval) {
      // Convert interval from minutes to milliseconds for Bull queue
      const intervalMs = data.interval * 60 * 1000;
      
      options.repeat = {
        every: intervalMs,
        until: data.endTime ? new Date(data.endTime).getTime() : undefined,
      };
      options.removeOnComplete = true;
      options.removeOnFail = false;
    }

    return this.bullQueueService.addJob({
      queueName: this.scheduleQueueName,
      jobName: action,
      action,
      data,
      entityId,
      userId,
      options,
    });
  }

}
