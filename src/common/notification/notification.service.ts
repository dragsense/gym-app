import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Notification } from './entities/notification.entity';
import { 
  NotificationListDto, 
} from 'shared/dtos/notification-dtos';
import { IPaginatedResponse } from 'shared/interfaces';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { CrudService } from '@/common/crud/crud.service';
import { EventService } from '../events/event.service';

export interface NotificationConfig {
  enabled: boolean;
  logEndpoints: string[];
  logMethods: string[];
  logNotificationTypes: string[];
}

@Injectable()
export class NotificationService extends CrudService<Notification> {
  private config: NotificationConfig;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly configService: ConfigService,
    dataSource: DataSource,
    eventService: EventService,
  ) {
    super(notificationRepository, dataSource, eventService);
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

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification | null> {
    // Check if notification should be logged based on configuration
    const shouldLog = this.shouldLogNotification(
      createNotificationDto.endpoint || '',
      createNotificationDto.method || '',
      createNotificationDto.type
    );

    if (!shouldLog) {
      return null;
    }

    return await this.create(createNotificationDto);
  }

 

  /**
   * Mark a notification as read
   */
  async markAsRead(id: number): Promise<Notification> {
    return await this.update(id, { isRead: true });
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
   * Get unread count for a user
   */
  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

}
