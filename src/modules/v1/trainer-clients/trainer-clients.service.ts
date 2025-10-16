import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TrainerClient } from './entities/trainer-client.entity';
import { CreateTrainerClientDto, UpdateTrainerClientDto, TrainerClientListDto } from 'shared/dtos/trainer-client-dtos';
import { IPaginatedResponse } from 'shared/interfaces';
import { CrudService } from '@/common/crud/crud.service';
import { EventService } from '@/common/events/event.service';
import { UsersService } from '@/modules/v1/users/users.service';

@Injectable()
export class TrainerClientsService extends CrudService<TrainerClient> {
    constructor(
        @InjectRepository(TrainerClient)
        private readonly trainerClientRepo: Repository<TrainerClient>,
        private readonly usersService: UsersService,
        dataSource: DataSource,
        eventService: EventService,
    ) {
        super(trainerClientRepo, dataSource, eventService);
    }

    async createTrainerClient(createDto: CreateTrainerClientDto): Promise<TrainerClient> {

        // Check if trainer exists and is actually a trainer
        const trainer = await this.usersService.getSingle({ id: createDto.trainer.id });
        if (!trainer || trainer.level !== 1) { // 1 = TRAINER level
            throw new NotFoundException('Trainer not found or invalid trainer level');
        }

        // Check if client exists and is actually a client
        const client = await this.usersService.getSingle({ id: createDto.client.id });
        if (!client || client.level !== 2) { // 2 = CLIENT level
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
            const trainer = await this.usersService.getSingle({ id: updateDto.trainer.id });
            if (!trainer || trainer.level !== 1) { // 1 = TRAINER level
                throw new NotFoundException('Trainer not found or invalid trainer level');
            }
        }

        if (updateDto.client && updateDto.client.id) {
            // Check if client exists and is actually a client
            const client = await this.usersService.getSingle({ id: updateDto.client.id });
            if (!client || client.level !== 2) { // 2 = CLIENT level
                throw new NotFoundException('Client not found or invalid client level');
            }
        }

        return await this.update(id, updateDto);
    }

}
