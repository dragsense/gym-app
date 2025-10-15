// Utils
import { BaseService } from "./base.service";

// Types
import type{ IListQueryParams } from "@shared/interfaces/api/param.interface";
import type { ITrainerClient } from "@shared/interfaces/trainer-client.interface";
import type { TTrainerClientData } from "@shared/types/trainer-client.type";

// Constants
const TRAINER_CLIENTS_API_PATH = "/trainer-clients";

// Create base service instance
const trainerClientService = new BaseService<ITrainerClient, TTrainerClientData, Partial<TTrainerClientData>>(TRAINER_CLIENTS_API_PATH);

// Re-export common CRUD operations
export const fetchTrainerClients = (params: IListQueryParams) => trainerClientService.get(params);
export const fetchTrainerClient = (id: number) => trainerClientService.getSingle(id);
export const createTrainerClient = (data: TTrainerClientData) => trainerClientService.post(data);
export const updateTrainerClient = (id: number) => trainerClientService.patch(id);
export const deleteTrainerClient = (id: number) => trainerClientService.delete(id);
