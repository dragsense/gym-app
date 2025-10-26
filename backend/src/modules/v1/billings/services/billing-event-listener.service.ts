import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { BillingsService } from '../billings.service';
import { Billing } from '../entities/billing.entity';
import { ScheduleService } from '@/common/schedule/schedule.service';
import { EventPayload } from '@/common/helper/services/event.service';
import { ActionRegistryService } from '@/common/helper/services/action-registry.service';
import { BillingEmailService } from './billing-email.service';
import { UsersService } from '@/modules/v1/users/users.service';

@Injectable()
export class BillingEventListenerService implements OnModuleInit {
  private readonly logger = new Logger(BillingEventListenerService.name);

  constructor(
    private readonly billingsService: BillingsService,
    private readonly scheduleService: ScheduleService,
    @InjectQueue('billing') private billingQueue: Queue,
    private readonly actionRegistryService: ActionRegistryService,
    private readonly billingEmailService: BillingEmailService,
    private readonly userService: UsersService,
  ) {}

  onModuleInit() {
    // Register billing actions with action registry

    this.actionRegistryService.registerAction('send-billing-reminder', {
      handler: this.handleSendBillingReminder.bind(this),
      description: 'Send billing reminder email',
      retryable: true,
      timeout: 10000,
    });
  }

  /**
   * Handle billing created event - setup reminders if enabled
   */
  @OnEvent('billing.crud.create')
  async handleBillingCreated(payload: EventPayload): Promise<void> {
    if (!payload.entity) return;

    try {
      const billing = await this.billingsService.getSingle(payload.entityId, {
        _relations: ['recipientUser'],
        _select: ['recipientUser.id'],
      });
      this.logger.log(`Billing created: ${billing.title} (ID: ${billing.id})`);

      // Send confirmation to trainer
      await this.billingQueue.add(
        'send-billing-confirmation',
        {
          billingId: billing.id,
          recipientId: billing.recipientUser.id,
        },
        {
          delay: 10000,
        },
      );

      // Setup reminders if enabled
      if (billing.enableReminder) {
        await this.setupBillingReminders(billing);
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle billing creation for billing ${payload.entityId}:`,
        error,
      );
    }
  }

  /**
   * Handle billing updated event - update reminders if needed
   */
  @OnEvent('billing.crud.update')
  async handleBillingUpdated(payload: EventPayload): Promise<void> {
    if (!payload.entity) return;

    try {
      const billing = await this.billingsService.getSingle(payload.entityId, {
        _relations: ['recipientUser'],
        _select: ['recipientUser.id'],
      });
      this.logger.log(`Billing updated: ${billing.title} (ID: ${billing.id})`);

      // Update reminders if billing details changed
      if (billing.enableReminder) {
        await this.setupBillingReminders(billing);
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle billing update for billing ${payload.entityId}:`,
        error,
      );
    }
  }

  /**
   * Handle billing status changed to PAID
   */
  @OnEvent('billing.status.paid')
  async handleBillingPaid(payload: EventPayload): Promise<void> {
    if (!payload.entity) return;

    try {
      const billing = await this.billingsService.getSingle(payload.entityId, {
        _relations: ['recipientUser'],
        _select: ['recipientUser.id'],
      });

      // Send paid confirmation to trainer
      await this.billingQueue.add(
        'send-billing-paid',
        {
          billingId: billing.id,
          recipientId: billing.recipientUser.id,
        },
        {
          delay: 10000,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle billing paid for billing ${payload.entityId}:`,
        error,
      );
    }
  }

  /**
   * Handle send billing reminder
   */
  private async handleSendBillingReminder(data: any): Promise<void> {
    const { billingId, recipientId } = data;

    try {
      const billing = await this.billingsService.getSingle(billingId, {
        _relations: ['recipientUser'],
      });

      const recipient = await this.userService.getSingle(recipientId, {
        _relations: ['profile'],
      });

      await this.billingEmailService.sendBillingReminder({
        billing,
        recipientName:
          `${recipient.profile?.firstName || ''} ${recipient.profile?.lastName || ''}`.trim(),
        recipientEmail: recipient.email,
        reminderType: 'reminder' as any,
        dueDate: billing.dueDate,
        amount: billing.amount,
      });
    } catch (error) {
      this.logger.error(`Failed to send billing reminder:`, error);
      throw error;
    }
  }

  /**
   * Setup billing reminders based on configuration
   */
  private async setupBillingReminders(billing: Billing): Promise<void> {
    if (!billing.reminderConfig || !billing.enableReminder) {
      return;
    }

    const { sendBefore = [] } = billing.reminderConfig;

    // Remove existing reminders first
    await this.removeBillingReminders(billing.id);

    // Create new reminders based on configuration
    for (const sendBeforeValue of sendBefore) {
      await this.createBillingReminderSchedule(billing, sendBeforeValue);
    }

    this.logger.log(
      `Setup ${sendBefore.length} reminder(s) for billing: ${billing.title}`,
    );
  }

  /**
   * Remove all reminders for a billing
   */
  private async removeBillingReminders(billingId: string): Promise<void> {
    try {
      // Find and remove all schedules associated with this billing
      const schedules = await this.scheduleService.getAll(
        { entityId: billingId },
        {},
      );

      for (const schedule of schedules) {
        await this.scheduleService.delete(schedule.id);
      }

      this.logger.log(
        `Removed ${schedules.length} reminder(s) for billing ID: ${billingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to remove reminders for billing ${billingId}:`,
        error,
      );
    }
  }

  /**
   * Create a billing reminder schedule
   */
  private async createBillingReminderSchedule(
    billing: Billing,
    sendBefore: number,
  ): Promise<void> {
    try {
      const reminderDate = new Date(billing.dueDate);
      reminderDate.setDate(reminderDate.getDate() - sendBefore);

      // Skip if reminder time has already passed
      if (reminderDate <= new Date()) {
        this.logger.warn(
          `Reminder time has passed for billing ${billing.title}, skipping`,
        );
        return;
      }

      const scheduleData = {
        title: `Billing Reminder - ${billing.title}`,
        description: `Reminder for ${billing.title} due on ${billing.dueDate}`,
        action: 'send-billing-reminder',
        entityId: billing.id,
        nextRunDate: reminderDate,
        status: 'active' as any,
        retryOnFailure: false,
        data: {
          billingId: billing.id,
          recipientId: billing.recipientUser.id,
        },
      };
      await this.scheduleService.createSchedule(scheduleData);

      this.logger.log(
        `Created reminder for billing ${billing.title} at ${reminderDate.toISOString()}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create reminder schedule for billing ${billing.id}:`,
        error,
      );
    }
  }
}
