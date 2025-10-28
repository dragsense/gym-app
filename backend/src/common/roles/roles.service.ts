import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Resource } from './entities/resource.entity';
import { CrudService } from '@/common/crud/crud.service';

@Injectable()
export class RolesService extends CrudService<Role> {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    moduleRef: ModuleRef,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
  ) {
    super(roleRepository, moduleRef);
  }
}
