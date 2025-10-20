import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { BillingsService } from './billings.service';
import { BillingsController } from './billings.controller';
import { Billing } from './entities/billing.entity';
import { BillingEmailService } from './services/billing-email.service';
import { BillingEventListenerService } from './services/billing-event-listener.service';
import { BillingProcessor } from './services/billing.processor';
import { CrudModule } from '@/common/crud/crud.module';
import { ScheduleModule } from '@/common/schedule/schedule.module';
import { UsersModule } from '../users/users.module';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from '@/config/jwt.config';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Billing]),
    CrudModule,
    ScheduleModule,
    BullModule.registerQueue({ name: 'billing' }),
    UsersModule,
    StripeModule,
    JwtModule.registerAsync({
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  exports: [BillingsService, BillingEmailService],
  controllers: [BillingsController],
  providers: [BillingsService, BillingEmailService, BillingEventListenerService, BillingProcessor],
})
export class BillingsModule { }
