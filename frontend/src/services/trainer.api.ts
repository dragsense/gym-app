// Utils
import { BaseService } from "./base.service";

// Types
import type{ IListQueryParams } from "@shared/interfaces/api/param.interface";
import type { ITrainer } from "@shared/interfaces/trainer.interface";
import type { TTrainerData } from "@shared/types/trainer.type";

// Constants
const TRAINERS_API_PATH = "/trainers";

// Create base service instance
const trainerService = new BaseService<ITrainer, TTrainerData, Partial<TTrainerData>>(TRAINERS_API_PATH);

// Re-export common CRUD operations
export const fetchTrainers = (params: IListQueryParams) => trainerService.get(params);
export const fetchTrainer = (id: number) => trainerService.getSingle(id);
export const createTrainer = (data: TTrainerData) => trainerService.post(data);
export const updateTrainer = (id: number) => trainerService.patch(id);
export const deleteTrainer = (id: number) => trainerService.delete(id);
