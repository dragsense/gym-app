import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Client } from './entities/client.entity';
import { CreateClientDto, UpdateClientDto } from '@shared/dtos';
import { CrudService } from '@/common/crud/crud.service';
import { EventService } from '@/common/helper/services/event.service';
import { CrudOptions } from '@/common/crud/interfaces/crud.interface';
import { UsersService } from '../users/users.service';
import { EUserLevels, EUserRole } from '@shared/enums';
import { IMessageResponse } from '@shared/interfaces';
import { User } from '../users/entities/user.entity';

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
      restrictedFields: ['user.password'],
      searchableFields: [
        'user.email',
        'user.profile.firstName',
        'user.profile.lastName',
      ],
    };
    super(clientRepo, dataSource, eventService, crudOptions);
  }

  async createClient(
    createClientDto: CreateClientDto,
  ): Promise<IMessageResponse & { client: Client }> {
    const { user, ...clientData } = createClientDto;
    const savedClient = await this.create(clientData, {
      afterCreate: async (savedEntity, manager) => {
        try {
          const savedUser = await this.userService.createUser({
            ...user,
            level: EUserLevels[EUserRole.CLIENT],
          });
          savedEntity.user = savedUser.user;

          await manager.update(Client, savedEntity.id, {
            user: savedUser.user,
          });
        } catch (error) {
          throw new Error('Failed to create user', { cause: error });
        }
      },
    });

    return { message: 'Client created successfully', client: savedClient };
  }

  async updateClient(
    id: string,
    updateClientDto: UpdateClientDto,
  ): Promise<Client> {
    const { user, ...clientData } = updateClientDto;
    return await this.update(id, clientData, {
      afterUpdate: async (existingEntity) => {
        try {
          const existingClient = await this.getSingle(
            { id: existingEntity.id },
            { __relations: 'user' },
          );

          if (user && existingClient.user)
            await this.userService.updateUser(existingClient.user.id, user);
        } catch (error) {
          throw new Error('Failed to update user', { cause: error as Error });
        }
      },
    });
  }

  async deleteClient(id: string, userId: string): Promise<void> {
    await this.delete(id, {
      beforeDelete: async (entity: Client) => {
        if (entity.user) {
          await this.userService.delete({ id: entity.user.id });
        }
      },
    });
  }
}
