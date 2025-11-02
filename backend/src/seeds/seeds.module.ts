import { Module } from '@nestjs/common';
import { SeedRunnerService } from './seed-runner.service';
import { PaymentMethodsModule } from '../common/payment-methods/payment-methods.module';
import { RolesModule } from '../common/roles/roles.module';
import { BaseUserModule } from '@/common/base-user/base-users.module';

@Module({
  imports: [PaymentMethodsModule, BaseUserModule, RolesModule],
  providers: [SeedRunnerService],
  exports: [SeedRunnerService],
})
export class SeedsModule {}
