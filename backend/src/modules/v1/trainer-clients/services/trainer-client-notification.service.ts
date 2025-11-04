import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from '@/common/notification/notification.service';
import {
  ENotificationPriority,
  ENotificationType,
} from '@shared/enums/notification.enum';
import { TrainerClient } from '../entities/trainer-client.entity';

@Injectable()
export class TrainerClientNotificationService {
  private readonly logger = new Logger(TrainerClientNotificationService.name);

  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Send notification to trainer when client is assigned
   */
  async notifyTrainerAssignmentCreated(assignment: TrainerClient, createdBy?: string): Promise<void> {
    try {
      const trainerUserId = assignment.trainer?.user?.id;
      if (!trainerUserId) return;

      const clientName = assignment.client?.user
        ? `${assignment.client.user.firstName} ${assignment.client.user.lastName}`
        : 'a client';

      await this.notificationService.createNotification({
        title: 'New Client Assigned',
        message: `${clientName} has been assigned to you as a client.`,
        type: ENotificationType.SUCCESS,
        priority: ENotificationPriority.NORMAL,
        entityId: trainerUserId,
        entityType: 'trainer_client',
        emailSubject: `New Client Assigned: ${clientName}`,
        metadata: {
          action: 'trainer_client_created',
          assignmentId: assignment.id,
          clientId: assignment.client?.id,
          createdBy,
        },
      });

      this.logger.log(
        `✅ Notification sent to trainer for assignment ${assignment.id}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `❌ Failed to send notification to trainer for assignment ${assignment.id}: ${errorMessage}`,
      );
    }
  }

  /**
   * Send notification to client when assigned to trainer
   */
  async notifyClientAssignmentCreated(assignment: TrainerClient, createdBy?: string): Promise<void> {
    try {
      const clientUserId = assignment.client?.user?.id;
      if (!clientUserId) return;

      const trainerName = assignment.trainer?.user
        ? `${assignment.trainer.user.firstName} ${assignment.trainer.user.lastName}`
        : 'a trainer';

      await this.notificationService.createNotification({
        title: 'Trainer Assigned',
        message: `${trainerName} has been assigned as your trainer.`,
        type: ENotificationType.SUCCESS,
        priority: ENotificationPriority.NORMAL,
        entityId: clientUserId,
        entityType: 'trainer_client',
        emailSubject: `Trainer Assigned: ${trainerName}`,
        metadata: {
          action: 'trainer_client_created',
          assignmentId: assignment.id,
          trainerId: assignment.trainer?.id,
          createdBy,
        },
      });

      this.logger.log(
        `✅ Notification sent to client for assignment ${assignment.id}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `❌ Failed to send notification to client for assignment ${assignment.id}: ${errorMessage}`,
      );
    }
  }

  /**
   * Send notifications to both trainer and client when assignment is created
   */
  async handleAssignmentCreated(assignment: TrainerClient, createdBy?: string): Promise<void> {
    await Promise.all([
      this.notifyTrainerAssignmentCreated(assignment, createdBy),
      this.notifyClientAssignmentCreated(assignment, createdBy),
    ]);
  }
}

