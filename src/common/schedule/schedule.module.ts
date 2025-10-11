import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { ScheduleBullService } from './services/schedule-bull.service';
import { ScheduleRegistryService } from './services/schedule-registry.service';
import { ScheduleExecutorService } from './services/schedule-executor.service';
import { ScheduleSubscriber } from './subscribers/schedule.subscriber';
import { BullQueueModule } from '../bull-queue/bull-queue.module';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule]), BullQueueModule],
  controllers: [ScheduleController],
  providers: [
    ScheduleService, 
    ScheduleBullService, 
    ScheduleRegistryService,
    ScheduleExecutorService,
    ScheduleSubscriber
  ],
  exports: [ScheduleService, ScheduleRegistryService, ScheduleBullService, ScheduleExecutorService],
})
export class ScheduleModule {}

