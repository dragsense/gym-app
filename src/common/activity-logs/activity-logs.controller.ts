import { Controller, Get, Post, Body, Query, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/guards/jwt-auth.gaurd';
import { ActivityLogsService } from './activity-logs.service';
import {
  ActivityLogListDto,
  ActivityLogDto,
  ActivityLogPaginatedDto,
} from 'shared/dtos/activity-log-dtos';



@ApiTags('Activity Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) { }



  @Get()
  @ApiOperation({ summary: 'Get all activity logs with pagination and filtering' })
  @ApiQuery({ type: ActivityLogListDto })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of activity logs',
    type: ActivityLogPaginatedDto,
  })
  async findAll(@Query() queryDto: ActivityLogListDto) {
    return await this.activityLogsService.findAll(queryDto);
  }


  @Get('user/:userId')
  @ApiOperation({ summary: 'Get activity logs for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ type: ActivityLogListDto })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of user activity logs',
    type: ActivityLogPaginatedDto,
  })
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,

  ) {
    return await this.activityLogsService.findOne({ userId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity log by ID' })
  @ApiParam({ name: 'id', description: 'Activity log ID' })
  @ApiResponse({
    status: 200,
    description: 'Activity log retrieved successfully',
    type: ActivityLogDto
  })
  @ApiResponse({ status: 404, description: 'Activity log not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.activityLogsService.findOne({ id });
  }
}
