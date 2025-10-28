import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEmailService } from '@/modules/v1/users/services/user-email.service';
import { User } from '../entities/user.entity';
import { EUserLevels, EUserRole } from '@shared/enums/user.enum';

@Processor('user')
export class UserProcessor {
  private readonly logger = new Logger(UserProcessor.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userEmailService: UserEmailService,
  ) {
    this.logger.log('✅ UserProcessor initialized and listening for jobs');
  }

  /**
   * Handle send welcome email
   */
  @Process('send-welcome-email')
  async handleSendWelcomeEmail(job: Job): Promise<void> {
    const { userId, tempPassword, createdBy } = job.data;

    this.logger.log(`Processing welcome email for user ${userId}`);

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['profile'],
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      await this.userEmailService.sendWelcomeEmail({
        user,
        tempPassword,
        createdBy,
      });

      this.logger.log(`Welcome email sent successfully for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle send password reset confirmation
   */
  @Process('send-password-reset-confirmation')
  async handleSendPasswordResetConfirmation(job: Job): Promise<void> {
    const { userId } = job.data;

    this.logger.log(
      `Processing password reset confirmation for user ${userId}`,
    );

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['profile'],
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const superAdmin = await this.userRepository.findOne({
        where: { level: EUserLevels[EUserRole.SUPER_ADMIN] },
        relations: ['profile'],
      });

      if (!superAdmin) {
        throw new Error('Super admin not found');
      }

      await this.userEmailService.sendPasswordResetConfirmation(
        user,
        superAdmin,
      );

      this.logger.log(
        `Password reset confirmation sent successfully for user ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send password reset confirmation for user ${userId}:`,
        error,
      );
      throw error;
    }
  }
}
