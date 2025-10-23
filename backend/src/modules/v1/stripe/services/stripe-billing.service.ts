/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { User } from '../../users/entities/user.entity';
import { BaseStripeService } from './base-stripe.service';

@Injectable()
export class StripeBillingService extends BaseStripeService {
  constructor(
    configService: ConfigService,
  ) {
    super(configService);
  }



  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    const stripe = await this.getStripe();

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      this.logger.error(`Error retrieving checkout session ${sessionId}: ` + error.message);
      throw new BadRequestException(`Failed to retrieve checkout session: ${error.message}`);
    }
  }


  async createOrGetStripeCustomer(user: User): Promise<string> {
    this.logger.log(`Creating or retrieving Stripe customer for user: ${user.email} (ID: ${user.id})`);

    const stripe = await this.getStripe();

    if (user.stripeCustomerId) {
      this.logger.debug(`User has existing Stripe customer ID: ${user.stripeCustomerId}`);
      try {
        const existingCustomer = await stripe.customers.retrieve(user.stripeCustomerId);

        if (!existingCustomer.deleted) {
          this.logger.log(`Retrieved existing Stripe customer: ${existingCustomer.id}`);
          return existingCustomer.id;
        } else {
          this.logger.warn(`Existing Stripe customer ${user.stripeCustomerId} is deleted`);
        }
      } catch (error) {
        this.logger.warn(`Stripe customer ID ${user.stripeCustomerId} invalid or deleted. Creating new customer.`);
        this.logger.error(error.message);
      }
    }

    try {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        const found = customers.data[0];
        this.logger.log(`Found existing Stripe customer by email: ${found.id}`);

        return found.id;
      }
    } catch (error) {
      this.logger.warn(`Failed to search Stripe customer by email: ` +  error.message);
    }

    try {
      const customer = await stripe.customers.create({
        name: `${user.profile?.firstName ?? 'User'} ${user.profile?.lastName ?? ''}`,
        email: user.email,
        metadata: {
          userId: user.id.toString(),
        },
      });

      this.logger.log(`Created new Stripe customer: ${customer.id} for user ${user.id}`);
      return customer.id;
    } catch (error) {
      this.logger.error(`Failed to create Stripe customer for user ${user.id}:`, error.message);
      throw new BadRequestException(`Failed to create Stripe customer: ${error.message}`);
    }
  }


  //for pos
  async createCheckoutSession(
    customerId: string,
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
    metadata: Record<string, string>,
    successUrl: string,
    cancelUrl: string,
    createInvoice: boolean = false,
  ) {
    const stripe = await this.getStripe();
    return stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      invoice_creation: {
        enabled: createInvoice,
        invoice_data: {
          metadata: metadata,
        },
      },
    
    });
  }
} 