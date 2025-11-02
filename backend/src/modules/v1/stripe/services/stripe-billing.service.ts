import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { BaseStripeService } from './base-stripe.service';
import { ProfilesService } from '@/modules/v1/users/profiles/profiles.service';
import { Profile } from '@/modules/v1/users/profiles/entities/profile.entity';

@Injectable()
export class StripeBillingService extends BaseStripeService {
  constructor(
    configService: ConfigService,
    private readonly profilesService: ProfilesService,
  ) {
    super(configService);
  }

  async getCheckoutSession(
    sessionId: string,
  ): Promise<Stripe.Checkout.Session> {
    const stripe = await this.getStripe();

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      this.logger.error(
        `Error retrieving checkout session ${sessionId}: ` + error.message,
      );
      throw new BadRequestException(
        `Failed to retrieve checkout session: ${error.message}`,
      );
    }
  }

  async createOrGetStripeCustomer(profile: Profile): Promise<string> {
    this.logger.log(
      `Creating or retrieving Stripe customer for user: ${profile.user.email} (ID: ${profile.user.id})`,
    );

    const stripe = await this.getStripe();

    if (profile.stripeCustomerId) {
      this.logger.debug(
        `User has existing Stripe customer ID: ${profile.stripeCustomerId}`,
      );
      try {
        const existingCustomer = await stripe.customers.retrieve(
          profile.stripeCustomerId,
        );

        if (!existingCustomer.deleted) {
          this.logger.log(
            `Retrieved existing Stripe customer: ${existingCustomer.id}`,
          );
          return existingCustomer.id;
        } else {
          this.logger.warn(
            `Existing Stripe customer ${profile.stripeCustomerId} is deleted`,
          );
        }
      } catch (error) {
        this.logger.warn(
          `Stripe customer ID ${profile.stripeCustomerId} invalid or deleted. Creating new customer.`,
        );
        this.logger.error(error.message);
      }
    }

    try {
      const customers = await stripe.customers.list({
        email: profile.user.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        const found = customers.data[0];
        this.logger.log(`Found existing Stripe customer by email: ${found.id}`);

        return found.id;
      }
    } catch (error) {
      this.logger.warn(
        `Failed to search Stripe customer by email: ` + error.message,
      );
    }

    try {
      const customer = await stripe.customers.create({
        name: `${profile.user.firstName ?? 'User'} ${profile.user.lastName ?? ''}`,
        email: profile.user.email,
        metadata: {
          userId: profile.user.id.toString(),
        },
      });

      this.logger.log(
        `Created new Stripe customer: ${customer.id} for user ${profile.user.id}`,
      );
      return customer.id;
    } catch (error) {
      this.logger.error(
        `Failed to create Stripe customer for user ${profile.user.id}:`,
        error.message as string,
      );
      throw new BadRequestException(
        `Failed to create Stripe customer: ${error.message as string}`,
      );
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
