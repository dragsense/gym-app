import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrudEventService } from './services/crud-event.service';

@Module({
  imports: [TypeOrmModule],
  providers: [CrudEventService],
  exports: [CrudEventService],
})
export class CrudModule {}
