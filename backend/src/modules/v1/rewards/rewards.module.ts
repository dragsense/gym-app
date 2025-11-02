import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { RewardPoints } from './entities/reward-points.entity';
import { User } from '@/common/base-user/entities/user.entity';
import { ReferralLink } from '@/modules/v1/referral-links/entities/referral-link.entity';
import { CrudModule } from '@/common/crud/crud.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RewardPoints, User, ReferralLink]),
    CrudModule,
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
