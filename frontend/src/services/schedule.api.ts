// Utils
import { apiRequest } from "@/utils/fetcher";

// Types
import type { IMessageResponse, IPaginatedResponse } from "@shared/interfaces/api/response.interface";
import type { IListQueryParams } from "@shared/interfaces/api/param.interface";
import type { ISchedule } from "@shared/interfaces/schedule.interface";
import { CreateScheduleDto, UpdateScheduleDto } from "@shared/dtos";
import { generateQueryParams } from "@/utils";

// Constants
const SCHEDULES_API_PATH = "/schedules";

export const fetchSchedules = (params: IListQueryParams) => {
    const queryParams = new URLSearchParams();
    generateQueryParams(queryParams, params);

    return apiRequest<IPaginatedResponse<ISchedule>>(
        `${SCHEDULES_API_PATH}?${queryParams.toString()}`,
        "GET"
    );
};

export const fetchSchedule = (id: number) =>
    apiRequest<ISchedule>(`${SCHEDULES_API_PATH}/${id}`, "GET");

export const createSchedule = (data: CreateScheduleDto) =>
    apiRequest<IMessageResponse>(
        `${SCHEDULES_API_PATH}`,
        "POST",
        data
    );

export const updateSchedule = (id: number) => (data: UpdateScheduleDto) =>
    apiRequest<IMessageResponse>(
        `${SCHEDULES_API_PATH}/${id}`,
        "PATCH",
        data
    );

export const deleteSchedule = (id: number) =>
    apiRequest<void>(`${SCHEDULES_API_PATH}/${id}`, "DELETE");

