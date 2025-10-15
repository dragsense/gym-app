import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainerClientsController } from './trainer-clients.controller';
import { TrainerClientsService } from './trainer-clients.service';
import { TrainerClient } from './entities/trainer-client.entity';
import { UsersModule } from '../users/users.module';
import { CrudModule } from '@/common/crud/crud.module';
import { EventService } from '@/common/events/event.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainerClient]),
    UsersModule,
    CrudModule,
  ],
  controllers: [TrainerClientsController],
  providers: [TrainerClientsService, EventService],
  exports: [TrainerClientsService],
})
export class TrainerClientsModule {}
