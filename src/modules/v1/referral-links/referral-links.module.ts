import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralLinksService } from './referral-links.service';
import { ReferralLinksController } from './referral-links.controller';
import { ReferralLink } from './entities/referral-link.entity';
import { CrudModule } from '@/common/crud/crud.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReferralLink]),
    CrudModule,
    UsersModule,
  ],
  controllers: [ReferralLinksController],
  providers: [ReferralLinksService],
  exports: [ReferralLinksService],
})
export class ReferralLinksModule {}
