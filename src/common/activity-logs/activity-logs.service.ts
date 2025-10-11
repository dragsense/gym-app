import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ActivityLog } from './entities/activity-log.entity';
import { 
  ActivityLogListDto, 
} from 'shared/dtos/activity-log-dtos';
import { IPaginatedResponse } from 'shared/interfaces';
import { CreateActivityLogDto } from './dtos/create-activity-log.dto';

export interface ActivityLogConfig {
  enabled: boolean;
  logEndpoints: string[];
  logMethods: string[];
  logActivityTypes: string[];
}

@Injectable()
export class ActivityLogsService {
  private config: ActivityLogConfig;

  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    private readonly configService: ConfigService,
  ) {
    this.loadConfig();
  }

  /**
   * Load activity log configuration from environment
   */
  private loadConfig(): void {
    this.config = {
      enabled: this.configService.get<boolean>('activityLogs.enabled', true),
      logEndpoints: this.configService.get<string[]>('activityLogs.logEndpoints', []),
      logMethods: this.configService.get<string[]>('activityLogs.logMethods', ['POST', 'PUT', 'DELETE', 'PATCH']),
      logActivityTypes: this.configService.get<string[]>('activityLogs.logActivityTypes', []),
    };
  }

  /**
   * Check if activity should be logged based on configuration
   */
  shouldLogActivity(
    endpoint: string,
    method: string,
    activityType?: string
  ): boolean {
    // If logging is disabled, don't log
    if (!this.config.enabled) {
      return false;
    }

    // Check if endpoint should be logged (if logEndpoints is empty, log all)
    if (this.config.logEndpoints.length > 0) {
      const shouldLogEndpoint = this.config.logEndpoints.some(logged => endpoint.includes(logged));
      if (!shouldLogEndpoint) {
        return false;
      }
    }

    // Check if method should be logged
    if (!this.config.logMethods.includes(method.toUpperCase())) {
      return false;
    }

    // Check activity type filtering
    if (activityType && this.config.logActivityTypes.length > 0) {
      const shouldLogType = this.config.logActivityTypes.includes(activityType);
      if (!shouldLogType) {
        return false;
      }
    }

    return true;
  }

  async findOne(
    where: FindOptionsWhere<ActivityLog>,
    options?: {
      select?: (keyof ActivityLog)[];
      relations?: string[];
    }
  ): Promise<ActivityLog> {
    const { select, relations = ['user'] } = options || {};

    const activityLog = await this.activityLogRepository.findOne({
      where,
      select,
      relations,
    });

    if (!activityLog) {
      throw new NotFoundException('Activity log not found');
    }

    return activityLog;
  }

  async create(createActivityLogDto: CreateActivityLogDto): Promise<void> {
    // Check if activity should be logged based on configuration
    const shouldLog = this.shouldLogActivity(
      createActivityLogDto.endpoint || '',
      createActivityLogDto.method || '',
      createActivityLogDto.type
    );

    if (!shouldLog) {
      return;
    }

    const activityLog = this.activityLogRepository.create(createActivityLogDto);
    await this.activityLogRepository.save(activityLog);
  }

  async findAll(queryDto: ActivityLogListDto): Promise<IPaginatedResponse<ActivityLog>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy,
      sortOrder,
      createdAfter,
      createdBefore,
      type,
      ...filters
    } = queryDto;

    const skip = (page - 1) * limit;
    const query = this.activityLogRepository.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile');

    // Apply search
    if (search) {
      query.andWhere(
        '(activity.action ILIKE :search OR activity.description ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply filters


    if (type) {
      query.andWhere('activity.type = :type', { type });
    }



    // Apply date filters
    if (createdAfter) {
      query.andWhere('activity.createdAt >= :createdAfter', { createdAfter });
    }
    if (createdBefore) {
      query.andWhere('activity.createdAt <= :createdBefore', { createdBefore });
    }

    // Apply extra filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query.andWhere(`activity.${key} = :${key}`, { [key]: value });
      }
    });

    // Apply sorting
    const sortColumn = sortBy || 'createdAt';
    const sortDirection = (sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';
    query.orderBy(`activity.${String(sortColumn)}`, sortDirection);

    const [data, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

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
}
