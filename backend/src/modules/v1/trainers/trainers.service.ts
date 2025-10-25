import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Trainer } from './entities/trainer.entity';
import { CreateTrainerDto, UpdateTrainerDto } from '@shared/dtos';
import { CrudService } from '@/common/crud/crud.service';
import { EventService } from '@/common/helper/services/event.service';
import { CrudOptions } from '@/common/crud/interfaces/crud.interface';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { EUserLevels, EUserRole } from '@shared/enums';
import { IMessageResponse } from '@shared/interfaces';

@Injectable()
export class TrainersService extends CrudService<Trainer> {
  constructor(
    @InjectRepository(Trainer)
    private readonly trainerRepo: Repository<Trainer>,
    private readonly userService: UsersService,
    dataSource: DataSource,
    eventService: EventService,
  ) {
    const crudOptions: CrudOptions = {
      restrictedFields: ['user.password'],
      searchableFields: [
        'user.email',
        'user.profile.firstName',
        'user.profile.lastName',
      ],
    };
    super(trainerRepo, dataSource, eventService, crudOptions);
  }

  async createTrainer(
    createTrainerDto: CreateTrainerDto,
    userId: number,
  ): Promise<IMessageResponse & { trainer: Trainer }> {
    const { user, ...trainerData } = createTrainerDto;

    const savedTrainer = await this.create(
      { ...trainerData, createdByUser: { id: userId } },
      {
        afterCreate: async (savedEntity, manager) => {
          try {
            const savedUser = await this.userService.createUser({
              ...user,
              level: EUserLevels[EUserRole.TRAINER],
            });
            savedEntity.user = savedUser.user;

            await manager.update(Trainer, savedEntity.id, {
              user: savedUser.user,
            });
          } catch (error) {
            throw new Error('Failed to create user', error);
          }
        },
      },
    );

    return {
      message: 'Trainer created successfully',
      trainer: savedTrainer,
    };
  }

  async updateTrainer(
    id: number,
    updateTrainerDto: UpdateTrainerDto,
  ): Promise<Trainer> {
    const { user, ...trainerData } = updateTrainerDto;

    return await this.update(id, trainerData, {
      afterUpdate: async (existingEntity) => {
        try {
          const existingTrainer = await this.getSingle(
            { id: existingEntity.id },
            { __relations: 'user' },
          );

          if (user && existingTrainer.user)
            await this.userService.updateUser(existingTrainer.user.id, user);
        } catch (error) {
          throw new Error('Failed to update user', error);
        }
      },
    });
  }
}
