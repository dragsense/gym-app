import { UserSettingsDto } from '../dtos';
import { IMessageResponse } from './api/response.interface';

export interface IUserSettings extends UserSettingsDto {}
export interface IUserSettingsResponse extends IMessageResponse {
  userSettings: UserSettingsDto;
}
