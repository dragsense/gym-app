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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserSettingsService } from './user-settings.service';
import { CreateOrUpdateUserSettingsDto } from '@shared/dtos/settings-dtos';
import { IUserSettings } from '@shared/interfaces/settings.interface';

@ApiTags('User Settings')
@ApiBearerAuth('access-token')
@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update user settings' })
  @ApiResponse({
    status: 201,
    description: 'User settings created/updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createOrUpdate(
    @Request() req: any,
    @Body() createUserSettingsDto: CreateOrUpdateUserSettingsDto,
  ): Promise<{ message: string }> {
    await this.userSettingsService.createOrUpdateUserSettings(
      req.user.id,
      createUserSettingsDto,
    );

    return { message: 'User settings created/updated successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'Get user settings' })
  @ApiResponse({
    status: 200,
    description: 'User settings retrieved successfully',
  })
  async findOne(@Request() req: any): Promise<IUserSettings> {
    return this.userSettingsService.getUserSettings(req.user.id);
  }
}
