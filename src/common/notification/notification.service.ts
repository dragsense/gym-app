import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Notification } from './entities/notification.entity';
import { 
  NotificationListDto, 
} from 'shared/dtos/notification-dtos';
import { IPaginatedResponse } from 'shared/interfaces';
import { CreateNotificationDto } from './dtos/create-notification.dto';

export interface NotificationConfig {
  enabled: boolean;
  logEndpoints: string[];
  logMethods: string[];
  logNotificationTypes: string[];
}

@Injectable()
export class NotificationService {
  private config: NotificationConfig;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly configService: ConfigService,
  ) {
    this.loadConfig();
  }

  /**
   * Load notification configuration from environment
   */
  private loadConfig(): void {
    this.config = {
      enabled: this.configService.get<boolean>('notifications.enabled', true),
      logEndpoints: this.configService.get<string[]>('notifications.logEndpoints', []),
      logMethods: this.configService.get<string[]>('notifications.logMethods', ['POST', 'PUT', 'DELETE', 'PATCH']),
      logNotificationTypes: this.configService.get<string[]>('notifications.logNotificationTypes', []),
    };
  }

  /**
   * Check if notification should be logged based on configuration
   */
  shouldLogNotification(
    endpoint: string,
    method: string,
    notificationType?: string
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

    // Check notification type filtering
    if (notificationType && this.config.logNotificationTypes.length > 0) {
      const shouldLogType = this.config.logNotificationTypes.includes(notificationType);
      if (!shouldLogType) {
        return false;
      }
    }

    return true;
  }

  async findOne(
    where: FindOptionsWhere<Notification>,
    options?: {
      select?: (keyof Notification)[];
      relations?: string[];
    }
  ): Promise<Notification> {
    const { select, relations = ['user'] } = options || {};

    const notification = await this.notificationRepository.findOne({
      where,
      select,
      relations,
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async create(createNotificationDto: CreateNotificationDto): Promise<void> {
    // Check if notification should be logged based on configuration
    const shouldLog = this.shouldLogNotification(
      createNotificationDto.endpoint || '',
      createNotificationDto.method || '',
      createNotificationDto.type
    );

    if (!shouldLog) {
      return;
    }

    const notification = this.notificationRepository.create(createNotificationDto);
    await this.notificationRepository.save(notification);
  }

  async findAll(queryDto: NotificationListDto): Promise<IPaginatedResponse<Notification>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy,
      sortOrder,
      createdAfter,
      createdBefore,
      type,
      priority,
      isRead,
      userId,
      ...filters
    } = queryDto;

    const skip = (page - 1) * limit;
    const query = this.notificationRepository.createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile');

    // Apply search
    if (search) {
      query.andWhere(
        '(notification.title ILIKE :search OR notification.message ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply filters
    if (type) {
      query.andWhere('notification.type = :type', { type });
    }

    if (priority) {
      query.andWhere('notification.priority = :priority', { priority });
    }

    if (isRead !== undefined) {
      query.andWhere('notification.isRead = :isRead', { isRead });
    }

    if (userId) {
      query.andWhere('notification.userId = :userId', { userId });
    }

    // Apply date filters
    if (createdAfter) {
      query.andWhere('notification.createdAt >= :createdAfter', { createdAfter });
    }
    if (createdBefore) {
      query.andWhere('notification.createdAt <= :createdBefore', { createdBefore });
    }

    // Apply extra filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query.andWhere(`notification.${key} = :${key}`, { [key]: value });
      }
    });

    // Apply sorting
    const sortColumn = sortBy || 'createdAt';
    const sortDirection = (sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';
    query.orderBy(`notification.${String(sortColumn)}`, sortDirection);

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

  /**
   * Mark a notification as read
   */
  async markAsRead(id: number, userId?: number): Promise<Notification> {
    const whereCondition: FindOptionsWhere<Notification> = { id };
    if (userId) {
      whereCondition.userId = userId;
    }

    const notification = await this.findOne(whereCondition);
    await this.notificationRepository.update(id, { isRead: true });
    
    return this.findOne({ id });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: number): Promise<{ count: number }> {
    const result = await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true }
    );
    
    return { count: result.affected || 0 };
  }

  /**
   * Delete a notification
   */
  async delete(id: number, userId?: number): Promise<void> {
    const whereCondition: FindOptionsWhere<Notification> = { id };
    if (userId) {
      whereCondition.userId = userId;
    }

    await this.findOne(whereCondition); // This will throw if not found
    await this.notificationRepository.delete(id);
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllForUser(userId: number): Promise<{ count: number }> {
    const result = await this.notificationRepository.delete({ userId });
    return { count: result.affected || 0 };
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

}
