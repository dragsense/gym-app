// Utils
import { BaseService } from "./base.service";

// Types
import type { ICacheResponse } from "@shared/interfaces/cache.interface";

// Constants
const CACHE_API_PATH = "/cache";

// Create base service instance
const cacheService = new BaseService(CACHE_API_PATH);

// API functions
export const getCacheStats = () => 
    cacheService.getSingle<ICacheResponse>(undefined, undefined, "/stats");

export const clearAllCache = () => 
    cacheService.delete(undefined, undefined, "/clear");
