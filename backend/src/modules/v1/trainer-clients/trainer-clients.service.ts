import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TrainerClient } from './entities/trainer-client.entity';
import { CreateTrainerClientDto, UpdateTrainerClientDto, TrainerClientListDto } from 'shared/dtos/trainer-client-dtos';
import { IPaginatedResponse } from 'shared/interfaces';
import { CrudService } from '@/common/crud/crud.service';
import { EventService } from '@/common/helper/services/event.service';
import { UsersService } from '@/modules/v1/users/users.service';
import { CrudOptions } from '@/common/crud/interfaces/crud.interface';
import { EUserLevels, EUserRole } from 'shared';
import { TrainersService } from '../trainers/trainers.service';
import { ClientsService } from '../clients/clients.service';

@Injectable()
export class TrainerClientsService extends CrudService<TrainerClient> {
    constructor(
        @InjectRepository(TrainerClient)
        private readonly trainerClientRepo: Repository<TrainerClient>,
        private readonly trainersService: TrainersService,
        private readonly clientsService: ClientsService,
        dataSource: DataSource,
        eventService: EventService,
    ) {
        const crudOptions: CrudOptions = {
            restrictedFields: ['trainer.user.password', 'client.user.password'],
            searchableFields: ['trainer.user.email',  'client.user.email'],
        };
        super(trainerClientRepo, dataSource, eventService, crudOptions);
    }

    async createTrainerClient(createDto: CreateTrainerClientDto): Promise<TrainerClient> {

        // Check if trainer exists and is actually a trainer
        const trainer = await this.trainersService.getSingle(createDto.trainer.id, { _relations: ['user'] });
        
        if (!trainer || trainer.user?.level !==  EUserLevels[EUserRole.TRAINER]) { // 1 = TRAINER level
            throw new NotFoundException('Trainer not found or invalid trainer level');
        }

        // Check if client exists and is actually a client
        const client = await this.clientsService.getSingle(createDto.client.id, { _relations: ['user'] });
        if (!client || client.user?.level !==  EUserLevels[EUserRole.CLIENT]) { // 2 = CLIENT level
            throw new NotFoundException('Client not found or invalid client level');
        }

        // Check if assignment already exists
        const existingAssignment = await this.trainerClientRepo.findOne({
            where: {
                trainer: {id: trainer.id},
                client: {id: client.id},
            },
        });

        if (existingAssignment) {
            throw new ConflictException('Trainer-client assignment already exists');
        }

        return await this.create(createDto);
    }

    async updateTrainerClient(id: number, updateDto: UpdateTrainerClientDto): Promise<TrainerClient> {


        if (updateDto.trainer && updateDto.trainer.id) {
            // Check if trainer exists and is actually a trainer
                const trainer = await this.trainersService.getSingle(updateDto.trainer.id, { _relations: ['user'] });
            if (!trainer || trainer.user?.level !==  EUserLevels[EUserRole.TRAINER]) { // 1 = TRAINER level
                throw new NotFoundException('Trainer not found or invalid trainer level');
            }
        }

        if (updateDto.client && updateDto.client.id) {
            // Check if client exists and is actually a client
                const client = await this.clientsService.getSingle(updateDto.client.id, { _relations: ['user'] });
            if (!client || client.user?.level !==  EUserLevels[EUserRole.CLIENT]) { // 2 = CLIENT level
                throw new NotFoundException('Client not found or invalid client level');
            }
        }

        return await this.update(id, updateDto);
    }

}
