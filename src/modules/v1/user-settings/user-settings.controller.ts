import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/guards/jwt-auth.gaurd';
import { UserSettingsService } from './user-settings.service';
import { CreateUserSettingsDto, UpdateUserSettingsDto } from 'shared/dtos/user-settings-dtos';

@ApiTags('User Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update user settings' })
  @ApiResponse({ status: 201, description: 'User settings created/updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createOrUpdate(@Request() req: any, @Body() createUserSettingsDto: CreateUserSettingsDto): Promise<{ message: string }> {
    await this.userSettingsService.createUserSettings(req.user.id, createUserSettingsDto);
    return { message: 'User settings created/updated successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'Get user settings' })
  @ApiResponse({ status: 200, description: 'User settings retrieved successfully' })
  async findOne(@Request() req: any): Promise<{ settings: Record<string, any> }> {
    const settings = await this.userSettingsService.getUserSettings(req.user.id);
    return { settings };
  }

  @Patch()
  @ApiOperation({ summary: 'Update user settings' })
  @ApiResponse({ status: 200, description: 'User settings updated successfully' })
  async update(@Request() req: any, @Body() updateUserSettingsDto: UpdateUserSettingsDto): Promise<{ message: string }> {
    await this.userSettingsService.updateUserSettings(req.user.id, updateUserSettingsDto);
    return { message: 'User settings updated successfully' };
  }

  @Delete()
  @ApiOperation({ summary: 'Delete user settings' })
  @ApiResponse({ status: 200, description: 'User settings deleted successfully' })
  async remove(@Request() req: any): Promise<{ message: string }> {
    await this.userSettingsService.deleteUserSettings(req.user.id);
    return { message: 'User settings deleted successfully' };
  }
}