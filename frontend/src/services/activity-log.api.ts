// Utils
import { apiRequest } from "@/utils/fetcher";

// Types
import type { IPaginatedResponse } from "@shared/interfaces/api/response.interface";
import type{ IListQueryParams } from "@shared/interfaces/api/param.interface";


import { generateQueryParams } from "@/utils";
import type { IActivityLog } from "@shared/interfaces";

// Constants
const ACTIVITY_LOGS_API_PATH = "/activity-logs";



export const fetchActivityLogs = (
    params: IListQueryParams
) => {

    const queryParams = new URLSearchParams();
    generateQueryParams(queryParams, params);

    let apiPath = `${ACTIVITY_LOGS_API_PATH}`;
    return apiRequest<IPaginatedResponse<IActivityLog>>(
        `${apiPath}?${queryParams.toString()}`,
        "GET"
    );
};


export const fetchActivityLog = (id: number) =>
    apiRequest<IActivityLog>(`${ACTIVITY_LOGS_API_PATH}/${id}`, "GET");
