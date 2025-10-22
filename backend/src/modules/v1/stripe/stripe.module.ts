import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { PaymentMethodsModule } from '@/common/payment-methods/payment-methods.module';
import { StripeBillingService } from './services/stripe-billing.service';

@Module({
  imports: [PaymentMethodsModule],
  controllers: [StripeController],
  providers: [StripeService, StripeBillingService],
  exports: [StripeService, StripeBillingService],
})
export class StripeModule {}
