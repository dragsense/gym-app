import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TrainersService } from './trainers.service';
import { TrainersController } from './trainers.controller';
import { Trainer } from './entities/trainer.entity';
import { CrudModule } from '@/common/crud/crud.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trainer]),
    CrudModule,
    UsersModule
  ],
  exports: [TrainersService],
  controllers: [TrainersController],
  providers: [TrainersService],
})
export class TrainersModule { }
