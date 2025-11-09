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
import { User } from '@/common/base-user/entities/user.entity';
import { Client } from '../clients/entities/client.entity';
import { UserSettingsService } from '../user-settings/user-settings.service';
import { Between } from 'typeorm';

@Injectable()
export class SessionsService extends CrudService<Session> {
  private readonly customLogger = new LoggerService(SessionsService.name);

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    private readonly trainersService: TrainersService,
    private readonly clientsService: ClientsService,
    private readonly userSettingsService: UserSettingsService,
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

    // Get trainer entity for user ID
    const trainerEntity = await this.trainersService.getSingle({
      id: trainerId,
      _relations: ['user'],
    });
    const trainerUserId = trainerEntity?.user?.id;
    const trainerSettings = trainerUserId
      ? await this.userSettingsService.getUserSettings(trainerUserId)
      : null;

    // Validate session limits
    if (trainerSettings?.limits) {
      const limits = trainerSettings.limits;

      // Check maxClientsPerSession
      if (
        limits.maxClientsPerSession &&
        createSessionDto.clients.length > limits.maxClientsPerSession
      ) {
        throw new BadRequestException(
          `Maximum ${limits.maxClientsPerSession} clients allowed per session. You selected ${createSessionDto.clients.length} clients.`,
        );
      }

      // Check maxSessionsPerDay
      if (limits.maxSessionsPerDay) {
        const sessionDate = new Date(createSessionDto.startDateTime);
        const startOfDay = new Date(
          sessionDate.getFullYear(),
          sessionDate.getMonth(),
          sessionDate.getDate(),
        );
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const sessionsToday = await this.sessionRepo.count({
          where: {
            trainer: { id: trainerId },
            startDateTime: Between(startOfDay, endOfDay),
          },
        });

        if (sessionsToday >= limits.maxSessionsPerDay) {
          throw new BadRequestException(
            `Maximum ${limits.maxSessionsPerDay} sessions allowed per day. You already have ${sessionsToday} sessions scheduled for this day.`,
          );
        }
      }

      // Check maxClientsPerTrainer
      if (limits.maxClientsPerTrainer) {
        const trainerClientsCount = await this.clientsService.get(
          {},
          ClientListDto,
          {
            beforeQuery: (query: SelectQueryBuilder<Client>) => {
              query
                .leftJoin(
                  'trainer_clients',
                  'trainerClients',
                  'trainerClients.clientId = entity.id',
                )
                .where('trainerClients.trainerId = :trainerId', {
                  trainerId,
                })
                .distinct(true);
              return query;
            },
          },
        );

        if (trainerClientsCount.data.length >= limits.maxClientsPerTrainer) {
          // Check if any new clients are being added
          const existingClientIds = trainerClientsCount.data.map((c) => c.id);
          const newClients = createSessionDto.clients.filter(
            (c) => !existingClientIds.includes(c.id),
          );

          if (newClients.length > 0) {
            throw new BadRequestException(
              `Maximum ${limits.maxClientsPerTrainer} clients allowed per trainer. You currently have ${trainerClientsCount.data.length} clients.`,
            );
          }
        }
      }

      // Use sessionDurationDefault if duration not provided
      if (!createSessionDto.duration && limits.sessionDurationDefault) {
        createSessionDto.duration = limits.sessionDurationDefault;
      }
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

    // Get existing session to determine trainer
    const existingSession = await this.getSingle(id, {
      _relations: ['trainer'],
    });

    if (!existingSession) {
      throw new NotFoundException('Session not found');
    }

    let trainerId = existingSession.trainer?.id;

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

      trainerId = trainer.id;
    }

    // Get trainer user settings for limits validation
    if (trainerId) {
      const trainerEntity = await this.trainersService.getSingle({
        id: trainerId,
        _relations: ['user'],
      });
      const trainerUserId = trainerEntity?.user?.id;
      const trainerSettings = trainerUserId
        ? await this.userSettingsService.getUserSettings(trainerUserId)
        : null;

      // Validate session limits if clients are being updated
      if (trainerSettings?.limits && updateSessionDto.clients) {
        const limits = trainerSettings.limits;

        // Check maxClientsPerSession
        if (
          limits.maxClientsPerSession &&
          updateSessionDto.clients.length > limits.maxClientsPerSession
        ) {
          throw new BadRequestException(
            `Maximum ${limits.maxClientsPerSession} clients allowed per session. You selected ${updateSessionDto.clients.length} clients.`,
          );
        }

        // Check maxSessionsPerDay if startDateTime is being updated
        if (limits.maxSessionsPerDay && updateSessionDto.startDateTime) {
          const sessionDate = new Date(updateSessionDto.startDateTime);
          const startOfDay = new Date(
            sessionDate.getFullYear(),
            sessionDate.getMonth(),
            sessionDate.getDate(),
          );
          const endOfDay = new Date(startOfDay);
          endOfDay.setDate(endOfDay.getDate() + 1);

          const sessionsToday = await this.sessionRepo.count({
            where: {
              trainer: { id: trainerId },
              startDateTime: Between(startOfDay, endOfDay),
            },
          });

          // Don't count the current session being updated
          if (sessionsToday > limits.maxSessionsPerDay) {
            throw new BadRequestException(
              `Maximum ${limits.maxSessionsPerDay} sessions allowed per day. You already have ${sessionsToday} sessions scheduled for this day.`,
            );
          }
        }
      }

      // Use sessionDurationDefault if duration not provided
      if (!updateSessionDto.duration && trainerSettings?.limits?.sessionDurationDefault) {
        updateSessionDto.duration = trainerSettings.limits.sessionDurationDefault;
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
