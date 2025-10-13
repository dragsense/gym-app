// Utils
import { BaseService } from "./base.service";

// Types
import type {
  HealthStatus,
  HealthSummary,
  DatabaseHealth,
  MemoryHealth,
  DiskHealth,
  NetworkHealth,
  ServiceHealth,
} from "@shared/interfaces/health.interface";

// Constants
const HEALTH_API_PATH = "/health";

// Create base service instance
const healthService = new BaseService(HEALTH_API_PATH);

// API functions
export const getHealthStatus = () => 
  healthService.getSingle<HealthStatus>(undefined, undefined, "");

export const getDetailedHealth = () => 
  healthService.getSingle<HealthStatus>(undefined, undefined, "/detailed");

export const getHealthSummary = () => 
  healthService.getSingle<HealthSummary>(undefined, undefined, "/summary");

export const getDatabaseHealth = () => 
  healthService.getSingle<DatabaseHealth>(undefined, undefined, "/database");

export const getMemoryHealth = () => 
  healthService.getSingle<MemoryHealth>(undefined, undefined, "/memory");

export const getDiskHealth = () => 
  healthService.getSingle<DiskHealth>(undefined, undefined, "/disk");

export const getNetworkHealth = () => 
  healthService.getSingle<NetworkHealth>(undefined, undefined, "/network");

export const getServicesHealth = () => 
  healthService.getSingle<ServiceHealth[]>(undefined, undefined, "/services");
