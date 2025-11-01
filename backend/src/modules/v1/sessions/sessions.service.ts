import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { ModuleRef } from '@nestjs/core';

import { Session } from './entities/session.entity';
import {
  ClientListDto,
  CreateSessionDto,
  UpdateSessionDto,
} from '@shared/dtos';
import { IMessageResponse } from '@shared/interfaces';
import { LoggerService } from '@/common/logger/logger.service';
import { CrudService } from '@/common/crud/crud.service';
import { CrudOptions } from '@/common/crud/interfaces/crud.interface';
import { EUserLevels } from '@shared/enums';
import { TrainersService } from '../trainers/trainers.service';
import { ClientsService } from '../clients/clients.service';
import { User } from '@/common/system-user/entities/user.entity';
import { Client } from '../clients/entities/client.entity';

@Injectable()
export class SessionsService extends CrudService<Session> {
  private readonly customLogger = new LoggerService(SessionsService.name);

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    private readonly trainersService: TrainersService,
    private readonly clientsService: ClientsService,
    moduleRef: ModuleRef,
  ) {
    const crudOptions: CrudOptions = {
      restrictedFields: ['trainer.user.password', 'clients.user.password'],
      searchableFields: ['title', 'description', 'location', 'notes'],
    };
    super(sessionRepo, moduleRef, crudOptions);
  }

  async createSession(
    createSessionDto: CreateSessionDto,
    currentUser: User,
  ): Promise<IMessageResponse & { session: Session }> {
    // ------------------------------------------------
    // 1. Determine trainerUser (depends on user level)
    // ------------------------------------------------
    let trainerId: string | undefined;
    const isSuperAdmin = currentUser.level === EUserLevels.SUPER_ADMIN;

    if (currentUser.level === EUserLevels.TRAINER) {
      console.log('Trainer is creating their own session');
      // Trainer is creating their own session
      const trainer = await this.trainersService.getSingle({
        userId: currentUser.id,
      });

      if (!trainer) {
        throw new NotFoundException('Trainer not found or invalid user level');
      }

      trainerId = trainer.id;
    } else {
      // Admin/superadmin creating session -> must provide trainerUser
      if (!createSessionDto.trainer?.id) {
        throw new BadRequestException('Trainer user is required');
      }

      const trainer = await this.trainersService.getSingle({
        id: createSessionDto.trainer.id,
        createdByUserId: isSuperAdmin ? undefined : currentUser.id,
      });

      if (!trainer) {
        throw new NotFoundException(
          'Trainer not found or invalid trainer level',
        );
      }

      trainerId = trainer.id;
    }

    const clientIds = createSessionDto.clients.map((c) => c.id);

    const clients = await this.clientsService.get({}, ClientListDto, {
      beforeQuery: (query: SelectQueryBuilder<Client>) => {
        query.andWhere('entity.id IN (:...ids)', { ids: clientIds });
        if (!isSuperAdmin) {
          query
            .leftJoin(
              'trainer_clients',
              'trainerClients',
              'trainerClients.clientId = entity.id',
            )
            .leftJoin('trainerClients.trainer', 'clientTrainer')
            .andWhere(
              new Brackets((qb2) => {
                qb2
                  .where('entity.createdByUserId = :uid', {
                    uid: currentUser.id,
                  })
                  .orWhere('clientTrainer.userId = :uid', {
                    uid: currentUser.id,
                  });
              }),
            )
            .distinct(true);
        }
        return query;
      },
    });

    if (clients.data.length !== clientIds.length) {
      const existingIds = clients.data.map((c) => c.id);
      const missing = clientIds.filter((id) => !existingIds.includes(id));
      throw new NotFoundException(
        `Clients not found or invalid: ${missing.join(', ')}`,
      );
    }

    const session = await this.create({
      ...createSessionDto,
      trainer: { id: trainerId },
      clients: clients.data.map((c) => ({ id: c.id })),
    });

    return { message: 'Session created successfully.', session };
  }

  async updateSession(
    id: string,
    updateSessionDto: UpdateSessionDto,
    currentUser: User,
  ): Promise<IMessageResponse> {
    const isSuperAdmin = currentUser.level === EUserLevels.SUPER_ADMIN;

    if (updateSessionDto.trainer && currentUser.level !== EUserLevels.TRAINER) {
      const trainer = await this.trainersService.getSingle({
        id: updateSessionDto.trainer.id,
        createdByUserId: isSuperAdmin ? undefined : currentUser.id,
      });

      if (!trainer) {
        throw new NotFoundException(
          'Trainer not found or invalid trainer level',
        );
      }
    }

    if (updateSessionDto.clients && updateSessionDto.clients.length > 0) {
      const clientIds = updateSessionDto.clients.map((c) => c.id);

      const clients = await this.clientsService.get(
        {
          __relations: ['user'],
        },
        ClientListDto,
        {
          beforeQuery: (query: SelectQueryBuilder<Client>) => {
            query.andWhere('entity.id IN (:...ids)', { ids: clientIds });
            if (!isSuperAdmin) {
              query
                .leftJoin(
                  'trainer_clients',
                  'trainerClients',
                  'trainerClients.clientId = entity.id',
                )
                .leftJoin('trainerClients.trainer', 'clientTrainer')
                .andWhere(
                  new Brackets((qb2) => {
                    qb2
                      .where('entity.createdByUserId = :uid', {
                        uid: currentUser.id,
                      })
                      .orWhere('clientTrainer.userId = :uid', {
                        uid: currentUser.id,
                      });
                  }),
                )
                .distinct(true);
            }
            return query;
          },
        },
      );

      if (clients.data.length > 0) {
        const existingIds = clients.data.map((c) => c.id);
        const missing = clientIds.filter((id) => !existingIds.includes(id));
        throw new NotFoundException(
          `Clients not found or invalid: ${missing.join(', ')}`,
        );
      }

      updateSessionDto.clients = clients.data.map((c) => ({ id: c.id }));
    }

    await this.update(id, updateSessionDto);

    return { message: 'Session updated successfully' };
  }
}
