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
import { Session } from '../entities/session.entity';

@Injectable()
export class SessionNotificationService {
  private readonly logger = new Logger(SessionNotificationService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Send notification to trainer when session is created
   */
  async notifyTrainerSessionCreated(
    session: Session,
    createdBy?: string,
  ): Promise<void> {
    try {
      const trainerUserId = session.trainer.user?.id;
      if (!trainerUserId) return;

      await this.notificationService.createNotification({
        title: 'New Session Scheduled',
        message: `A new session "${session.title}" has been scheduled for ${new Date(session.startDateTime).toLocaleString()}.`,
        type: ENotificationType.SUCCESS,
        priority: ENotificationPriority.NORMAL,
        entityId: trainerUserId,
        entityType: 'session',
        emailSubject: `New Session: ${session.title}`,
        metadata: {
          action: 'session_created',
          sessionId: session.id,
          startDateTime: session.startDateTime,
          createdBy,
        },
      });

      this.logger.log(
        `✅ Notification sent to trainer for session ${session.id}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `❌ Failed to send notification to trainer for session ${session.id}: ${errorMessage}`,
      );
    }
  }

  /**
   * Send notification to clients when session is created
   */
  async notifyClientsSessionCreated(
    session: Session,
    createdBy?: string,
  ): Promise<void> {
    try {
      const clientNotifications = session.clients.map((client) => {
        const clientUserId = client.user?.id;
        if (!clientUserId) return null;

        return this.notificationService.createNotification({
          title: 'New Session Scheduled',
          message: `You have been added to a session "${session.title}" scheduled for ${new Date(session.startDateTime).toLocaleString()}.`,
          type: ENotificationType.SUCCESS,
          priority: ENotificationPriority.NORMAL,
          entityId: clientUserId,
          entityType: 'session',
          emailSubject: `New Session: ${session.title}`,
          metadata: {
            action: 'session_created',
            sessionId: session.id,
            startDateTime: session.startDateTime,
            createdBy,
          },
        });
      });

      await Promise.all(
        clientNotifications.filter((promise) => promise !== null),
      );

      this.logger.log(
        `✅ Notifications sent to ${session.clients.length} client(s) for session ${session.id}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `❌ Failed to send notifications to clients for session ${session.id}: ${errorMessage}`,
      );
    }
  }

  /**
   * Send notification when session is updated
   */
  async notifySessionUpdated(
    session: Session,
    updatedBy?: string,
  ): Promise<void> {
    try {
      const trainerUserId = session.trainer.user?.id;
      const notifications: Promise<void>[] = [];

      // Notify trainer
      if (trainerUserId) {
        notifications.push(
          this.notificationService
            .createNotification({
              title: 'Session Updated',
              message: `The session "${session.title}" has been updated.`,
              type: ENotificationType.INFO,
              priority: ENotificationPriority.NORMAL,
              entityId: trainerUserId,
              entityType: 'session',
              emailSubject: `Session Updated: ${session.title}`,
              metadata: {
                action: 'session_updated',
                sessionId: session.id,
                updatedBy,
              },
            })
            .then(() => {}),
        );
      }

      // Notify clients
      session.clients.forEach((client) => {
        const clientUserId = client.user?.id;
        if (clientUserId) {
          notifications.push(
            this.notificationService
              .createNotification({
                title: 'Session Updated',
                message: `The session "${session.title}" has been updated.`,
                type: ENotificationType.INFO,
                priority: ENotificationPriority.NORMAL,
                entityId: clientUserId,
                entityType: 'session',
                emailSubject: `Session Updated: ${session.title}`,
                metadata: {
                  action: 'session_updated',
                  sessionId: session.id,
                  updatedBy,
                },
              })
              .then(() => {}),
          );
        }
      });

      await Promise.all(notifications);

      this.logger.log(
        `✅ Notifications sent for updated session ${session.id}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `❌ Failed to send notifications for updated session ${session.id}: ${errorMessage}`,
      );
    }
  }

  /**
   * Send notification to admins when session is created
   */
  async notifyAdminsSessionCreated(
    session: Session,
    createdBy?: string,
  ): Promise<void> {
    try {
      const adminUsers = await this.userRepository.find({
        where: {
          level: In([EUserLevels.SUPER_ADMIN]),
          isActive: true,
        },
        select: ['id', 'email', 'firstName', 'lastName'],
      });

      if (adminUsers.length === 0) {
        return;
      }

      const notificationPromises = adminUsers.map((admin) =>
        this.notificationService.createNotification({
          title: 'New Session Created',
          message: `A new session "${session.title}" has been scheduled.`,
          type: ENotificationType.INFO,
          priority: ENotificationPriority.NORMAL,
          entityId: admin.id,
          entityType: 'session',
          metadata: {
            action: 'session_created',
            sessionId: session.id,
            trainerUserId: session.trainer.user?.id,
            createdBy,
          },
        }),
      );

      await Promise.all(notificationPromises);

      this.logger.log(
        `✅ Notifications sent to ${adminUsers.length} admin(s) for session ${session.id}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `❌ Failed to send admin notifications for session ${session.id}: ${errorMessage}`,
      );
    }
  }
}
