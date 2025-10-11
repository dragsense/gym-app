import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullQueueService } from './bull-queue.service';
import { WorkerManagerService } from './services/worker-manager.service';
import { ActionRegistryService } from './services/action-registry.service';
import { QueueController } from './queue.controller';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
  imports: [ConfigModule, ActivityLogsModule],
  controllers: [QueueController],
  providers: [
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
