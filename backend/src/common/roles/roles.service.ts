import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Resource } from './entities/resource.entity';
import { CrudService } from '@/common/crud/crud.service';
import { EventService } from '../helper/services/event.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class RolesService extends CrudService<Role> {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    dataSource: DataSource,
    eventService: EventService,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    @Inject(REQUEST) request: Request,
  ) {
    super(roleRepository, dataSource, eventService, request);
  }
}
