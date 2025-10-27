import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CrudService } from '@/common/crud/crud.service';
import { UserAvailability } from './entities/user-availability.entity';
import { CreateUserAvailabilityDto } from '@shared/dtos/user-availability-dtos';
import { EventService } from '@/common/helper/services/event.service';
import { CrudOptions } from '@/common/crud/interfaces/crud.interface';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class UserAvailabilityService extends CrudService<UserAvailability> {
  constructor(
    @InjectRepository(UserAvailability)
    private readonly userAvailabilityRepository: Repository<UserAvailability>,
    dataSource: DataSource,
    eventService: EventService,
    @Inject(REQUEST) request: Request,
  ) {
    const crudOptions: CrudOptions = {
      restrictedFields: ['user.password'],
    };
    super(
      userAvailabilityRepository,
      dataSource,
      eventService,
      request,
      crudOptions,
    );
  }

  async createOrUpdateUserAvailability(
    createUserAvailabilityDto: CreateUserAvailabilityDto,
    userId: string,
  ): Promise<UserAvailability> {
    let existingAvailability: UserAvailability | null = null;

    try {
      existingAvailability = await this.getSingle({
        userId,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        existingAvailability = null;
      }
    }

    if (existingAvailability) {
      return await this.update(
        existingAvailability.id,
        createUserAvailabilityDto,
      );
    } else {
      return await this.create({
        ...createUserAvailabilityDto,
        user: { id: userId },
      });
    }
  }
}
