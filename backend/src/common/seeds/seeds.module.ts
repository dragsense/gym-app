import { Module } from '@nestjs/common';
import { SeedRunnerService } from './seed-runner.service';
import { PaymentMethodsModule } from '../payment-methods/payment-methods.module';

@Module({
  imports: [PaymentMethodsModule],
  providers: [SeedRunnerService],
  exports: [SeedRunnerService],
})
export class SeedsModule {}
