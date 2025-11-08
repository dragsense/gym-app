import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

// Entities
import { Session } from '@/modules/v1/sessions/entities/session.entity';
import { Billing } from '@/modules/v1/billings/entities/billing.entity';
import { User } from '@/common/base-user/entities/user.entity';
import { ReferralLink } from '@/modules/v1/referral-links/entities/referral-link.entity';
import { TrainerClient } from '@/modules/v1/trainer-clients/entities/trainer-client.entity';
import { Trainer } from '@/modules/v1/trainers/entities/trainer.entity';
import { Client } from '@/modules/v1/clients/entities/client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Session,
      Billing,
      ReferralLink,
      TrainerClient,
      Trainer,
      Client,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
