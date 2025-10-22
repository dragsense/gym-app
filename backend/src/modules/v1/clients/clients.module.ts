import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client } from './entities/client.entity';
import { CrudModule } from '@/common/crud/crud.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client]),
    CrudModule,
    UsersModule
  ],
  exports: [ClientsService],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule { }
