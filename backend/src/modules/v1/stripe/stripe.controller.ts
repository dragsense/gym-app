import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  RawBody,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { LoggerService } from '@/common/logger/logger.service';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  private readonly logger = new LoggerService(StripeController.name);

  constructor(private readonly stripeService: StripeService) {}


  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleWebhook(
    @RawBody() payload: Buffer,
    @Headers('stripe-signature') signature: string
  ) {
    this.logger.log('Received Stripe webhook request');
    
    if (!payload) {
      this.logger.error('No payload received in webhook');
      throw new BadRequestException('No payload received in webhook');
    }
    
    if (!signature) {
      this.logger.error('No Stripe signature received in webhook');
      throw new BadRequestException('No Stripe signature received in webhook');
    }
        
    try {
      const event = await this.stripeService.handleWebhook(payload, signature);
      
      this.logger.log(`Successfully processed Stripe webhook event: ${event.type} (ID: ${event.id})`);
      
      return { received: true };  
    } catch (error) {
      this.logger.error(`Failed to process Stripe webhook: ${error.message}`);
      this.logger.error('Webhook error details:', error);
      throw new BadRequestException(error.message);
    }
  }
}