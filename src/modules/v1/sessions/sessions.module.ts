import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { Session } from './entities/session.entity';
import { CrudModule } from '@/common/crud/crud.module';
import { TrainersModule } from '../trainers/trainers.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
    CrudModule,
    TrainersModule,
    ClientsModule,
  ],
  exports: [SessionsService],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule { }
