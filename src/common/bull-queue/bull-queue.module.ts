import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullQueueService } from './bull-queue.service';
import { WorkerManagerService } from './services/worker-manager.service';
import { ActionRegistryService } from './services/action-registry.service';
import { QueueController } from './queue.controller';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';
import { getBullQueueConfig } from '../../config/bull-queue.config';

@Module({
  imports: [ConfigModule, ActivityLogsModule],
  controllers: [QueueController],
  providers: [
    {
      provide: 'BULL_QUEUE_CONFIG',
      useFactory: getBullQueueConfig,
      inject: [ConfigService],
    },
    BullQueueService,
    ActionRegistryService,
    WorkerManagerService,
  ],
  exports: [
    BullQueueService,
    ActionRegistryService,
    WorkerManagerService,
  ],
})
export class BullQueueModule {}
