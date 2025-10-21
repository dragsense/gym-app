import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Schedule } from './entities/schedule.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { ScheduleExecutorService } from './services/schedule-executor.service';
import { ScheduleProcessor } from './services/schedule.processor';
import { ScheduleSubscriber } from './subscribers/schedule.subscriber';
import { EventService } from '../helper/services/event.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule]),
    BullModule.registerQueue({ name: 'schedule' })
  ],
  controllers: [ScheduleController],
  providers: [
    ScheduleService, 
    ScheduleSubscriber,
    EventService,
    ScheduleExecutorService,
    ScheduleProcessor
  ],
  exports: [ScheduleService],
})
export class ScheduleModule {}

