import {
  Controller,
  Get,
  UseGuards,
  Body,
  Post,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { TrainersService } from './trainers.service';
import {
  CreateTrainerDto,
  UpdateTrainerDto,
  TrainerListDto,
  TrainerPaginatedDto,
  TrainerSafeDto,
  SingleQueryDto,
} from '@shared/dtos';
import { Trainer } from './entities/trainer.entity';
import { AuthUser } from '@/decorators/user.decorator';

@ApiBearerAuth('access-token')
@ApiTags('Trainers')
@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @ApiOperation({ summary: 'Get all trainers with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of trainers',
    type: TrainerPaginatedDto,
  })
  @Get()
  findAll(@Query() query: TrainerListDto, @AuthUser() user: any) {
    return this.trainersService.get(
      { ...query, createdByUserId: user.id },
      TrainerListDto,
    );
  }

  @ApiOperation({ summary: 'Get trainer by ID' })
  @ApiParam({ name: 'id', description: 'Trainer ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns trainer by ID',
    type: TrainerSafeDto,
  })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: SingleQueryDto<Trainer>,
  ) {
    return this.trainersService.getSingle(id, query);
  }

  @ApiOperation({ summary: 'Add a new trainer' })
  @ApiBody({
    type: CreateTrainerDto,
    description: 'Create a new trainer',
  })
  @ApiResponse({ status: 201, description: 'Trainer created successfully' })
  @Post()
  create(@Body() createTrainerDto: CreateTrainerDto, @AuthUser() user: any) {
    return this.trainersService.createTrainer(createTrainerDto, user.id);
  }

  @ApiOperation({ summary: 'Update trainer by ID' })
  @ApiParam({ name: 'id', description: 'Trainer ID' })
  @ApiBody({
    type: UpdateTrainerDto,
    description: 'Update trainer information',
  })
  @ApiResponse({ status: 200, description: 'Trainer updated successfully' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrainerDto: UpdateTrainerDto,
  ) {
    return this.trainersService.updateTrainer(id, updateTrainerDto);
  }

  @ApiOperation({ summary: 'Delete trainer by ID' })
  @ApiParam({ name: 'id', description: 'Trainer ID' })
  @ApiResponse({ status: 200, description: 'Trainer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Trainer not found' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.trainersService.delete(id);
  }
}
