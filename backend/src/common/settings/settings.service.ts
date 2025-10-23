import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CrudService } from '@/common/crud/crud.service';
import { Setting } from './entities/setting.entity';
import { ESettingType } from '@shared/enums/setting.enum';
import { EventService } from '@/common/helper/services/event.service';

@Injectable()
export class SettingsService extends CrudService<Setting> {
  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>,
    dataSource: DataSource,
    eventService: EventService,
  ) {
    super(settingsRepository, dataSource, eventService);
  }

  async getUserSettings(userId: number): Promise<Record<string, any>> {
    const settings = await this.settingsRepository.find({
      where: { userId },
    });

    const settingsObject: Record<string, any> = {};
    
    for (const setting of settings) {
      settingsObject[setting.key] = this.parseValue(setting.value, setting.type);
    }

    return settingsObject;
  }

  async getSetting(userId: number, key: string): Promise<any> {
    const setting = await this.settingsRepository.findOne({
      where: { userId, key },
    });

    if (!setting) {
      return null;
    }

    return this.parseValue(setting.value, setting.type);
  }

  async setSetting(userId: number, key: string, value: any, type: ESettingType = ESettingType.STRING, description?: string): Promise<Setting> {
    const stringValue = this.stringifyValue(value, type);
    
    const existingSetting = await this.settingsRepository.findOne({
      where: { userId, key },
    });

    if (existingSetting) {
    const updated = await this.update(existingSetting.id, {
      value: stringValue,
      type,
      description,
    });
    return updated;
    }

    return this.create({
      userId,
      key,
      value: stringValue,
      type,
      description,
      isPublic: false,
      isEditable: true,
    });
  }

  async setMultipleSettings(userId: number, settings: Record<string, { value: any; type?: ESettingType; description?: string }>): Promise<Setting[]> {
    const results: Setting[] = [];

    for (const [key, config] of Object.entries(settings)) {
      const setting = await this.setSetting(
        userId,
        key,
        config.value,
        config.type || ESettingType.STRING,
        config.description
      );
      results.push(setting);
    }

    return results;
  }

  async deleteSetting(userId: number, key: string): Promise<void> {
    const setting = await this.getSingle({
      userId,
      key,
    });

    if (setting) await this.delete(setting.id, {});
  }

  async getPublicSettings(userId: number): Promise<Record<string, any>> {
    const settings = await this.getAll({
      userId,
      isPublic: true,
    }, {});

    const settingsObject: Record<string, any> = {};
    
    for (const setting of settings) {
      settingsObject[setting.key] = this.parseValue(setting.value, setting.type);
    }

    return settingsObject;
  }

  private parseValue(value: string, type: ESettingType): any {
    switch (type) {
      case ESettingType.NUMBER:
        return parseFloat(value);
      case ESettingType.BOOLEAN:
        return value === 'true';
      case ESettingType.JSON:
        return JSON.parse(value);
      case ESettingType.ARRAY:
        return JSON.parse(value);
      default:
        return value;
    }
  }

  private stringifyValue(value: any, type: ESettingType): string {
    switch (type) {
      case ESettingType.JSON:
      case ESettingType.ARRAY:
        return JSON.stringify(value);
      default:
        return String(value);
    }
  }
}
