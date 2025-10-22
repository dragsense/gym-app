import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SessionsService } from '../sessions.service';
import { Session } from '../entities/session.entity';
import { ScheduleService } from '@/common/schedule/schedule.service';
import { EventPayload } from '@/common/helper/services/event.service';
import { EReminderSendBefore } from 'shared';
import { SessionEmailService } from './session-email.service';
import { UsersService } from '@/modules/v1/users/users.service';
import { ActionRegistryService } from '@/common/helper/services/action-registry.service';

@Injectable()
export class SessionEventListenerService implements OnModuleInit {
  private readonly logger = new Logger(SessionEventListenerService.name);

  constructor(
    private readonly sessionsService: SessionsService,
    private readonly scheduleService: ScheduleService,
    @InjectQueue('session') private sessionQueue: Queue,
    private readonly sessionEmailService: SessionEmailService,
    private readonly userService: UsersService,
    private readonly actionRegistryService: ActionRegistryService,
  ) { }

  onModuleInit() {
    // Register session actions with action registry
    this.actionRegistryService.registerAction('send-session-reminder', {
      handler: this.handleSendSessionReminder.bind(this),
      description: 'Send session reminder email',
      retryable: true,
      timeout: 10000,
    });
  }




  /**
   * Handle session created event - setup reminders if enabled
   */
  @OnEvent('session.crud.create')
  async handleSessionCreated(payload: EventPayload): Promise<void> {

    if (!payload.entity)
      return;

    try {
      const session = await this.sessionsService.getSingle(payload.entityId, {
        _relations: ['trainer', 'clients'],
        _select: ['trainer.id', 'clients.id'],
      });
      this.logger.log(`Session created: ${session.title} (ID: ${session.id})`);



      await this.sessionQueue.add('send-session-confirmation', {
        sessionId: session.id,
        recipientId: session.trainerUser.id,
      }, {
        delay: 10000,
      });

      for (const clientUser of session.clientsUsers) {
        await this.sessionQueue.add('send-session-confirmation', {
          sessionId: session.id,
          recipientId: clientUser.id,
        }, {
          delay: 10000,
        });
      }

      // Setup reminders if enabled
      if (session.enableReminder) {
        await this.setupSessionReminders(session);
      }

    } catch (error) {
      this.logger.error(`Failed to handle session creation for session ${payload.entityId}:`, error);
    }
  }

  /**
   * Handle session updated event - update reminders if needed
   */
  @OnEvent('session.crud.update')
  async handleSessionUpdated(payload: EventPayload): Promise<void> {

    try {
      const session = payload.entity as Session;
      this.logger.log(`Session updated: ${session.title} (ID: ${session.id})`);

      const oldSession = payload.oldEntity as Session;

      if (oldSession.enableReminder !== session.enableReminder) {
        if (session.enableReminder) {
          await this.setupSessionReminders(session);
        } else {
          await this.removeSessionReminders(session.id);
        }
      }

      if (oldSession.status !== session.status) {
        await this.sessionQueue.add('send-session-status-update', {
          sessionId: session.id,
          recipientId: session.trainerUser.id,
        }, {
          delay: 10000,
        });

        for (const clientUser of session.clientsUsers) {
          await this.sessionQueue.add('send-session-status-update', {
            sessionId: session.id,
            recipientId: clientUser.id,
          }, {
            delay: 10000,
          });
        }
      }

    } catch (error) {
      this.logger.error(`Failed to handle session update for session ${payload.entityId}:`, error);
    }
  }

