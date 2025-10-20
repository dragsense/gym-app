import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { UserEmailService } from '@/modules/v1/users/services/user-email.service';
import { UsersService } from '../users.service';
import { EUserLevels, EUserRole } from 'shared/enums/user.enum';

@Processor('user')
@Injectable()
export class UserProcessor {
  private readonly logger = new Logger(UserProcessor.name);

  constructor(
    private readonly userEmailService: UserEmailService,
    private readonly userService: UsersService,
  ) {}

  /**
   * Handle send welcome email
   */
  @Process('send-welcome-email')
  async handleSendWelcomeEmail(job: Job): Promise<void> {
    const { userId, tempPassword, createdBy } = job.data;
    
    this.logger.log(`Processing welcome email for user ${userId}`);
    
    try {
      const user = await this.userService.getSingle(userId);
      
      await this.userEmailService.sendWelcomeEmail({
        user,
        tempPassword,
        createdBy
      });

      this.logger.log(`Welcome email sent successfully for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Handle send password reset confirmation
   */
  @Process('send-password-reset-confirmation')
  async handleSendPasswordResetConfirmation(job: Job): Promise<void> {
    const { userId } = job.data;
    
    this.logger.log(`Processing password reset confirmation for user ${userId}`);
    
    try {
      const user = await this.userService.getSingle(userId);
      const superAdmin = await this.userService.getSingle({ level: EUserLevels[EUserRole.SUPER_ADMIN] });
      
      await this.userEmailService.sendPasswordResetConfirmation(user, superAdmin);

      this.logger.log(`Password reset confirmation sent successfully for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset confirmation for user ${userId}:`, error);
      throw error;
    }
  }
}
