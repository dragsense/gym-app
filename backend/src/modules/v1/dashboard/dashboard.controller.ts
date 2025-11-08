import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { EUserLevels } from '@shared/enums';
import { MinUserLevel } from '@/common/decorators/level.decorator';
import { DashboardAnalyticsDto } from '@shared/dtos';
import { AuthUser } from '@/decorators/user.decorator';
import { User } from '@/common/base-user/entities/user.entity';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @MinUserLevel(EUserLevels.TRAINER)
  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics overview' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  async getDashboardStats(
    @AuthUser() currentUser: User,
    @Query() query: DashboardAnalyticsDto,
  ) {
    return this.dashboardService.getDashboardStats(currentUser, query);
  }

  @MinUserLevel(EUserLevels.TRAINER)
  @Get('sessions/analytics')
  @ApiOperation({ summary: 'Get sessions analytics' })
  @ApiResponse({
    status: 200,
    description: 'Sessions analytics retrieved successfully',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['daily', 'weekly', 'monthly'],
    description: 'Time period for session analysis',
  })
  async getSessionsAnalytics(
    @AuthUser() currentUser: User,
    @Query() query: DashboardAnalyticsDto,
  ) {
    return this.dashboardService.getSessionsAnalytics(currentUser, query);
  }

  @MinUserLevel(EUserLevels.TRAINER)
  @Get('billing/analytics')
  @ApiOperation({ summary: 'Get comprehensive billing analytics' })
  @ApiResponse({
    status: 200,
    description: 'Billing analytics retrieved successfully',
  })
  async getBillingAnalytics(
    @AuthUser() currentUser: User,
    @Query() query: DashboardAnalyticsDto,
  ) {
    return this.dashboardService.getBillingAnalytics(currentUser, query);
  }
}
