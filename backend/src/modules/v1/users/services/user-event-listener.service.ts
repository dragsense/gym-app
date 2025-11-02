import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { User } from '@/common/base-user/entities/user.entity';
import { EventPayload } from '@/common/helper/services/event.service';

@Injectable()
export class UserEventListenerService {
  private readonly logger = new Logger(UserEventListenerService.name);

  constructor(@InjectQueue('user') private userQueue: Queue) {
    this.logger.log('✅ UserEventListenerService initialized');

    // 🔄 Queue Event Listeners
    this.userQueue.on('waiting', (jobId) =>
      this.logger.log(`⏳ Job waiting: ${jobId}`),
    );

    this.userQueue.on('active', (job) =>
      this.logger.log(`⚙️ Job active: ${job.id}`),
    );

    this.userQueue.on('completed', (job) =>
      this.logger.log(`✅ Job completed: ${job.id}`),
    );

    this.userQueue.on('failed', (job, err) =>
      this.logger.error(`💥 Job failed: ${job.id} - ${err.message}`),
    );
  }

  /**
   * Handle user created event - send welcome email
   */
  @OnEvent('user.crud.create')
  async handleUserCreated(payload: EventPayload): Promise<void> {
    // Check if this is a user creation event
    if (!payload.entity) {
      this.logger.warn('User creation event received but entity is null');
      return;
    }

    const user = payload.entity as User;
    const data = payload.data as { tempPassword?: string; createdBy?: string };

    this.logger.log(
      `📥 Event received: Creating queue job for user ${user.id}`,
    );

    try {
      const job = await this.userQueue.add(
        'send-welcome-email',
        {
          userId: user.id,
          tempPassword: data?.tempPassword,
          createdBy: data?.createdBy,
        },
        {
          // Temporarily removed delay for debugging
          // delay: 10000,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: {
            count: 100,
          },
          removeOnFail: {
            age: 259200,
            count: 100,
          },
          timeout: 30000,
        },
      );

      this.logger.log(`✅ Job ${job.id} added to queue for user ${user.email}`);

      // Log job status for debugging
      const jobCounts = await this.userQueue.getJobCounts();
      this.logger.log(`📊 Queue stats: ${JSON.stringify(jobCounts)}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `❌ Failed to add job to queue for ${user.email}: ${errorMessage}`,
      );
    }
  }

  /**
   * Handle user updated event - send notification if needed
   */
  @OnEvent('user.crud.update')
  handleUserUpdated(payload: EventPayload): void {
    console.log('handleUserUpdated', payload);

    // Check if this is a user update event
    if (!payload.entity) return;

    const user = payload.entity as User;
    try {
      // You can add logic here to determine what type of update notification to send
      this.logger.log(`User ${user.email} was updated`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to handle user update for ${user.email}: ${errorMessage}`,
      );
    }
  }

  /**
   * Handle password reset event - send reset or confirmation email
   */
  @OnEvent('user.password.reset')
  async handlePasswordReset(payload: EventPayload): Promise<void> {
    if (!payload.entity) return;

    try {
      const user = payload.entity as User;

      const data = payload.data as { type?: string };
      const type = data?.type;
      this.logger.log(
        `Password reset event triggered for user ${user.email} with type ${type}`,
      );
      if (type === 'confirmation') {
        // Send password reset confirmation email
        await this.userQueue.add(
          'send-password-reset-confirmation',
          {
            userId: user.id,
          },
          {
            delay: 10000,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
            removeOnComplete: {
              count: 100,
            },
            removeOnFail: {
              age: 259200,
              count: 100,
            },
            timeout: 30000,
          },
        );
        this.logger.log(
          `Password reset confirmation email sent to ${user.email}`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send password reset email: ${errorMessage}`);
    }
  }

  /**
   * Handle user deleted event
   */
  @OnEvent('user.crud.delete')
  handleUserDeleted(payload: EventPayload): void {
    // Check if this is a user deletion event
    if (!payload.entity) return;

    const user = payload.entity as User;
    try {
      this.logger.log(`User ${user.email} was deleted`);
      // You can add logic here for cleanup or notifications
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to handle user deletion for ${user.email}: ${errorMessage}`,
      );
    }
  }
}
