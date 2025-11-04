import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { Session } from './entities/session.entity';
import { SessionEmailService } from './services/session-email.service';
import { SessionEventListenerService } from './services/session-event-listener.service';
import { SessionProcessor } from './services/session.processor';
import { CrudModule } from '@/common/crud/crud.module';
import { ScheduleModule } from '@/common/schedule/schedule.module';
import { TrainersModule } from '../trainers/trainers.module';
import { ClientsModule } from '../clients/clients.module';
import { UsersModule } from '../users/users.module';
import { NotificationModule } from '@/common/notification/notification.module';
import { SessionNotificationService } from './services/session-notification.service';
import { User } from '@/common/base-user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session, User]),
    CrudModule,
    ScheduleModule,
    BullModule.registerQueue({ name: 'session' }),
    TrainersModule,
    ClientsModule,
    UsersModule,
    NotificationModule,
  ],
  exports: [SessionsService, SessionEmailService],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    SessionEmailService,
    SessionEventListenerService,
    SessionNotificationService,
    SessionProcessor,
  ],
})
export class SessionsModule {}
