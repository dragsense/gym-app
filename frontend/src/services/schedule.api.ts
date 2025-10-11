// Utils
import { BaseService } from "./base.service";

// Types
import type { IListQueryParams } from "@shared/interfaces/api/param.interface";
import type { ISchedule } from "@shared/interfaces/schedule.interface";
import { CreateScheduleDto, UpdateScheduleDto } from "@shared/dtos";

// Constants
const SCHEDULES_API_PATH = "/schedules";

// Create base service instance
const scheduleService = new BaseService<ISchedule, CreateScheduleDto, UpdateScheduleDto>(SCHEDULES_API_PATH);

// Re-export all CRUD operations using the base service
export const fetchSchedules = (params: IListQueryParams) => scheduleService.get(params);
export const fetchSchedule = (id: number) => scheduleService.getSingle(id);
export const createSchedule = (data: CreateScheduleDto) => scheduleService.post(data);
export const updateSchedule = (id: number) => scheduleService.put(id);
export const deleteSchedule = (id: number) => scheduleService.delete(id);