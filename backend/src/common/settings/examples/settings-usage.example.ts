/**
 * Example usage of the flexible settings system
 * This shows how users can store any kind of setting
 */

import { SettingsService } from '../settings.service';
import { ESettingType } from 'shared/enums/setting.enum';

export class SettingsUsageExample {
  constructor(private readonly settingsService: SettingsService) {}

  async exampleUsage(userId: number) {
    // 1. Set simple string settings
    await this.settingsService.setSetting(userId, 'theme', 'dark', ESettingType.STRING, 'User theme preference');
    await this.settingsService.setSetting(userId, 'language', 'en', ESettingType.STRING, 'User language');

    // 2. Set number settings
    await this.settingsService.setSetting(userId, 'maxSessions', 10, ESettingType.NUMBER, 'Maximum sessions per day');
    await this.settingsService.setSetting(userId, 'sessionDuration', 60, ESettingType.NUMBER, 'Default session duration in minutes');

    // 3. Set boolean settings
    await this.settingsService.setSetting(userId, 'emailNotifications', true, ESettingType.BOOLEAN, 'Enable email notifications');
    await this.settingsService.setSetting(userId, 'darkMode', false, ESettingType.BOOLEAN, 'Enable dark mode');

    // 4. Set JSON/object settings
    const userPreferences = {
      dashboard: {
        showStats: true,
        showCalendar: true,
        layout: 'grid'
      },
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    };
    await this.settingsService.setSetting(userId, 'preferences', userPreferences, ESettingType.JSON, 'User preferences object');

    // 5. Set array settings
    const favoriteColors = ['blue', 'green', 'red'];
    await this.settingsService.setSetting(userId, 'favoriteColors', favoriteColors, ESettingType.ARRAY, 'User favorite colors');

    // 6. Set multiple settings at once
    await this.settingsService.setMultipleSettings(userId, {
      'timezone': { value: 'America/New_York', type: ESettingType.STRING, description: 'User timezone' },
      'currency': { value: 'USD', type: ESettingType.STRING, description: 'User currency' },
      'autoSave': { value: true, type: ESettingType.BOOLEAN, description: 'Auto-save documents' },
      'backupFrequency': { value: 24, type: ESettingType.NUMBER, description: 'Backup frequency in hours' }
    });

    // 7. Get all user settings
    const allSettings = await this.settingsService.getUserSettings(userId);
    console.log('All settings:', allSettings);
    // Output: { theme: 'dark', language: 'en', maxSessions: 10, ... }

    // 8. Get specific setting
    const theme = await this.settingsService.getSetting(userId, 'theme');
    console.log('User theme:', theme); // 'dark'

    // 9. Get public settings (for sharing with other users)
    const publicSettings = await this.settingsService.getPublicSettings(userId);
    console.log('Public settings:', publicSettings);

    // 10. Delete a setting
    await this.settingsService.deleteSetting(userId, 'favoriteColors');
  }
}

/**
 * Frontend usage examples:
 * 
 * // Get all settings
 * const response = await fetch('/api/settings');
 * const { settings } = await response.json();
 * 
 * // Set a setting
 * await fetch('/api/settings', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     key: 'theme',
 *     value: 'dark',
 *     type: 'STRING',
 *     description: 'User theme preference'
 *   })
 * });
 * 
 * // Set multiple settings
 * await fetch('/api/settings/bulk', {
 *   method: 'PUT',
 *   body: JSON.stringify({
 *     theme: { value: 'dark', type: 'STRING' },
 *     language: { value: 'en', type: 'STRING' },
 *     notifications: { value: true, type: 'BOOLEAN' }
 *   })
 * });
 * 
 * // Delete a setting
 * await fetch('/api/settings/theme', { method: 'DELETE' });
 */
