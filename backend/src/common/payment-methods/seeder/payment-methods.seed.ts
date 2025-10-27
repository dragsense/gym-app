import { EPaymentMethodType } from '@shared/enums/payment-methods.enum';
import { PaymentMethodsService } from '../payment-methods.service';
import { LoggerService } from '@/common/logger/logger.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentMethodsSeed {
  private readonly logger = new LoggerService(PaymentMethodsSeed.name);
  constructor(private paymentMethodsService: PaymentMethodsService) {}

  async run(): Promise<void> {
    const paymentMethods = [
      {
        type: EPaymentMethodType.STRIPE,
        enabled: true,
        description: 'Credit card payments via Stripe',
      },
      {
        type: EPaymentMethodType.CASH,
        enabled: true,
        description: 'Cash payments',
      },
    ];

    for (const paymentMethodData of paymentMethods) {
      try {
        await this.paymentMethodsService.createPaymentMethod(paymentMethodData);
        this.logger.log(`Created payment method: ${paymentMethodData.type}`);
      } catch (error) {
        this.logger.error(
          `Error creating payment method: ${paymentMethodData.type}`,
          error,
        );
      }
    }
  }
}
