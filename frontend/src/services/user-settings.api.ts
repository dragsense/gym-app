// Utils
import { BaseService } from "./base.service";

// Types
import type{ IListQueryParams } from "@shared/interfaces/api/param.interface";
import type { IUserSettings } from "@shared/interfaces/user-settings.interface";
import type { TUserSettingsData, TUpdateUserSettingsData, TUserSettingsListData } from "@shared/types/user-settings.type";

// Constants
const USER_SETTINGS_API_PATH = "/user-settings";

// Create base service instance
const userSettingsService = new BaseService<IUserSettings, TUserSettingsData, Partial<TUserSettingsData>>(USER_SETTINGS_API_PATH);

// Re-export common CRUD operations
export const fetchUserSettings = (params: IListQueryParams) => userSettingsService.get(params);
export const fetchUserSetting = (id: number, params: IListQueryParams) => userSettingsService.getSingle(id, params);
export const createUserSetting = (data: TUserSettingsData) => userSettingsService.post(data);
export const updateUserSetting = (id: number) => userSettingsService.patch(id);
export const deleteUserSetting = (id: number) => userSettingsService.delete(id);

// Custom endpoints
export const fetchMySettings = () => userSettingsService.getSingle('my-settings');
export const createOrUpdateMySettings = (data: TUserSettingsData) => userSettingsService.post('create-or-update', data);
export const updateMySettings = (data: TUpdateUserSettingsData) => userSettingsService.patch('my-settings', data);
export const deleteMySettings = () => userSettingsService.delete('my-settings');
