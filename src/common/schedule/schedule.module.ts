import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { ScheduleExecutorService } from './schedule-executor.service';
import { ScheduleSubscriber } from './subscribers/schedule.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule])],
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleExecutorService, ScheduleSubscriber],
  exports: [ScheduleService],
})
export class ScheduleModule {}

