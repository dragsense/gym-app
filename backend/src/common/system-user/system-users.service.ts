import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@/common/system-user/entities/user.entity';
import { LoggerService } from '@/common/logger/logger.service';
import { CrudService } from '@/common/crud/crud.service';
import { CrudOptions } from '@/common/crud/interfaces/crud.interface';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class SystemUsersService extends CrudService<User> {
  private readonly customLogger = new LoggerService(SystemUsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    moduleRef: ModuleRef,
  ) {
    const crudOptions: CrudOptions = {
      restrictedFields: ['password', 'passwordHistory'],
      searchableFields: ['email'],
    };
    super(userRepo, moduleRef, crudOptions);
  }

  async getUserByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'passwordHistory'],
    });
  }

  async getUserByIdWithPassword(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      select: ['id', 'email', 'password', 'passwordHistory'],
    });
  }
}
