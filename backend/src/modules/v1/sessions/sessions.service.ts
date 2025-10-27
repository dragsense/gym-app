import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { Session } from './entities/session.entity';
import {
  CreateSessionDto,
  UpdateSessionDto,
  SessionListDto,
} from '@shared/dtos';
import { IMessageResponse } from '@shared/interfaces';
import { LoggerService } from '@/common/logger/logger.service';
import { CrudService } from '@/common/crud/crud.service';
import { EventService } from '@/common/helper/services/event.service';
import { CrudOptions } from '@/common/crud/interfaces/crud.interface';
import { UsersService } from '../users/users.service';
import { EUserLevels, EUserRole } from '@shared/enums';

@Injectable()
export class SessionsService extends CrudService<Session> {
  private readonly customLogger = new LoggerService(SessionsService.name);

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    private readonly usersService: UsersService,
    dataSource: DataSource,
    eventService: EventService,
    
  ) {
    const crudOptions: CrudOptions = {
      restrictedFields: ['trainer.user.password', 'clients.user.password'],
      searchableFields: ['title', 'description', 'location', 'notes'],
    };
    super(sessionRepo, dataSource, eventService, crudOptions);
  }

  async createSession(
    createSessionDto: CreateSessionDto,
    userId: string,
  ): Promise<IMessageResponse & { session: Session }> {
    if (!createSessionDto.trainerUser || !createSessionDto.trainerUser.id) {
      throw new BadRequestException('Trainer user is required');
    }

    // Check if trainer exists and is actually a trainer
    const trainerUser = await this.usersService.getSingle({
      id: createSessionDto.trainerUser.id,
    });
    if (!trainerUser || trainerUser.level !== EUserLevels[EUserRole.TRAINER]) {
      throw new NotFoundException('Trainer not found or invalid trainer level');
    }

    if (createSessionDto.clientsUsers?.length <= 0) {
      throw new BadRequestException(
        'At least one client user must be selected',
      );
    }

    // Check if all clients exist and are actually clients
    for (const clientUserDto of createSessionDto.clientsUsers) {
      const clientUser = await this.usersService.getSingle({
        id: clientUserDto.id,
      });
      if (!clientUser || clientUser.level !== EUserLevels[EUserRole.CLIENT]) {
        throw new NotFoundException(
          `Client with ID ${clientUserDto.id} not found or invalid client level`,
        );
      }
    }

    // Use CRUD service create method
    const session = await this.create(createSessionDto, {
      beforeCreate: async (manager: EntityManager) => {
        return {
          ...createSessionDto,
          createdByUser: {
            id: userId,
          },
          trainerUser: {
            id: createSessionDto.trainerUser.id,
          },
          clientsUsers: createSessionDto.clientsUsers.map((clientUser) => ({
            id: clientUser.id,
          })),
        };
      },
    });

    return { message: 'Session created successfully.', session };
  }

  async updateSession(
    id: string,
    updateSessionDto: UpdateSessionDto,
    userId: string,
  ): Promise<IMessageResponse> {
    if (updateSessionDto.trainerUser && updateSessionDto.trainerUser.id) {
      // Check if trainer exists and is actually a trainer
      const trainerUser = await this.usersService.getSingle(
        { id: updateSessionDto.trainerUser.id },
        { __relations: ['user'] },
      );
      if (
        !trainerUser ||
        trainerUser.level !== EUserLevels[EUserRole.TRAINER]
      ) {
        throw new NotFoundException(
          'Trainer not found or invalid trainer level',
        );
      }
    }

    if (
      updateSessionDto.clientsUsers &&
      updateSessionDto.clientsUsers.length > 0
    ) {
      // Check if all clients exist and are actually clients
      for (const clientUserDto of updateSessionDto.clientsUsers) {
        const clientUser = await this.usersService.getSingle({
          id: clientUserDto.id,
        });
        if (!clientUser || clientUser.level !== EUserLevels[EUserRole.CLIENT]) {
          throw new NotFoundException(
            `Client with ID ${clientUserDto.id} not found or invalid client level`,
          );
        }
      }
    }

    // Update session data
    await this.update({ id }, updateSessionDto);

    return {
      message: 'Session updated successfully',
    };
  }
}
