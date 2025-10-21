import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentMethodsService } from '@/common/payment-methods/payment-methods.service';
import Stripe from 'stripe';
import { EPaymentMethodType } from 'shared/enums/payment-methods.enum';
import { DataSource } from 'typeorm';
import { Billing } from '../billings/entities/billing.entity';
import { EBillingStatus } from 'shared/enums/billing.enum';
import { BaseStripeService } from './services/base-stripe.service';

@Injectable()
export class StripeService extends BaseStripeService {
  constructor(
    private readonly dataSource: DataSource,
    configService: ConfigService,
    private readonly paymentMethodsService: PaymentMethodsService,
  ) {
    super(configService);
  }

  /**
   * Check if Stripe is enabled by checking payment method
   */
  async isStripeEnabled(): Promise<boolean> {
    try {
      const stripePaymentMethod = await this.paymentMethodsService.getSingle({ type: EPaymentMethodType.STRIPE });
      return !!stripePaymentMethod && stripePaymentMethod.enabled;
    } catch (error) {
      this.logger.warn('Stripe payment method not found or not active');
      return false;
    }
  }



  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(payload: Buffer, signature: string): Promise<any> {
    this.logger.log('Processing Stripe webhook...');

    if (!payload) {
      this.logger.error('No payload received in webhook');
      throw new BadRequestException('No payload received in webhook');
    }

    const stripe = await this.getStripe();
    const webhookSecret = this.getStripeConfig()?.webhookSecret;

    if (!webhookSecret) {
      this.logger.error('Webhook secret not configured in payment methods settings');
      throw new BadRequestException('Webhook secret not configured in payment methods settings');
    }

    try {
      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

      this.logger.log(`Received webhook event: ${event.type}`);

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleSessionPaymentSuccess(event.data.object as Stripe.Checkout.Session);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      this.logger.log(`Webhook processed successfully: ${event.type}`);
      return event;
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error.message}`);
      throw error;
    }
  }

  async handleSessionPaymentSuccess(session): Promise<void> {
    const { billingId, userId } = session.metadata;
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        attempt++;
        this.logger.log(`Processing custom billing payment ID: ${billingId} (attempt ${attempt}/${maxRetries})`);

        await this.dataSource.transaction(async (transactionManager) => {
          // Find order within transaction
          const billing = await transactionManager.findOne(Billing, {
            where: { id: billingId, recipientUser: { id: userId } },
            relations: ['recipientUser'],
          });

          if (!billing) {
            this.logger.error(`Billing not found with ID: ${billingId}`);
            return;
          }


    
          billing.status = EBillingStatus.PAID;
          billing.paidAt = new Date();
      
          // Update order status
          await transactionManager.save(billing);
        });

        this.logger.log(`Billing ${billingId} payment processing completed successfully on attempt ${attempt}`);
        return;

      } catch (error) {
        this.logger.error(`Error processing custom payment for billing ${billingId} on attempt ${attempt}: ${error.message}`, error.stack);

        if (attempt >= maxRetries) {
          this.logger.error(`Failed to process custom payment for billing ${billingId} after ${maxRetries} attempts. Giving up.`);
          throw error;
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        this.logger.log(`Retrying custom payment for billing ${billingId} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
