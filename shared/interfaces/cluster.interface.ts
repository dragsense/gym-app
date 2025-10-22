export interface IClusterInfo {
  isMaster: boolean;
  isWorker: boolean;
  processId: number;
  workers: Array<{
    id: number;
    pid: number;
    connected: boolean;
  }>;
  totalWorkers: number;
}

export interface ISystemInfo {
  platform: string;
  arch: string;
  nodeVersion: string;
  uptime: number;
  cpu: {
    cores: number;
    model: string;
    speed: number;
    usage: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usage: number;
    unit: string;
  };
  loadAverage: number[];
}

export interface IProcessInfo {
  pid: number;
  ppid: number;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  version: string;
  platform: string;
  arch: string;
}

export interface IDetailedClusterInfo {
  cluster: IClusterInfo;
  system: ISystemInfo;
  process: IProcessInfo;
  timestamp: string;
}

export interface IClusterStatus {
  enabled: boolean;
  isPrimary: boolean;
  isWorker: boolean;
}
