import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainerClientsController } from './trainer-clients.controller';
import { TrainerClientsService } from './trainer-clients.service';
import { TrainerClient } from './entities/trainer-client.entity';
import { CrudModule } from '@/common/crud/crud.module';
import { EventService } from '@/common/helper/services/event.service';
import { TrainersModule } from '../trainers/trainers.module';
import { ClientsModule } from '../clients/clients.module';
import { NotificationModule } from '@/common/notification/notification.module';
import { TrainerClientNotificationService } from './services/trainer-client-notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainerClient]),
    TrainersModule,
    ClientsModule,
    CrudModule,
    NotificationModule,
  ],
  controllers: [TrainerClientsController],
  providers: [
    TrainerClientsService,
    EventService,
    TrainerClientNotificationService,
  ],
  exports: [TrainerClientsService],
})
export class TrainerClientsModule {}
