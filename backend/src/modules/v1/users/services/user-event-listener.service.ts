import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { User } from '../entities/user.entity';
import { EventPayload } from '@/common/helper/services/event.service';


@Injectable()
export class UserEventListenerService {
  private readonly logger = new Logger(UserEventListenerService.name);

  constructor(
    @InjectQueue('user') private userQueue: Queue,
  ) { }


  /**
   * Handle user created event - send welcome email
   */
  @OnEvent('user.crud.create')
  async handleUserCreated(payload: EventPayload): Promise<void> {
    // Check if this is a user creation event
    if (!payload.entity)
      return;

    const user = payload.entity as User;
    const data = payload.data as any;
    try {
      await this.userQueue.add('send-welcome-email', {
        userId: user.id,
        tempPassword: data?.tempPassword,
        createdBy: data?.createdBy
      }, {
        delay: 10000,
      });

      this.logger.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${user.email}: ${error.message}`);
    }

  }

  /**
   * Handle user updated event - send notification if needed
   */
  @OnEvent('user.crud.update')
  async handleUserUpdated(payload: EventPayload): Promise<void> {

    console.log('handleUserUpdated', payload);

    // Check if this is a user update event
    if (!payload.entity)
      return;

    const user = payload.entity as User;
    try {
      // You can add logic here to determine what type of update notification to send
      this.logger.log(`User ${user.email} was updated`);
    } catch (error) {
      this.logger.error(`Failed to handle user update for ${user.email}: ${error.message}`);
    }

  }

  /**
   * Handle password reset event - send reset or confirmation email
   */
  @OnEvent('user.password.reset')
  async handlePasswordReset(payload: EventPayload): Promise<void> {
    if (!payload.entity)
      return;

    try { 

      const user = payload.entity as User;

      const type = payload.data?.type as string;

      if (type === 'confirmation') {
        // Send password reset confirmation email
        await this.userQueue.add('send-password-reset-confirmation', {
          userId: user.id,
        }, {
          delay: 10000,
        });
        this.logger.log(`Password reset confirmation email sent to ${user.email}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${error.message}`);
    }
  }

  /**
   * Handle user deleted event
   */
  @OnEvent('user.crud.delete')
  async handleUserDeleted(payload: EventPayload): Promise<void> {
    // Check if this is a user deletion event
    if (!payload.entity)
      return;

    const user = payload.entity as User;
    try {
      this.logger.log(`User ${user.email} was deleted`);
      // You can add logic here for cleanup or notifications
    } catch (error) {
      this.logger.error(`Failed to handle user deletion for ${user.email}: ${error.message}`);
    }
  }

}
