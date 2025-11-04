import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { CrudService } from '@/common/crud/crud.service';
import { NotificationSenderService } from './notification-sender.service';

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
    private readonly notificationSenderService: NotificationSenderService,
    moduleRef: ModuleRef,
  ) {
    super(notificationRepository, moduleRef);
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
    // Create the notification in database
    const notification = await this.create(createNotificationDto);

    // Send notification through enabled channels (in-app, email, SMS, push)
    if (notification && notification.entityId) {
      try {
        await this.notificationSenderService.sendNotification(notification);
      } catch (error) {
        // Log error but don't fail the notification creation
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Failed to send notification ${notification.id}: ${errorMessage}`,
        );
      }
    }

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
