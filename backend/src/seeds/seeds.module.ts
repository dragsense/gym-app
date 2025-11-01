import { Module } from '@nestjs/common';
import { SeedRunnerService } from './seed-runner.service';
import { PaymentMethodsModule } from '../common/payment-methods/payment-methods.module';
import { RolesModule } from '../common/roles/roles.module';
import { SystemUserModule } from '@/common/system-user/system-users.module';

@Module({
  imports: [PaymentMethodsModule, SystemUserModule, RolesModule],
  providers: [SeedRunnerService],
  exports: [SeedRunnerService],
})
export class SeedsModule {}
