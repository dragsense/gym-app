import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { CrudService } from '@/common/crud/crud.service';

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
    moduleRef: ModuleRef,
  ) {
    super(notificationRepository, moduleRef);
  }

  /**
   * Check if notification should be logged based on configuration
   */
  shouldLogNotification(notificationType?: string): boolean {
    const config = this.configService.get(
      'notifications',
    ) as NotificationConfig;

    if (!config?.enabled) {
      return false;
    }

    if (config.logNotificationTypes?.length > 0 && notificationType) {
      const shouldLogType =
        config.logNotificationTypes.includes(notificationType);
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
    },
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

  async createNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification | null> {
    // Check if notification should be logged based on configuration
    const shouldLog = this.shouldLogNotification(createNotificationDto.type);

    if (!shouldLog) {
      return null;
    }

    // Create the notification in database
    const notification = await this.create(createNotificationDto);
    return notification;
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.update(id, { isRead: true });

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(entityId: string) {
    const result = await this.update(
      { entityId, isRead: false },
      { isRead: true },
    );

    return result;
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(entityId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { entityId, isRead: false },
    });
  }
}
