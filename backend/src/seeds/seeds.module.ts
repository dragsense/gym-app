import { Module } from '@nestjs/common';
import { SeedRunnerService } from './seed-runner.service';
import { PaymentMethodsModule } from '../common/payment-methods/payment-methods.module';
import { UsersModule } from '../modules/v1/users/users.module';
import { RolesModule } from '../common/roles/roles.module';

@Module({
  imports: [PaymentMethodsModule, UsersModule, RolesModule],
  providers: [SeedRunnerService],
  exports: [SeedRunnerService],
})
export class SeedsModule {}
