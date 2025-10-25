import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CrudService } from '@/common/crud/crud.service';
import { UserAvailability } from './entities/user-availability.entity';
import {
  CreateUserAvailabilityDto,
  UpdateUserAvailabilityDto,
} from '@shared/dtos/user-availability-dtos';
import { EventService } from '@/common/helper/services/event.service';
import { CrudOptions } from '@/common/crud/interfaces/crud.interface';

@Injectable()
export class UserAvailabilityService extends CrudService<UserAvailability> {
  constructor(
    @InjectRepository(UserAvailability)
    private readonly userAvailabilityRepository: Repository<UserAvailability>,
    dataSource: DataSource,
    eventService: EventService,
  ) {
    const crudOptions: CrudOptions = {
      restrictedFields: ['user.password'],
    };
    super(userAvailabilityRepository, dataSource, eventService, crudOptions);
  }

  async createOrUpdateUserAvailability(
    createUserAvailabilityDto: CreateUserAvailabilityDto,
    userId: number,
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
