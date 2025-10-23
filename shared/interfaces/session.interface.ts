import { SessionDto } from '../dtos';
import { IMessageResponse } from './api/response.interface';

export interface ISession extends SessionDto {}
export interface ISessionResponse extends IMessageResponse {
  session: SessionDto;
}
