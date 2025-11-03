import { Injectable } from '@nestjs/common';
import { SettingsService } from '@/common/settings/settings.service';
import { CreateOrUpdateUserSettingsDto } from '@shared/dtos/settings-dtos';
import { IUserSettings } from '@shared/interfaces/settings.interface';
import { User } from '@/common/base-user/entities/user.entity';
import { EUserLevels } from '@shared/enums/user.enum';

@Injectable()
export class UserSettingsService {
  constructor(private readonly settingsService: SettingsService) {}

  async getUserSettings(userId: string): Promise<IUserSettings> {
    return this.settingsService.getSettings(userId);
  }

  async createOrUpdateUserSettings(
    currentUser: User,
    createUserSettingsDto: CreateOrUpdateUserSettingsDto,
  ): Promise<void> {
    const settings = createUserSettingsDto;

    switch (currentUser.level) {
      case EUserLevels.TRAINER:
        settings.business = undefined;
        settings.limits = undefined;
        break;
      case EUserLevels.CLIENT:
        settings.business = undefined;
        settings.limits = undefined;
        settings.currency = undefined;
        settings.billing = undefined;
        break;
    }

    await this.settingsService.saveSettings(currentUser.id, settings);
  }
}
