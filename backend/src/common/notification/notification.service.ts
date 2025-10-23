import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Notification } from './entities/notification.entity';
import {
  NotificationListDto,
} from '@shared/dtos/notification-dtos';
import { IPaginatedResponse } from '@shared/interfaces';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { CrudService } from '@/common/crud/crud.service';
import { EventService } from '../helper/services/event.service';

export interface NotificationConfig {
  enabled: boolean;
  logEndpoints: string[];
  logMethods: string[];
  logNotificationTypes: string[];
}

@Injectable()
export class NotificationService extends CrudService<Notification> {

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly configService: ConfigService,
    dataSource: DataSource,
    eventService: EventService,
  ) {
    super(notificationRepository, dataSource, eventService);
  }

  /**
   * Check if notification should be logged based on configuration
   */
  shouldLogNotification(
    notificationType?: string
  ): boolean {


    const config = this.configService.get('notifications');

    if (!config.enabled) {
      return false;
    }


    if (config.logNotificationTypes.length > 0) {
      const shouldLogType = config.logNotificationTypes.includes(notificationType);
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
  async markAllAsRead(entityId: number) {
    return await this.update({ entityId, isRead: false }, { isRead: true });
  }





  /**
   * Get unread count for a user
   */
  async getUnreadCount(entityId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: { entityId, isRead: false },
    });
  }

}
