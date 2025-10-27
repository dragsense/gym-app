import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CrudService } from '@/common/crud/crud.service';
import { EventService } from '../../helper/services/event.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class PermissionsService extends CrudService<Permission> {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    dataSource: DataSource,
    eventService: EventService,
    @Inject(REQUEST) request: Request,
  ) {
    super(permissionRepository, dataSource, eventService, request);
  }
}
