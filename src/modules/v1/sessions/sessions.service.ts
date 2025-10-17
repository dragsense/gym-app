import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { Session } from './entities/session.entity';
import { CreateSessionDto, UpdateSessionDto, SessionListDto } from 'shared/dtos';
import { IMessageResponse } from 'shared/interfaces';
import { LoggerService } from '@/common/logger/logger.service';
import { CrudService } from '@/common/crud/crud.service';
import { EventService } from '@/common/events/event.service';
import { CrudOptions } from '@/common/crud/interfaces/crud.interface';
import { TrainersService } from '../trainers/trainers.service';
import { ClientsService } from '../clients/clients.service';
import { EUserLevels, EUserRole } from 'shared';

@Injectable()
export class SessionsService extends CrudService<Session> {
  private readonly customLogger = new LoggerService(SessionsService.name);

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    private readonly trainersService: TrainersService,
    private readonly clientsService: ClientsService,
    dataSource: DataSource,
    eventService: EventService,
  ) {
    const crudOptions: CrudOptions = {
      restrictedFields: ['trainer.user.password', 'clients.user.password'],
      searchableFields: ['title', 'description', 'location', 'notes'],
    };
    super(sessionRepo, dataSource, eventService, crudOptions);
  }

  async createSession(createSessionDto: CreateSessionDto): Promise<IMessageResponse & { session: Session }> {
    // Check if trainer exists and is actually a trainer
    const trainer = await this.trainersService.getSingle(createSessionDto.trainer.id, { _relations: ['user'] });
    
    if (!trainer || trainer.user?.level !== EUserLevels[EUserRole.TRAINER]) {
      throw new NotFoundException('Trainer not found or invalid trainer level');
    }

    // Check if all clients exist and are actually clients
    for (const clientDto of createSessionDto.clients) {
      const client = await this.clientsService.getSingle(clientDto.id, { _relations: ['user'] });
      if (!client || client.user?.level !== EUserLevels[EUserRole.CLIENT]) {
        throw new NotFoundException(`Client with ID ${clientDto.id} not found or invalid client level`);
      }
    }

    // Use CRUD service create method
    const session = await this.create(createSessionDto);

    return { message: 'Session created successfully.', session };
  }

  async updateSession(id: number, updateSessionDto: UpdateSessionDto): Promise<IMessageResponse> {
    if (updateSessionDto.trainer && updateSessionDto.trainer.id) {
      // Check if trainer exists and is actually a trainer
      const trainer = await this.trainersService.getSingle(updateSessionDto.trainer.id, { _relations: ['user'] });
      if (!trainer || trainer.user?.level !== EUserLevels[EUserRole.TRAINER]) {
        throw new NotFoundException('Trainer not found or invalid trainer level');
      }
    }

    if (updateSessionDto.clients && updateSessionDto.clients.length > 0) {
      // Check if all clients exist and are actually clients
      for (const clientDto of updateSessionDto.clients) {
        const client = await this.clientsService.getSingle(clientDto.id, { _relations: ['user'] });
        if (!client || client.user?.level !== EUserLevels[EUserRole.CLIENT]) {
          throw new NotFoundException(`Client with ID ${clientDto.id} not found or invalid client level`);
        }
      }
    }

    // Update session data
    await this.update(id, updateSessionDto);

    return {
      message: 'Session updated successfully',
    };
  }
}
