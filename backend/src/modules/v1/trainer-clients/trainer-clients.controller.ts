import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
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
  async findAll(@Query() queryDto: TrainerClientListDto) {
    return await this.trainerClientsService.get(queryDto, TrainerClientListDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trainer-client assignment by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Trainer-client assignment retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Trainer-client assignment not found',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() queryDto: SingleQueryDto<TrainerClient>,
  ) {
    return await this.trainerClientsService.getSingle(id, queryDto);
  }

  @Get('trainer/:trainerId')
  @ApiOperation({ summary: 'Get all clients for a specific trainer' })
  @ApiParam({ name: 'trainerId', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Trainer clients retrieved successfully',
  })
  async getTrainerClients(@Param('trainerId', ParseIntPipe) trainerId: number) {
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
  @ApiParam({ name: 'clientId', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Client trainers retrieved successfully',
  })
  async getClientTrainers(@Param('clientId', ParseIntPipe) clientId: number) {
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
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Trainer-client assignment updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Trainer-client assignment not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
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
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Trainer-client assignment deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Trainer-client assignment not found',
  })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.trainerClientsService.delete(id);
    return { message: 'Trainer-client assignment deleted successfully' };
  }
}
