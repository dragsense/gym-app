import { Injectable } from '@nestjs/common';
import { SettingsService } from '@/common/settings/settings.service';
import { CreateUserSettingsDto, UpdateUserSettingsDto } from 'shared/dtos/user-settings-dtos';
import { ESettingType } from 'shared/enums/setting.enum';

@Injectable()
export class UserSettingsService {
  constructor(
    private readonly settingsService: SettingsService,
  ) {}

  async getUserSettings(userId: number): Promise<Record<string, any>> {
    return await this.settingsService.getUserSettings(userId);
  }

  async createUserSettings(userId: number, createUserSettingsDto: CreateUserSettingsDto): Promise<void> {
    const settingsToCreate: Record<string, { value: any; type: ESettingType; description?: string }> = {};

    // Currency settings
    if (createUserSettingsDto.currency) {
      Object.entries(createUserSettingsDto.currency).forEach(([key, value]) => {
        settingsToCreate[`currency.${key}`] = {
          value,
          type: ESettingType.STRING,
          description: `Currency setting: ${key}`
        };
      });
    }

    // Limits settings
    if (createUserSettingsDto.limits) {
      Object.entries(createUserSettingsDto.limits).forEach(([key, value]) => {
        settingsToCreate[`limits.${key}`] = {
          value,
          type: ESettingType.NUMBER,
          description: `Limit setting: ${key}`
        };
      });
    }

    // Business settings
    if (createUserSettingsDto.business) {
      Object.entries(createUserSettingsDto.business).forEach(([key, value]) => {
        settingsToCreate[`business.${key}`] = {
          value,
          type: ESettingType.STRING,
          description: `Business setting: ${key}`
        };
      });
    }

    // Billing settings
    if (createUserSettingsDto.billing) {
      Object.entries(createUserSettingsDto.billing).forEach(([key, value]) => {
        settingsToCreate[`billing.${key}`] = {
          value,
          type: ESettingType.NUMBER,
          description: `Billing setting: ${key}`
        };
      });
    }

    // Notification settings
    if (createUserSettingsDto.notifications) {
      Object.entries(createUserSettingsDto.notifications).forEach(([key, value]) => {
        settingsToCreate[`notifications.${key}`] = {
          value,
          type: ESettingType.BOOLEAN,
          description: `Notification setting: ${key}`
        };
      });
    }

    await this.settingsService.setMultipleSettings(userId, settingsToCreate);
  }

  async updateUserSettings(userId: number, updateUserSettingsDto: UpdateUserSettingsDto): Promise<void> {
    const settingsToUpdate: Record<string, { value: any; type: ESettingType; description?: string }> = {};

    // Update only provided fields
    if (updateUserSettingsDto.currency) {
      Object.entries(updateUserSettingsDto.currency).forEach(([key, value]) => {
        settingsToUpdate[`currency.${key}`] = {
          value,
          type: ESettingType.STRING,
          description: `Currency setting: ${key}`
        };
      });
    }

    if (updateUserSettingsDto.limits) {
      Object.entries(updateUserSettingsDto.limits).forEach(([key, value]) => {
        settingsToUpdate[`limits.${key}`] = {
          value,
          type: ESettingType.NUMBER,
          description: `Limit setting: ${key}`
        };
      });
    }

    if (updateUserSettingsDto.business) {
      Object.entries(updateUserSettingsDto.business).forEach(([key, value]) => {
        settingsToUpdate[`business.${key}`] = {
          value,
          type: ESettingType.STRING,
          description: `Business setting: ${key}`
        };
      });
    }

    if (updateUserSettingsDto.billing) {
      Object.entries(updateUserSettingsDto.billing).forEach(([key, value]) => {
        settingsToUpdate[`billing.${key}`] = {
          value,
          type: ESettingType.NUMBER,
          description: `Billing setting: ${key}`
        };
      });
    }

    if (updateUserSettingsDto.notifications) {
      Object.entries(updateUserSettingsDto.notifications).forEach(([key, value]) => {
        settingsToUpdate[`notifications.${key}`] = {
          value,
          type: ESettingType.BOOLEAN,
          description: `Notification setting: ${key}`
        };
      });
    }

    await this.settingsService.setMultipleSettings(userId, settingsToUpdate);
  }

  async deleteUserSettings(userId: number): Promise<void> {
    // Get all user settings and delete them
    const allSettings = await this.settingsService.getUserSettings(userId);
    
    for (const key of Object.keys(allSettings)) {
      await this.settingsService.deleteSetting(userId, key);
    }
  }
}
