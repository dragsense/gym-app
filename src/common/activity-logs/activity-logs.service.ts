import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ActivityLog } from './entities/activity-log.entity';
import { 
  ActivityLogListDto, 
} from 'shared/dtos/activity-log-dtos';
import { IPaginatedResponse } from 'shared/interfaces';
import { CreateActivityLogDto } from './dtos/create-activity-log.dto';
import { CrudService } from '@/common/crud/crud.service';
import { EventService } from '../events/event.service';

export interface ActivityLogConfig {
  enabled: boolean;
  logEndpoints: string[];
  logMethods: string[];
  logActivityTypes: string[];
}

@Injectable()
export class ActivityLogsService extends CrudService<ActivityLog> {
  private config: ActivityLogConfig;

  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    private readonly configService: ConfigService,
    dataSource: DataSource,
    eventService: EventService,
  ) {
    super(activityLogRepository, dataSource, eventService);
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



  async createActivityLog(createActivityLogDto: CreateActivityLogDto): Promise<ActivityLog | null> {
    // Check if activity should be logged based on configuration
    const shouldLog = this.shouldLogActivity(
      createActivityLogDto.endpoint || '',
      createActivityLogDto.method || '',
      createActivityLogDto.type
    );

    if (!shouldLog) {
      return null;
    }

    return await this.create(createActivityLogDto);
  }

}
