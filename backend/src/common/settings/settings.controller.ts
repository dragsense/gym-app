import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/guards/jwt-auth.gaurd';
import { SettingsService } from './settings.service';
import { ESettingType } from 'shared/enums/setting.enum';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user settings' })
  @ApiResponse({ status: 200, description: 'User settings retrieved successfully' })
  async getUserSettings(@Request() req: any) {
    const userId = req.user.id;
    const settings = await this.settingsService.getUserSettings(userId);
    return { settings };
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public user settings' })
  @ApiResponse({ status: 200, description: 'Public user settings retrieved successfully' })
  async getPublicSettings(@Request() req: any) {
    const userId = req.user.id;
    const settings = await this.settingsService.getPublicSettings(userId);
    return { settings };
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get specific user setting' })
  @ApiResponse({ status: 200, description: 'User setting retrieved successfully' })
  async getSetting(@Request() req: any, @Param('key') key: string) {
    const userId = req.user.id;
    const value = await this.settingsService.getSetting(userId, key);
    return { key, value };
  }

  @Post()
  @ApiOperation({ summary: 'Set user setting' })
  @ApiResponse({ status: 201, description: 'User setting created successfully' })
  async setSetting(
    @Request() req: any,
    @Body() body: { key: string; value: any; type?: string; description?: string }
  ) {
    const userId = req.user.id;
    const setting = await this.settingsService.setSetting(
      userId,
      body.key,
      body.value,
      body.type as any,
      body.description
    );
    return { setting };
  }

  @Put('bulk')
  @ApiOperation({ summary: 'Set multiple user settings' })
  @ApiResponse({ status: 200, description: 'User settings updated successfully' })
  async setMultipleSettings(
    @Request() req: any,
    @Body() body: Record<string, { value: any; type?: ESettingType; description?: string }>
  ) {
    const userId = req.user.id;
    const settings = await this.settingsService.setMultipleSettings(userId, body);
    return { settings };
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete user setting' })
  @ApiResponse({ status: 200, description: 'User setting deleted successfully' })
  async deleteSetting(@Request() req: any, @Param('key') key: string) {
    const userId = req.user.id;
    await this.settingsService.deleteSetting(userId, key);
    return { message: 'Setting deleted successfully' };
  }
}
