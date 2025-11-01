import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { PaymentMethodsModule } from '@/common/payment-methods/payment-methods.module';
import { StripeBillingService } from './services/stripe-billing.service';
import { ProfilesModule } from '../users/profiles/profiles.module';

@Module({
  imports: [PaymentMethodsModule, ProfilesModule],
  controllers: [StripeController],
  providers: [StripeService, StripeBillingService],
  exports: [StripeService, StripeBillingService],
})
export class StripeModule {}
