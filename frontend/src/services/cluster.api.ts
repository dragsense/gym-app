// Utils
import { BaseService } from "./base.service";

// Types
import type {
    IClusterInfo,
    ISystemInfo,
    IProcessInfo,
    IDetailedClusterInfo,
    IClusterStatus,
} from "@shared/interfaces/cluster.interface";

// Constants
const CLUSTER_API_PATH = "/cluster";

// Create base service instance
const clusterService = new BaseService(CLUSTER_API_PATH);

// API functions
export const getClusterInfo = () => clusterService.getSingle<IClusterInfo>(undefined, undefined, "/info");

export const getClusterStatus = () => clusterService.getSingle<IClusterStatus>(undefined, undefined, "/status");

export const getSystemInfo = () => clusterService.getSingle<ISystemInfo>(undefined, undefined, "/system");

export const getProcessInfo = () => clusterService.getSingle<IProcessInfo>(undefined, undefined, "/process");

export const getDetailedClusterInfo = () => clusterService.getSingle<IDetailedClusterInfo>(undefined, undefined, "/detailed");
