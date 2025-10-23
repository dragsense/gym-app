// Utils
import { BaseService } from "./base.service";

// Types
import type { CacheMonitorResponse } from "@shared/types/monitor.types";

// Constants
const CACHE_API_PATH = "/cache";

// Create base service instance
const cacheService = new BaseService<any, any, any>(CACHE_API_PATH);

// Cache monitor operations
export const fetchCacheMonitorUrl = () => cacheService.getSingle<CacheMonitorResponse>(null, undefined, "/monitor-url");