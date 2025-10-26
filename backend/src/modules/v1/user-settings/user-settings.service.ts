import { Injectable } from '@nestjs/common';
import { SettingsService } from '@/common/settings/settings.service';
import { CreateOrUpdateUserSettingsDto } from '@shared/dtos/settings-dtos';
import { IUserSettings } from '@shared/interfaces/settings.interface';

@Injectable()
export class UserSettingsService {
  constructor(private readonly settingsService: SettingsService) {}

  async getUserSettings(userId: string): Promise<IUserSettings> {
    return this.settingsService.getSettings(userId);
  }

  async createOrUpdateUserSettings(
    userId: string,
    createUserSettingsDto: CreateOrUpdateUserSettingsDto,
  ): Promise<void> {
    // Save settings - automatically detects types and creates appropriate settings
    await this.settingsService.saveSettings(
      userId,
      createUserSettingsDto as Record<string, unknown>,
    );
  }
}
