import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Client } from './entities/client.entity';
import { CreateClientDto, UpdateClientDto } from 'shared/dtos';
import { CrudService } from '@/common/crud/crud.service';
import { EventService } from '@/common/events/event.service';
import { CrudOptions } from '@/common/crud/interfaces/crud.interface';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { EUserLevels, EUserRole } from 'shared/enums';

@Injectable()
export class ClientsService extends CrudService<Client> {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    private readonly userService: UsersService,
    dataSource: DataSource,
    eventService: EventService,
  ) {
    const crudOptions: CrudOptions = {
    };
    super(clientRepo, dataSource, eventService, crudOptions);
  }

  async createClient(createClientDto: CreateClientDto): Promise<Client> {
    const { user, ...clientData } = createClientDto;
    return await this.create(clientData, {
      afterCreate: async (savedEntity, manager) => {

        try {
          const savedUser = await this.userService.createUser({...user, level: EUserLevels[EUserRole.CLIENT]});
          savedEntity.user = savedUser.user;

          await manager.update(Client, savedEntity.id, { user: savedUser.user });

        } catch (error) {
          throw new Error('Failed to create user', error);
        }
      }
    });
  }

  async updateClient(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    const { user, ...clientData } = updateClientDto;
    return await this.update(id, clientData, {
      afterUpdate: async (existingEntity) => {
        try {
          const existingTrainer = await this.getSingle({ id: existingEntity.id }, { __relations: 'user' });

          if (user && existingTrainer.user)
            await this.userService.updateUser(existingTrainer.user.id, user);

        }
        catch (error) {
          throw new Error('Failed to update user', error);
        }


      }
    });
  }
}
