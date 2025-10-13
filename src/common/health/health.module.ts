import { Module } from '@nestjs/common';
import { AppHealthService } from './app-health.service';
import { HealthController } from './health.controller';
import { HealthSpecController } from './health-spec.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [AppHealthService],
  controllers: [HealthController, HealthSpecController],
  exports: [AppHealthService],
})
export class HealthModule {}
