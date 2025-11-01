import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { BillingEmailService } from '@/modules/v1/billings/services/billing-email.service';
import { BillingsService } from '../billings.service';
import { UsersService } from '@/modules/v1/users/users.service';
import { ProfilesService } from '@/modules/v1/users/profiles/profiles.service';

@Processor('billing')
@Injectable()
export class BillingProcessor {
  private readonly logger = new Logger(BillingProcessor.name);

  constructor(
    private readonly billingEmailService: BillingEmailService,
    private readonly billingsService: BillingsService,
    private readonly userService: UsersService,
    private readonly profilesService: ProfilesService,
  ) {}

  /**
   * Handle send billing confirmation
   */
  @Process('send-billing-confirmation')
  async handleSendBillingConfirmation(job: Job): Promise<void> {
    const { billingId, recipientId } = job.data;

    this.logger.log(`Processing billing confirmation for billing ${billingId}`);

    try {
      const billing = await this.billingsService.getSingle(billingId, {
        _relations: ['recipientUser'],
      });

      const profile = await this.profilesService.getSingle(
        { user: { id: recipientId } },
        { _relations: ['user'] },
      );

      await this.billingEmailService.sendBillingConfirmation({
        billing,
        recipientName:
          `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim(),
        recipientEmail: profile.user.email,
        reminderType: 'confirmation' as any,
        dueDate: billing.dueDate,
        amount: billing.amount,
      });

      this.logger.log(
        `Billing confirmation sent successfully for billing ${billingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send billing confirmation for billing ${billingId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle send billing reminder
   */
  @Process('send-billing-reminder')
  async handleSendBillingReminder(job: Job): Promise<void> {
    const { billingId, recipientId } = job.data;

    this.logger.log(`Processing billing reminder for billing ${billingId}`);

    try {
      const billing = await this.billingsService.getSingle(billingId, {
        _relations: ['recipientUser'],
      });

      const profile = await this.profilesService.getSingle(
        { user: { id: recipientId } },
        { _relations: ['user'] },
      );

      await this.billingEmailService.sendBillingReminder({
        billing,
        recipientName:
          `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim(),
        recipientEmail: profile.user.email,
        reminderType: 'reminder' as any,
        dueDate: billing.dueDate,
        amount: billing.amount,
      });

      this.logger.log(
        `Billing reminder sent successfully for billing ${billingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send billing reminder for billing ${billingId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle send billing overdue
   */
  @Process('send-billing-overdue')
  async handleSendBillingOverdue(job: Job): Promise<void> {
    const { billingId, recipientId } = job.data;

    this.logger.log(`Processing billing overdue for billing ${billingId}`);

    try {
      const billing = await this.billingsService.getSingle(billingId, {
        _relations: ['recipientUser'],
      });

      const profile = await this.profilesService.getSingle(
        { user: { id: recipientId } },
        { _relations: ['user'] },
      );

      await this.billingEmailService.sendBillingOverdue({
        billing,
        recipientName:
          `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim(),
        recipientEmail: profile.user.email,
        reminderType: 'overdue' as any,
        dueDate: billing.dueDate,
        amount: billing.amount,
      });

      this.logger.log(
        `Billing overdue sent successfully for billing ${billingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send billing overdue for billing ${billingId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle send billing paid
   */
  @Process('send-billing-paid')
  async handleSendBillingPaid(job: Job): Promise<void> {
    const { billingId, recipientId } = job.data;

    this.logger.log(
      `Processing billing paid confirmation for billing ${billingId}`,
    );

    try {
      const billing = await this.billingsService.getSingle(billingId, {
        _relations: ['recipientUser'],
      });

      const profile = await this.profilesService.getSingle(
        { user: { id: recipientId } },
        { _relations: ['user'] },
      );

      await this.billingEmailService.sendBillingPaid({
        billing,
        recipientName:
          `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim(),
        recipientEmail: profile.user.email,
        reminderType: 'paid' as any,
        dueDate: billing.dueDate,
        amount: billing.amount,
      });

      this.logger.log(
        `Billing paid confirmation sent successfully for billing ${billingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send billing paid confirmation for billing ${billingId}:`,
        error,
      );
      throw error;
    }
  }
}
