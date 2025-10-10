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
  ApiHeader,
} from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { 
  ScheduleListDto, 
  CreateScheduleDto, 
  UpdateScheduleDto 
} from 'shared/dtos/schedule-dtos/schedule.dto';
import { JwtAuthGuard } from '@/guards/jwt-auth.gaurd';
import { Timezone } from '@/decorators/timezone.decorator';

@ApiTags('Schedule')
@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all schedules' })
  @ApiResponse({ status: 200, description: 'Schedules retrieved successfully' })
  findAll(@Query() queryDto: ScheduleListDto) {
    return this.scheduleService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get schedule by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create schedule' })
  @ApiHeader({ name: 'X-Timezone', description: 'User timezone (e.g., America/New_York)', required: false })
  async createSchedule(
    @Body() createDto: CreateScheduleDto,
    @Timezone() timezone: string,
  ) {
    // Auto-set timezone if not provided
    if (!createDto.timezone) {
      createDto.timezone = timezone;
    }
    const schedule = await this.scheduleService.createSchedule(createDto);
    return { message: 'Schedule created successfully', data: schedule };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update schedule' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiHeader({ name: 'X-Timezone', description: 'User timezone', required: false })
  async updateSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateScheduleDto,
    @Timezone() timezone: string,
  ) {
    // Auto-set timezone if not provided
    if (!updateData.timezone) {
      updateData.timezone = timezone;
    }
    const schedule = await this.scheduleService.updateSchedule(id, updateData);
    return { message: 'Schedule updated successfully', data: schedule };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete schedule' })
  @ApiParam({ name: 'id', type: 'number' })
  async deleteSchedule(@Param('id', ParseIntPipe) id: number) {
    await this.scheduleService.deleteSchedule(id);
    return { message: 'Schedule deleted successfully' };
  }
}

