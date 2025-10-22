import { IMessageResponse } from './api/response.interface';
import { ClientDto } from '../dtos/client-dtos';

export interface IClient extends ClientDto {};

export type TClientResponse = {client: IClient} & IMessageResponse
