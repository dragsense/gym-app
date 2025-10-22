import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CrudService } from '@/common/crud/crud.service';
import { EventService } from '../../helper/services/event.service';

@Injectable()
export class PermissionsService extends CrudService<Permission> {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    dataSource: DataSource,
    eventService: EventService,
  ) {
    super(permissionRepository, dataSource, eventService);
  }
}
