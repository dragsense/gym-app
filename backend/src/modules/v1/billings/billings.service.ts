import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';

import { Billing } from './entities/billing.entity';
import {
  CreateBillingDto,
  UpdateBillingDto,
  BillingListDto,
} from '@shared/dtos';
import { IMessageResponse } from '@shared/interfaces';
import { LoggerService } from '@/common/logger/logger.service';
import { CrudService } from '@/common/crud/crud.service';
import { CrudOptions } from '@/common/crud/interfaces/crud.interface';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { StripeService } from '../stripe/stripe.service';
import { StripeBillingService } from '../stripe/services/stripe-billing.service';
import { EBillingStatus } from '@shared/enums/billing.enum';
import { BillingNotificationService } from './services/billing-notification.service';
import { UserSettingsService } from '../user-settings/user-settings.service';

@Injectable()
export class BillingsService extends CrudService<Billing> {
  private readonly customLogger = new LoggerService(BillingsService.name);

  constructor(
    @InjectRepository(Billing)
    private readonly billingRepo: Repository<Billing>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly stripeBillingService: StripeBillingService,
    private readonly stripeService: StripeService,
    private readonly billingNotificationService: BillingNotificationService,
    private readonly userSettingsService: UserSettingsService,
    moduleRef: ModuleRef,
  ) {
    const crudOptions: CrudOptions = {
      restrictedFields: ['recipientUser.password'],
      searchableFields: ['title', 'description', 'notes'],
    };
    super(billingRepo, moduleRef, crudOptions);
  }

  async createBilling(
    createBillingDto: CreateBillingDto,
  ): Promise<IMessageResponse & { billing: Billing }> {
    // Check if trainer exists and is actually a trainer
    const recipientUser = await this.usersService.getUser(
      createBillingDto.recipientUser.id,
    );

    if (!recipientUser) {
      throw new NotFoundException(
        'Recipient user not found or invalid recipient level',
      );
    }

    // Get billing settings for tax rate
    const billingSettings = await this.userSettingsService.getUserSettings(
      recipientUser.id,
    );

    // Apply tax rate if configured
    let finalAmount = createBillingDto.amount;
    if (billingSettings?.billing?.taxRate) {
      const taxAmount =
        (createBillingDto.amount * billingSettings.billing.taxRate) / 100;
      finalAmount = createBillingDto.amount + taxAmount;
    }

    // Use CRUD service create method
    const billing = await this.create(
      { ...createBillingDto, amount: finalAmount },
      {
      beforeCreate: async (
        processedData: CreateBillingDto,
        manager: EntityManager,
      ) => {
        return {
          ...processedData,
          recipientUser: {
            id: processedData.recipientUser.id,
          },
        };
      },
    });

    return { message: 'Billing created successfully.', billing };
  }

  async updateBilling(
    id: string,
    updateBillingDto: UpdateBillingDto,
  ): Promise<IMessageResponse> {
    let recipientUserId: string | undefined;

    if (updateBillingDto.recipientUser && updateBillingDto.recipientUser.id) {
      // Check if trainer exists and is actually a trainer
      const recipientUser = await this.usersService.getUser(
        updateBillingDto.recipientUser.id,
      );
      if (!recipientUser) {
        throw new NotFoundException(
          'Recipient user not found or invalid recipient level',
        );
      }
      recipientUserId = recipientUser.id;
    } else {
      // Get existing billing to get recipient user
      const existingBilling = await this.getSingle(id, {
        _relations: ['recipientUser'],
      });
      if (existingBilling?.recipientUser) {
        recipientUserId = existingBilling.recipientUser.id;
      }
    }

    // Get billing settings for tax rate if amount is being updated
    if (updateBillingDto.amount !== undefined && recipientUserId) {
      const billingSettings = await this.userSettingsService.getUserSettings(
        recipientUserId,
      );

      // Apply tax rate if configured
      if (billingSettings?.billing?.taxRate) {
        const taxAmount =
          (updateBillingDto.amount * billingSettings.billing.taxRate) / 100;
        updateBillingDto.amount = updateBillingDto.amount + taxAmount;
      }
    }

    // Update billing data
    await this.update(id, updateBillingDto);

    return {
      message: 'Billing updated successfully',
    };
  }

  async handleCheckoutSuccess(
    token: string,
    sessionId: string,
  ): Promise<{
    success: boolean;
    billing: any | null;
  }> {
    try {
      // Verify and decode the JWT token
      const decoded = this.jwtService.verify(token);
      const { id: userId, billingId } = decoded;

      const billing = await this.getSingle(billingId, {
        _relations: ['recipientUser'],
      });

      let success = false;

      try {
        const session = sessionId
          ? await this.stripeBillingService.getCheckoutSession(sessionId)
          : null;

        if (session) {
          if (
            session.status === 'complete' &&
            session.payment_status === 'paid'
          ) {
            await this.stripeService.handleSessionPaymentSuccess(session);
            success = true;
          }
        }
      } catch (error) {
        console.error(`Failed to get checkout session: ${error.message}`);
      }

      return {
        success,
        billing,
      };
    } catch (error) {
      console.error(`Checkout success handling failed: ${error.message}`);
      throw new BadRequestException(
        `Failed to complete order purchase: ${error.message}`,
      );
    }
  }

  async handleCheckoutCancel(): Promise<{
    message: string;
    success: boolean;
    billing: null;
  }> {
    try {
      return {
        message: 'Billing payment was canceled. You can try again anytime.',
        success: false,
        billing: null,
      };
    } catch (error) {
      console.error(`Checkout cancel handling failed: ${error.message}`);
      throw new BadRequestException(
        `Failed to handle checkout cancellation: ${error.message}`,
      );
    }
  }

  async sendBillingEmail(id: string): Promise<IMessageResponse> {
    const billing = await this.getSingle(id, {
      _relations: ['recipientUser'],
    });

    if (!billing) {
      throw new NotFoundException('Billing not found');
    }

    // Send email notification using the notification service
    await this.billingNotificationService.notifyBillingCreated(billing);

    return {
      message: 'Billing email sent successfully to recipient',
    };
  }
}
