import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TrainerClientsService } from './trainer-clients.service';
import {
  CreateTrainerClientDto,
  UpdateTrainerClientDto,
  TrainerClientListDto,
} from '@shared/dtos/trainer-client-dtos';
import { SingleQueryDto } from '@shared/dtos';
import { TrainerClient } from './entities/trainer-client.entity';
import { AuthUser } from '@/decorators/user.decorator';
import { User } from '@/common/system-user/entities/user.entity';
import { EUserLevels } from '@shared/enums';
import { Brackets, SelectQueryBuilder } from 'typeorm';

@ApiTags('Trainer-Clients')
@ApiBearerAuth('access-token')
@Controller('trainer-clients')
export class TrainerClientsController {
  constructor(private readonly trainerClientsService: TrainerClientsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all trainer-client assignments with pagination and filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Trainer-client assignments retrieved successfully',
  })
  async findAll(
    @Query() queryDto: TrainerClientListDto,
    @AuthUser() currentUser: User,
  ) {
    const isSuperAdmin = currentUser.level === EUserLevels.SUPER_ADMIN;
    return await this.trainerClientsService.get(
      queryDto,
      TrainerClientListDto,
      {
        beforeQuery: (query: SelectQueryBuilder<TrainerClient>) => {
          if (!isSuperAdmin) {
            query.leftJoin('entity.trainer', '_trainer').andWhere(
              new Brackets((qb2) => {
                qb2
                  .where('entity.createdByUserId = :uid', {
                    uid: currentUser.id,
                  })
                  .orWhere('_trainer.createdByUserId = :uid', {
                    uid: currentUser.id,
                  });
              }),
            );
          }
          return query;
        },
      },
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trainer-client assignment by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Trainer-client assignment retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Trainer-client assignment not found',
  })
  async findOne(
    @Param('id') id: string,
    @Query() queryDto: SingleQueryDto<TrainerClient>,
  ) {
    return await this.trainerClientsService.getSingle(id, queryDto);
  }

  @Get('trainer/:trainerId')
  @ApiOperation({ summary: 'Get all clients for a specific trainer' })
  @ApiParam({ name: 'trainerId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Trainer clients retrieved successfully',
  })
  async getTrainerClients(@Param('trainerId') trainerId: string) {
    return await this.trainerClientsService.get({
      trainerId,
      _relations: ['client', 'client.user', 'client.user.profile'],
      _select: [
        'client.user.email',
        'client.user.profile.firstName',
        'client.user.profile.lastName',
        'client.user.profile.email',
      ],
    });
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Get all trainers for a specific client' })
  @ApiParam({ name: 'clientId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Client trainers retrieved successfully',
  })
  async getClientTrainers(@Param('clientId') clientId: string) {
    return await this.trainerClientsService.get({
      clientId,
      _relations: ['trainer', 'trainer.user', 'trainer.user.profile'],
      _select: [
        'trainer.user.email',
        'trainer.user.profile.firstName',
        'trainer.user.profile.lastName',
        'trainer.user.profile.email',
      ],
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create trainer-client assignment' })
  @ApiResponse({
    status: 201,
    description: 'Trainer-client assignment created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid assignment data' })
  @ApiResponse({ status: 409, description: 'Assignment already exists' })
  async create(@Body() createDto: CreateTrainerClientDto) {
    const assignment =
      await this.trainerClientsService.createTrainerClient(createDto);
    return {
      message: 'Trainer-client assignment created successfully',
      data: assignment,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update trainer-client assignment' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Trainer-client assignment updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Trainer-client assignment not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTrainerClientDto,
  ) {
    const assignment = await this.trainerClientsService.updateTrainerClient(
      id,
      updateDto,
    );
    return {
      message: 'Trainer-client assignment updated successfully',
      data: assignment,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete trainer-client assignment' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Trainer-client assignment deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Trainer-client assignment not found',
  })
  async delete(@Param('id') id: string) {
    await this.trainerClientsService.delete(id);
    return { message: 'Trainer-client assignment deleted successfully' };
  }
}
