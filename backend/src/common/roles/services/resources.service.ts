import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Resource } from '../entities/resource.entity';
import { CrudService } from '@/common/crud/crud.service';
import { EventService } from '../../helper/services/event.service';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class ResourcesService extends CrudService<Resource> {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    dataSource: DataSource,
    eventService: EventService,
    @Inject(REQUEST) request: Request,
  ) {
    super(resourceRepository, dataSource, eventService, request);
  }
}
