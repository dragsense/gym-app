import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogsController } from './activity-logs.controller';
import { ActivityLogInterceptor } from './interceptors/activity-log.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog])],
  controllers: [ActivityLogsController],
  providers: [ActivityLogsService, ActivityLogInterceptor],
  exports: [ActivityLogsService, ActivityLogInterceptor],
})
export class ActivityLogsModule {}
