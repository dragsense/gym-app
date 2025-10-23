import { IMessageResponse } from './api/response.interface';
import { TrainerDto } from '../dtos/trainer-dtos';

export interface ITrainer extends TrainerDto {};

export type TTrainerResponse = {trainer: ITrainer} & IMessageResponse
