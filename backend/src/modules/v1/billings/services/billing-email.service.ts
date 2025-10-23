import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { Billing } from '../entities/billing.entity';
import { LoggerService } from '@/common/logger/logger.service';

export enum BillingReminderType {
  CONFIRMATION = 'confirmation',
  REMINDER = 'reminder',
  OVERDUE = 'overdue',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export interface BillingEmailContext {
  billing: Billing;
  recipientName: string;
  recipientEmail: string;
  reminderType: BillingReminderType;
  dueDate?: Date;
  amount?: number;
}

@Injectable()
export class BillingEmailService {
  private readonly logger = new LoggerService(BillingEmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendBillingConfirmation(context: BillingEmailContext): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: context.recipientEmail,
        subject: `Billing Confirmation - ${context.billing.title}`,
        template: 'billing-confirmation',
        context: {
          ...context,
          billingTitle: context.billing.title,
          billingAmount: context.billing.amount,
          dueDate: context.billing.dueDate,
          billingType: context.billing.type,
        },
      });

      this.logger.log(`Billing confirmation email sent to ${context.recipientEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send billing confirmation email to ${context.recipientEmail}:`, error);
      throw error;
    }
  }

  async sendBillingReminder(context: BillingEmailContext): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: context.recipientEmail,
        subject: `Billing Reminder - ${context.billing.title}`,
        template: 'billing-reminder',
        context: {
          ...context,
          billingTitle: context.billing.title,
          billingAmount: context.billing.amount,
          dueDate: context.billing.dueDate,
          billingType: context.billing.type,
        },
      });

      this.logger.log(`Billing reminder email sent to ${context.recipientEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send billing reminder email to ${context.recipientEmail}:`, error);
      throw error;
    }
  }

  async sendBillingOverdue(context: BillingEmailContext): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: context.recipientEmail,
        subject: `Overdue Billing - ${context.billing.title}`,
        template: 'billing-overdue',
        context: {
          ...context,
          billingTitle: context.billing.title,
          billingAmount: context.billing.amount,
          dueDate: context.billing.dueDate,
          billingType: context.billing.type,
        },
      });

      this.logger.log(`Billing overdue email sent to ${context.recipientEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send billing overdue email to ${context.recipientEmail}:`, error);
      throw error;
    }
  }

  async sendBillingPaid(context: BillingEmailContext): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: context.recipientEmail,
        subject: `Payment Received - ${context.billing.title}`,
        template: 'billing-paid',
        context: {
          ...context,
          billingTitle: context.billing.title,
          billingAmount: context.billing.amount,
          dueDate: context.billing.dueDate,
          billingType: context.billing.type,
        },
      });

      this.logger.log(`Billing paid confirmation email sent to ${context.recipientEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send billing paid confirmation email to ${context.recipientEmail}:`, error);
      throw error;
    }
  }
}