  /**
   * Handle session deleted event - cleanup reminders
   */
  @OnEvent('session.crud.delete')
  async handleSessionDeleted(payload: EventPayload): Promise<void> {
    try {
      const session = payload.entity as Session;
      this.logger.log(`Session deleted: ID ${session.id}`);

      await this.sessionQueue.add('send-session-deleted', {
        sessionId: session.id,
        recipientId: session.trainerUser.id,
      }, {
        delay: 10000,
      });

        for (const clientUser of session.clientsUsers) {
        await this.sessionQueue.add('send-session-deleted', {
          sessionId: session.id,
          recipientId: clientUser.id,
        }, {
          delay: 10000,
        });
      }


      // Remove all associated reminders
      await this.removeSessionReminders(session.id);
    } catch (error) {
      this.logger.error(`Failed to handle session deletion for session ${payload.entityId}:`, error);
    }
  }


  /**
   * Handle send session reminder
   */
  private async handleSendSessionReminder(data: any): Promise<void> {
    const { sessionId, recipientId } = data;
    
    try {
      const session = await this.sessionsService.getSingle(sessionId);
      const recipient = await this.userService.getSingle(recipientId, {
        _relations: ['profile'],
      });

      const recipientName = recipient.profile?.firstName + ' ' + recipient.profile?.lastName;
      if (!recipientName) {
        throw new Error('Recipient name not found');
      }

      await this.sessionEmailService.sendSessionReminder(session, recipient.email, recipientName);

    } catch (error) {
      this.logger.error(`Failed to send session reminder:`, error);
      throw error;
    }
  }

  /**
   * Setup reminders for a session
   */
  private async setupSessionReminders(session: Session): Promise<void> {
    try {

      const reminderConfig = session.reminderConfig;
      const { sendBefore = [EReminderSendBefore.ONE_DAY] } = reminderConfig || {};

      // Remove existing reminders first
      await this.removeSessionReminders(session.id);
      // Create new reminders based on configuration
      for (const sendBeforeValue of sendBefore) {
        await this.createReminderSchedule(session, sendBeforeValue);
      }

      this.logger.log(`Setup ${reminderConfig?.sendBefore?.length || 0} reminder(s) for session: ${session.title}`);
    } catch (error) {
      this.logger.error(`Failed to setup reminders for session ${session.id}:`, error);
    }
  }


  /**
   * Remove all reminders for a session
   */
  private async removeSessionReminders(sessionId: number): Promise<void> {
    try {
      // Find and remove all schedules associated with this session
      const schedules = await this.scheduleService.getAll({ entityId: sessionId }, {});

      for (const schedule of schedules) {
        await this.scheduleService.delete(schedule.id);
      }

      this.logger.log(`Removed ${schedules.length} reminder(s) for session ID: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to remove reminders for session ${sessionId}:`, error);
    }
  }

  /**
   * Create a reminder schedule
   */
  private async createReminderSchedule(
    session: Session,
    sendBefore: EReminderSendBefore,
  ): Promise<void> {
    try {
      const reminderDate = new Date(session.startDateTime);
      reminderDate.setMinutes(reminderDate.getMinutes() - sendBefore);

      // Skip if reminder time has already passed
      if (reminderDate <= new Date()) {
        this.logger.warn(`Reminder time has passed for session ${session.title}, skipping`);
        return;
      }

      const scheduleData = {
        title: `Session Reminder - ${session.title}`,
        description: `Reminder for ${session.title} starting at ${session.startDateTime}`,
        action: 'send-session-reminder',
        entityId: session.id,
        nextRunDate: reminderDate,
        status: 'active' as any,
        retryOnFailure: false,
        data: {
          sessionId: session.id,
          recipientId: session.trainerUser.id,
        },
      };
      await this.scheduleService.createSchedule(scheduleData);

      const clients = session.clientsUsers;
      for (const clientUser of clients) {
        scheduleData.data = {
          sessionId: session.id,
          recipientId: clientUser.id,
        };
        await this.scheduleService.createSchedule(scheduleData);
      }

      this.logger.log(`Created reminder for session ${session.title} at ${reminderDate.toISOString()}`);
    } catch (error) {
      this.logger.error(`Failed to create reminder schedule for session ${session.id}:`, error);
    }
  }
}
