import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/guards/jwt-auth.gaurd';
import { RewardsService } from './rewards.service';

@ApiTags('Rewards')
@Controller('rewards')
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) { }

  @Get('points')
  @ApiOperation({ summary: 'Get user reward points' })
  @ApiResponse({ status: 200, description: 'User reward points retrieved successfully' })
  async getUserRewardPoints(@Request() req: any) {
    const userId = req.user.id;
    const points = await this.rewardsService.getUserRewardPoints(userId);
    return { points };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get user reward history' })
  @ApiResponse({ status: 200, description: 'User reward history retrieved successfully' })
  async getUserRewards(@Request() req: any) {
    const userId = req.user.id;
    return this.rewardsService.get({ userId },
      { _relations: ['referralLink'], _sortFields: ['createdAt:DESC'] });

  }
}
