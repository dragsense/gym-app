import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, MoreThanOrEqual } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { 
  ScheduleListDto, 
  CreateScheduleDto, 
  UpdateScheduleDto 
} from 'shared/dtos/schedule-dtos/schedule.dto';
import { IPaginatedResponse } from 'shared/interfaces';
import { EScheduleStatus, EScheduleFrequency } from 'shared/enums/schedule.enum';
import { ScheduleUtils } from './utils/schedule.utils';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
  ) {}

  /**
   * Create schedule and calculate first nextRunDate
   */
  async createSchedule(
    createDto: CreateScheduleDto,
    manager?: EntityManager,
  ): Promise<Schedule> {
    // Validate frequency-specific fields
    this.validateScheduleConfig(createDto);

    // Keep dates with timezone info as sent from frontend
    const startDate = new Date(createDto.startDate);
    const endDate = createDto.endDate ? new Date(new Date(createDto.endDate).setHours(23, 59, 59, 999)) : undefined;
    const timezone = createDto.timezone || 'UTC';

    // Generate cron expression
    const cronExpression = ScheduleUtils.generateCronExpression(
      {
        frequency: createDto.frequency,
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
      timezone
    );

    const schedule = this.scheduleRepo.create({
      ...createDto,
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
    const schedule = await this.findOne(id);

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
   * Get all schedules
   */
  async findAll(queryDto: ScheduleListDto): Promise<IPaginatedResponse<Schedule>> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      frequency,
      entityId,
      sortBy,
      sortOrder,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      ...filters
    } = queryDto;

    const skip = (page - 1) * limit;
    const query = this.scheduleRepo.createQueryBuilder('schedule');

    if (search) {
      query.andWhere('(schedule.title ILIKE :search OR schedule.action ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (status) query.andWhere('schedule.status = :status', { status });
    if (frequency) query.andWhere('schedule.frequency = :frequency', { frequency });
    if (entityId) query.andWhere('schedule.entityId = :entityId', { entityId });

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query.andWhere(`schedule.${key} = :${key}`, { [key]: value });
      }
    });

    if (createdAfter) query.andWhere('schedule.createdAt >= :createdAfter', { createdAfter });
    if (createdBefore) query.andWhere('schedule.createdAt <= :createdBefore', { createdBefore });
    if (updatedAfter) query.andWhere('schedule.updatedAt >= :updatedAfter', { updatedAfter });
    if (updatedBefore) query.andWhere('schedule.updatedAt <= :updatedBefore', { updatedBefore });

    const sortColumn = sortBy || 'nextRunDate';
    const sortDirection = (sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';
    query.orderBy(`schedule.${sortColumn}`, sortDirection);

    const [data, total] = await query.skip(skip).take(limit).getManyAndCount();

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      lastPage,
      hasNextPage: page < lastPage,
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: number): Promise<Schedule> {
    const schedule = await this.scheduleRepo.findOne({ where: { id } });
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    return schedule;
  }

  /**
   * Get schedule by ID (alias for findOne)
   */
  async getScheduleById(id: number): Promise<Schedule> {
    return this.findOne(id);
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
    const schedule = await this.findOne(id);
    
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
    manager?: EntityManager,
  ): Promise<Schedule> {
    const schedule = await this.findOne(id);
    
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

      const timezone = updateData.timezone || schedule.timezone || 'UTC';
      
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
        timezone
      );
      
      Object.assign(schedule, updateData, { 
        startDate: newStartDate,
        endDate: newEndDate,
        cronExpression,
        nextRunDate: nextRunAt,
        status: isActive ? schedule.status : EScheduleStatus.COMPLETED
      });
    } else {
      Object.assign(schedule, updateData);
    }

    return manager ? await manager.save(schedule) : await this.scheduleRepo.save(schedule);
  }

  async deleteSchedule(id: number): Promise<void> {
    const schedule = await this.findOne(id);
    await this.scheduleRepo.remove(schedule);
  }

}
 
