import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '@/common/base-user/entities/user.entity';
import { NotificationService } from '@/common/notification/notification.service';
import {
  ENotificationPriority,
  ENotificationType,
} from '@shared/enums/notification.enum';
import { EUserLevels } from '@shared/enums/user.enum';
import { Billing } from '../entities/billing.entity';
import { EBillingStatus } from '@shared/enums/billing.enum';

@Injectable()
export class BillingNotificationService {
  private readonly logger = new Logger(BillingNotificationService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Send notification to recipient when billing is created
   */
  async notifyBillingCreated(billing: Billing, createdBy?: string): Promise<void> {
    try {
      await this.notificationService.createNotification({
        title: 'New Billing Created',
        message: `A new billing "${billing.title}" for $${billing.amount} has been created. Due date: ${new Date(billing.dueDate).toLocaleDateString()}`,
        type: ENotificationType.INFO,
        priority: ENotificationPriority.NORMAL,
        entityId: billing.recipientUser.id,
        entityType: 'billing',
        emailSubject: `New Billing: ${billing.title}`,
        metadata: {
          action: 'billing_created',
          billingId: billing.id,
          amount: billing.amount,
          dueDate: billing.dueDate,
          createdBy,
        },
      });

      this.logger.log(
        `✅ Notification sent for billing ${billing.id} to user ${billing.recipientUser.id}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `❌ Failed to send notification for billing ${billing.id}: ${errorMessage}`,
      );
    }
  }

  /**
   * Send notification to recipient when billing is updated
   */
  async notifyBillingUpdated(billing: Billing, updatedBy?: string): Promise<void> {
    try {
      await this.notificationService.createNotification({
        title: 'Billing Updated',
        message: `The billing "${billing.title}" has been updated.`,
        type: ENotificationType.INFO,
        priority: ENotificationPriority.NORMAL,
        entityId: billing.recipientUser.id,
        entityType: 'billing',
        emailSubject: `Billing Updated: ${billing.title}`,
        metadata: {
          action: 'billing_updated',
          billingId: billing.id,
          updatedBy,
        },
      });

      this.logger.log(
        `✅ Notification sent for updated billing ${billing.id}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `❌ Failed to send notification for updated billing ${billing.id}: ${errorMessage}`,
      );
    }
  }

  /**
   * Send notification when billing is paid
   */
  async notifyBillingPaid(billing: Billing): Promise<void> {
    try {
      await this.notificationService.createNotification({
        title: 'Billing Paid',
        message: `Your billing "${billing.title}" has been paid successfully. Thank you!`,
        type: ENotificationType.SUCCESS,
        priority: ENotificationPriority.NORMAL,
        entityId: billing.recipientUser.id,
        entityType: 'billing',
        emailSubject: `Payment Confirmed: ${billing.title}`,
        metadata: {
          action: 'billing_paid',
          billingId: billing.id,
          amount: billing.amount,
          paidAt: billing.paidAt,
        },
      });

      this.logger.log(
        `✅ Notification sent for paid billing ${billing.id}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `❌ Failed to send notification for paid billing ${billing.id}: ${errorMessage}`,
      );
    }
  }

  /**
   * Send notification to admins when billing is created
   */
  async notifyAdminsBillingCreated(billing: Billing, createdBy?: string): Promise<void> {
    try {
      const adminUsers = await this.userRepository.find({
        where: {
          level: In([EUserLevels.SUPER_ADMIN, EUserLevels.ADMIN]),
          isActive: true,
        },
        select: ['id', 'email', 'firstName', 'lastName'],
      });

      if (adminUsers.length === 0) {
        return;
      }

      const notificationPromises = adminUsers.map((admin) =>
        this.notificationService.createNotification({
          title: 'New Billing Created',
          message: `A new billing "${billing.title}" for $${billing.amount} has been created for ${billing.recipientUser.firstName} ${billing.recipientUser.lastName}.`,
          type: ENotificationType.INFO,
          priority: ENotificationPriority.NORMAL,
          entityId: admin.id,
          entityType: 'billing',
          metadata: {
            action: 'billing_created',
            billingId: billing.id,
            recipientUserId: billing.recipientUser.id,
            createdBy,
          },
        }),
      );

      await Promise.all(notificationPromises);

      this.logger.log(
        `✅ Notifications sent to ${adminUsers.length} admin(s) for billing ${billing.id}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `❌ Failed to send admin notifications for billing ${billing.id}: ${errorMessage}`,
      );
    }
  }
}

