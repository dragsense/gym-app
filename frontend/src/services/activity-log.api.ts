// Utils
import { BaseService } from "./base.service";

// Types
import type { IListQueryParams } from "@shared/interfaces/api/param.interface";
import type { IActivityLog } from "@shared/interfaces";

// Constants
const ACTIVITY_LOGS_API_PATH = "/activity-logs";

// Create base service instance
const activityLogService = new BaseService<IActivityLog, never, never>(ACTIVITY_LOGS_API_PATH);

// Re-export read-only operations (activity logs are typically not created/updated via API)
export const fetchActivityLogs = (params: IListQueryParams) => activityLogService.get(params);
export const fetchActivityLog = (id: number) => activityLogService.getSingle(id);