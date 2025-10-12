import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrudService } from './crud.service';
import { CrudEventService } from './services/crud-event.service';

@Module({
  imports: [TypeOrmModule],
  providers: [CrudService, CrudEventService],
  exports: [CrudService, CrudEventService],
})
export class CrudModule {}
