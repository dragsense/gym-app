import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { SessionEmailService } from '@/modules/v1/sessions/services/session-email.service';
import { SessionsService } from '../sessions.service';
import { ProfilesService } from '@/modules/v1/users/profiles/profiles.service';

@Processor('session')
@Injectable()
export class SessionProcessor {
  private readonly logger = new Logger(SessionProcessor.name);

  constructor(
    private readonly sessionEmailService: SessionEmailService,
    private readonly sessionsService: SessionsService,
    private readonly profilesService: ProfilesService,
  ) {}

  /**
   * Handle send session confirmation
   */
  @Process('send-session-confirmation')
  async handleSendSessionConfirmation(job: Job): Promise<void> {
    const { sessionId, recipientId } = job.data;

    this.logger.log(`Processing session confirmation for session ${sessionId}`);

    try {
      const session = await this.sessionsService.getSingle(sessionId);
      const profile = await this.profilesService.getSingle(
        { user: { id: recipientId } },
        { _relations: ['user'] },
      );

      const recipientName =
        `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();
      if (!recipientName) {
        throw new Error('Recipient name not found');
      }

      await this.sessionEmailService.sendSessionConfirmation(
        session,
        profile.user.email,
        recipientName,
      );

      this.logger.log(
        `Session confirmation sent successfully for session ${sessionId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send session confirmation for session ${sessionId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle send session status update
   */
  @Process('send-session-status-update')
  async handleSendSessionStatusUpdate(job: Job): Promise<void> {
    const { sessionId, recipientId } = job.data;

    this.logger.log(
      `Processing session status update for session ${sessionId}`,
    );

    try {
      const session = await this.sessionsService.getSingle(sessionId);
      const profile = await this.profilesService.getSingle(
        { user: { id: recipientId } },
        { _relations: ['user'] },
      );

      const recipientName =
        `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();
      if (!recipientName) {
        throw new Error('Recipient name not found');
      }

      await this.sessionEmailService.sendSessionStatusUpdate(
        session,
        profile.user.email,
        recipientName,
      );

      this.logger.log(
        `Session status update sent successfully for session ${sessionId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send session status update for session ${sessionId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle send session deleted
   */
  @Process('send-session-deleted')
  async handleSendSessionDeleted(job: Job): Promise<void> {
    const { sessionId, recipientId } = job.data;

    this.logger.log(
      `Processing session deleted notification for session ${sessionId}`,
    );

    try {
      const session = await this.sessionsService.getSingle(sessionId);
      const profile = await this.profilesService.getSingle(
        { user: { id: recipientId } },
        { _relations: ['user'] },
      );

      const recipientName =
        `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();
      if (!recipientName) {
        throw new Error('Recipient name not found');
      }

      await this.sessionEmailService.sendSessionDeleted(
        session,
        profile.user.email,
        recipientName,
      );

      this.logger.log(
        `Session deleted notification sent successfully for session ${sessionId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send session deleted notification for session ${sessionId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle send session reminder
   */
  @Process('send-session-reminder')
  async handleSendSessionReminder(job: Job): Promise<void> {
    const { sessionId, recipientId } = job.data;

    this.logger.log(`Processing session reminder for session ${sessionId}`);

    try {
      const session = await this.sessionsService.getSingle(sessionId);
      const profile = await this.profilesService.getSingle(
        { user: { id: recipientId } },
        { _relations: ['user'] },
      );

      const recipientName =
        `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();
      if (!recipientName) {
        throw new Error('Recipient name not found');
      }

      await this.sessionEmailService.sendSessionReminder(
        session,
        profile.user.email,
        recipientName,
      );

      this.logger.log(
        `Session reminder sent successfully for session ${sessionId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send session reminder for session ${sessionId}:`,
        error,
      );
      throw error;
    }
  }
}
