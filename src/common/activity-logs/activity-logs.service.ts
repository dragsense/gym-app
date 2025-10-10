import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { 
  ActivityLogListDto, 
} from 'shared/dtos/activity-log-dtos';
import { IPaginatedResponse } from 'shared/interfaces';
import { CreateActivityLogDto } from './dtos/create-activity-log.dto';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

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
