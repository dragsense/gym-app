import {
  Controller,
  Get,
  UseGuards,
  Body,
  Post,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';

import { UserAvailabilityService } from './user-availability.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.gaurd';
import {
  CreateUserAvailabilityDto,
  UserAvailabilityDto,
} from '@shared/dtos/user-availability-dtos';
import { UserAvailability } from './entities/user-availability.entity';
import { AuthUser } from '@/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('User Availability')
@Controller('user-availability')
export class UserAvailabilityController {
  constructor(private readonly userAvailabilityService: UserAvailabilityService) { }


  @ApiOperation({ summary: 'Get current user availability' })
  @ApiResponse({
    status: 200,
    description: 'Returns current user availability',
    type: UserAvailabilityDto,
  })
  @ApiResponse({ status: 404, description: 'User availability not found' })
  @Get('my-availability')
  getMyAvailability(@AuthUser() user: any): Promise<UserAvailability> {
    return this.userAvailabilityService.getSingle({
      userId: user.id,
    });
  }

  @ApiOperation({ summary: 'Create or update user availability' })
  @ApiBody({
    type: CreateUserAvailabilityDto,
    description: 'Create or update user availability',
  })
  @ApiResponse({ status: 200, description: 'User availability created or updated successfully' })
  @Post('my-availability')
  createOrUpdate(@Body() createUserAvailabilityDto: CreateUserAvailabilityDto, @AuthUser() user: any): Promise<UserAvailability> {
    return this.userAvailabilityService.createOrUpdateUserAvailability(createUserAvailabilityDto, user.id);
  }
}
