import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';

import { Trainer } from './entities/trainer.entity';
import { CreateTrainerDto, UpdateTrainerDto } from '@shared/dtos';
import { CrudService } from '@/common/crud/crud.service';
import { CrudOptions } from '@/common/crud/interfaces/crud.interface';
import { UsersService } from '../users/users.service';
import { EUserLevels } from '@shared/enums';
import { IMessageResponse } from '@shared/interfaces';

@Injectable()
export class TrainersService extends CrudService<Trainer> {
  constructor(
    @InjectRepository(Trainer)
    private readonly trainerRepo: Repository<Trainer>,
    private readonly userService: UsersService,
    moduleRef: ModuleRef,
  ) {
    const crudOptions: CrudOptions = {
      restrictedFields: ['user.password'],
      searchableFields: [
        'user.email',
        'user.profile.firstName',
        'user.profile.lastName',
      ],
    };
    super(trainerRepo, moduleRef, crudOptions);
  }

  async createTrainer(
    createTrainerDto: CreateTrainerDto,
  ): Promise<IMessageResponse & { trainer: Trainer }> {
    const { user, ...trainerData } = createTrainerDto;

    const savedTrainer = await this.create(trainerData, {
      afterCreate: async (savedEntity, manager) => {
        try {
          const savedUser = await this.userService.createUser({
            ...user,
            level: EUserLevels.TRAINER,
          });
          savedEntity.user = savedUser.user;

          await manager.update(Trainer, savedEntity.id, {
            user: savedUser.user,
          });
        } catch (error) {
          throw new Error('Failed to create user', { cause: error as Error });
        }
      },
    });

    return {
      message: 'Trainer created successfully',
      trainer: savedTrainer,
    };
  }

  async updateTrainer(
    id: string,
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
          throw new Error('Failed to update user', { cause: error as Error });
        }
      },
    });
  }

  async deleteTrainer(id: string): Promise<void> {
    await this.delete(id, {
      beforeDelete: async (entity: Trainer) => {
        if (entity.user) {
          await this.userService.deleteUser(entity.user.id);
        }
      },
    });
  }
}
