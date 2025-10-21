import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, MoreThanOrEqual, DataSource } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import {
  CreateScheduleDto,
  UpdateScheduleDto
} from 'shared/dtos/schedule-dtos/schedule.dto';
import { EScheduleStatus, EScheduleFrequency } from 'shared/enums/schedule.enum';
import { ScheduleUtils } from './utils/schedule.utils';
import { CrudService } from '@/common/crud/crud.service';
import { EventService } from '../helper/services/event.service';

@Injectable()
export class ScheduleService extends CrudService<Schedule> {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
    dataSource: DataSource,
    eventService: EventService,
  ) {
    super(scheduleRepo, dataSource, eventService);
  }

  /**
   * Create schedule and calculate first nextRunDate
   */
  async createSchedule(
    createDto: CreateScheduleDto,
    timezone?: string,
    manager?: EntityManager,
  ): Promise<Schedule> {
    // Validate frequency-specific fields
    this.validateScheduleConfig(createDto);

    // Keep dates with timezone info as sent from frontend
    const startDate = new Date(createDto.startDate || new Date());
    const endDate = createDto.endDate ? new Date(new Date(createDto.endDate).setHours(23, 59, 59, 999)) : undefined;
    const selectedTimezone = createDto.timezone || timezone || 'UTC';
    // Generate cron expression
    const cronExpression = ScheduleUtils.generateCronExpression(
      {
        frequency: createDto.frequency || EScheduleFrequency.ONCE,
        weekDays: createDto.weekDays,
        monthDays: createDto.monthDays,
        months: createDto.months,
      },
      createDto.timeOfDay || '00:00',
      0 // No delay for first run
    );

    // Calculate next run date using cron-parser
    const { nextRunAt, isActive } = ScheduleUtils.calculateNextRun(
      cronExpression,
      startDate,
      endDate || null,
      selectedTimezone
    );

    const schedule = this.scheduleRepo.create({
      ...createDto,
      frequency: createDto.frequency || EScheduleFrequency.ONCE,
      timezone: selectedTimezone,
      startDate,
      endDate,
      cronExpression,
      status: isActive ? EScheduleStatus.ACTIVE : EScheduleStatus.COMPLETED,
      nextRunDate: nextRunAt,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
    });

    return manager ? await manager.save(schedule) : await this.scheduleRepo.save(schedule);
  }

  /**
   * Track successful execution
   */
  async trackExecution(id: number, success: boolean, errorMessage?: string): Promise<void> {
    const schedule = await this.getSingle(id);

    schedule.executionCount += 1;
    schedule.lastRunAt = new Date();
    schedule.lastExecutionStatus = success ? 'success' : 'failed';

    if (success) {
      schedule.successCount += 1;
      schedule.lastErrorMessage = undefined;
    } else {
      schedule.failureCount += 1;
      schedule.lastErrorMessage = errorMessage || 'Unknown error';
    }

    // Update execution history (keep last 50)
    const history = schedule.executionHistory || [];
    history.unshift({
      executedAt: new Date(),
      status: success ? 'success' : 'failed',
      errorMessage: success ? undefined : errorMessage,
    });

    // Keep only last 50 executions
    schedule.executionHistory = history.slice(0, 50);

    await this.scheduleRepo.save(schedule);
  }

  /**
   * Validate schedule configuration based on frequency
   */
  private validateScheduleConfig(dto: CreateScheduleDto | any): void {
    switch (dto.frequency) {
      case EScheduleFrequency.WEEKLY:
        if (!dto.weekDays || dto.weekDays.length === 0) {
          throw new BadRequestException('weekDays is required for WEEKLY frequency');
        }
        break;

      case EScheduleFrequency.MONTHLY:
        if (!dto.monthDays || dto.monthDays.length === 0) {
          throw new BadRequestException('monthDays is required for MONTHLY frequency');
        }
        break;

      case EScheduleFrequency.YEARLY:
        if (!dto.months || dto.months.length === 0) {
          throw new BadRequestException('months is required for YEARLY frequency');
        }
        break;
    }
  }





  /**
   * Get schedule by ID (alias for findOne)
   */
  async getScheduleById(id: number): Promise<Schedule> {
    return this.getSingle(id);
  }

  /**
   * Get all schedules that should run today
   */
  async getTodaysSchedules(): Promise<Schedule[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.scheduleRepo.find({
      where: {
        status: EScheduleStatus.ACTIVE,
        nextRunDate: MoreThanOrEqual(today),
      },
      order: { timeOfDay: 'ASC' },
    });
  }

  /**
   * Execute schedule and update nextRunDate
   */
  async executeAndUpdateNext(id: number): Promise<Schedule> {
    const schedule = await this.getSingle(id);

    schedule.lastRunAt = new Date();

    // Calculate next run date using cron expression
    if (schedule.frequency === EScheduleFrequency.ONCE) {
      schedule.status = EScheduleStatus.COMPLETED;
    } else if (schedule.cronExpression) {
      const timezone = schedule.timezone || 'UTC';
      const nextRunAt = ScheduleUtils.getNextRunDate(
        schedule.cronExpression,
        new Date(),
        timezone
      );

      // Check if next run is beyond end date
      if (schedule.endDate && nextRunAt > schedule.endDate) {
        schedule.status = EScheduleStatus.COMPLETED;
      } else {
        schedule.nextRunDate = nextRunAt;
      }
    }

    return await this.scheduleRepo.save(schedule);
  }

  async updateSchedule(
    id: number,
    updateData: UpdateScheduleDto,
    timezone?: string,
    manager?: EntityManager,
  ): Promise<Schedule> {
    const schedule = await this.getSingle(id);

    // If frequency-related fields changed, recalculate cron and nextRunDate
    if (updateData.startDate || updateData.frequency || updateData.timeOfDay ||
      updateData.weekDays !== undefined || updateData.monthDays || updateData.months) {

      // Merge with existing schedule for validation
      const merged = { ...schedule, ...updateData };
      this.validateScheduleConfig(merged);

      const newStartDate = updateData.startDate
        ? new Date(updateData.startDate)
        : schedule.startDate;

      const newEndDate = updateData.endDate !== undefined
        ? (updateData.endDate ? new Date(new Date(updateData.endDate).setHours(23, 59, 59, 999)) : undefined)
        : schedule.endDate;


      const selectedTimezone = merged.timezone || timezone || 'UTC';

      // Regenerate cron expression
      const cronExpression = ScheduleUtils.generateCronExpression(
        {
          frequency: merged.frequency,
          weekDays: merged.weekDays,
          monthDays: merged.monthDays,
          months: merged.months,
        },
        merged.timeOfDay || '00:00',
        0
      );

      // Calculate next run date
      const { nextRunAt, isActive } = ScheduleUtils.calculateNextRun(
        cronExpression,
        newStartDate,
        newEndDate || null,
        selectedTimezone
      );

      Object.assign(schedule, updateData, {
        startDate: newStartDate,
        endDate: newEndDate,
        cronExpression,
        nextRunDate: nextRunAt,
        status: isActive ? schedule.status : EScheduleStatus.COMPLETED,
        timezone: selectedTimezone,
      });
    } else {
      Object.assign(schedule, updateData);
    }

    return manager ? await manager.save(schedule) : await this.scheduleRepo.save(schedule);
  }



}

