import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { LoggerService } from '@/common/logger/logger.service';

@Injectable()
export abstract class BaseStripeService {
    protected readonly logger = new LoggerService(this.constructor.name);
    stripe: Stripe | null = null;
    stripeConfig: { secretKey: string; webhookSecret?: string; publishableKey: string } | null = null;

    constructor(protected readonly configService: ConfigService) {
        this.initializeStripe();
    }

    /**
     * Initialize Stripe with configuration
     */
    private async initializeStripe() {
        try {
            this.logger.log('Initializing Stripe service...');

            const stripeConfig = this.configService.get('stripe');
            if (stripeConfig) {
                this.stripe = new Stripe(stripeConfig.secretKey);
                this.stripeConfig = stripeConfig;
                this.logger.log('Stripe initialized successfully with database configuration');
            }
        } catch (error) {
            this.logger.error('Error initializing Stripe:', error.message);
            this.stripe = null;
        }
    }

    /**
     * Ensure Stripe is initialized before use
     */
    protected async ensureStripeInitialized() {
        if (!this.stripe || !this.stripeConfig) {
            this.logger.log('Stripe not initialized, attempting to initialize...');
            await this.initializeStripe();
        }

        if (!this.stripe) {
            this.logger.error('Stripe initialization failed - service not available');
            throw new BadRequestException(
                'Stripe is not configured. Please configure Stripe in Payment Methods settings or install stripe package.'
            );
        }
    }

    /**
     * Get the Stripe instance (ensures it's initialized)
     */
    async getStripe(): Promise<Stripe> {
        await this.ensureStripeInitialized();
        return this.stripe!;
    }

    /**
     * Get the Stripe configuration
     */
    getStripeConfig() {
        return this.stripeConfig;
    }
}
