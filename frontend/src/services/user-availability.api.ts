// Utils
import { BaseService } from "./base.service";

// Types
import type { IListQueryParams } from "@shared/interfaces/api/param.interface";
import type { IUserAvailability } from "@shared/interfaces/user-availability.interface";
import type { TUserAvailabilityData } from "@shared/types";

// Constants
const USER_AVAILABILITY_API_PATH = "/user-availability";

// Create base service instance
const userAvailabilityService = new BaseService<IUserAvailability, TUserAvailabilityData, Partial<TUserAvailabilityData>>(USER_AVAILABILITY_API_PATH);

// Re-export common CRUD operations
export const fetchUserAvailabilities = (params: IListQueryParams) => userAvailabilityService.get(params);
export const fetchUserAvailability = (id: number, params: IListQueryParams) => userAvailabilityService.getSingle(id, params);
export const createUserAvailability = (data: TUserAvailabilityData) => userAvailabilityService.post(data);
export const updateUserAvailability = (id: number) => userAvailabilityService.patch(id);
export const deleteUserAvailability = (id: number) => userAvailabilityService.delete(id);
