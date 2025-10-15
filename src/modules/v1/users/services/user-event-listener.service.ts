import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserEmailService } from './user-email.service';
import { User } from '../entities/user.entity';

@Injectable()
export class UserEventListenerService {
  private readonly logger = new Logger(UserEventListenerService.name);

  constructor(private readonly userEmailService: UserEmailService) {}

  /**
   * Handle user created event - send welcome email
   */
  @OnEvent('crud.create')
  async handleUserCreated(eventData: any): Promise<void> {
    // Check if this is a user creation event
    if (eventData.source === 'User' && eventData.entity) {
      const user: User = eventData.entity;
      try {
        await this.userEmailService.sendWelcomeEmail({
          user,
          tempPassword: undefined,
          createdBy: undefined
        });
        this.logger.log(`Welcome email sent to ${user.email}`);
      } catch (error) {
        this.logger.error(`Failed to send welcome email to ${user.email}: ${error.message}`);
      }
    }
  }

  /**
   * Handle user updated event - send notification if needed
   */
  @OnEvent('crud.update')
  async handleUserUpdated(eventData: any): Promise<void> {
    // Check if this is a user update event
    if (eventData.source === 'User' && eventData.entity) {
      const user: User = eventData.entity;
      try {
        // You can add logic here to determine what type of update notification to send
        this.logger.log(`User ${user.email} was updated`);
      } catch (error) {
        this.logger.error(`Failed to handle user update for ${user.email}: ${error.message}`);
      }
    }
  }

  /**
   * Handle password reset event - send reset or confirmation email
   */
  @OnEvent('user.password.reset')
  async handlePasswordReset(data: any): Promise<void> {
    try {
      const { email, resetToken, user, type } = data;
      
      if (type === 'confirmation' && user) {
        // Send password reset confirmation email
        await this.userEmailService.sendPasswordResetConfirmation(user);
        this.logger.log(`Password reset confirmation email sent to ${email}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${error.message}`);
    }
  }

  /**
   * Handle user deleted event
   */
  @OnEvent('crud.delete')
  async handleUserDeleted(eventData: any): Promise<void> {
    // Check if this is a user deletion event
    if (eventData.source === 'User' && eventData.entity) {
      const user: User = eventData.entity;
      try {
        this.logger.log(`User ${user.email} was deleted`);
        // You can add logic here for cleanup or notifications
      } catch (error) {
        this.logger.error(`Failed to handle user deletion for ${user.email}: ${error.message}`);
      }
    }
  }

  /**
   * Handle any user-related events (wildcard listener)
   */
  @OnEvent('user.*')
  async handleUserWildcard(eventType: string, payload: any): Promise<void> {
    this.logger.log(`User wildcard event received: ${eventType}`, payload);
    // Handle any user-specific events that don't have specific handlers
  }
}
