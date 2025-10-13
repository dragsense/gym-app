export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: DatabaseHealth;
    memory: MemoryHealth;
    disk: DiskHealth;
    network: NetworkHealth;
    services: ServiceHealth[];
  };
}

export interface DatabaseHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  connections: ConnectionHealth[];
  mode: string;
  responseTime: number;
  lastChecked: Date;
}

export interface ConnectionHealth {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  responseTime: number;
  lastChecked: Date;
  error?: string;
}

export interface MemoryHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  used: number;
  total: number;
  percentage: number;
  free: number;
}

export interface DiskHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  used: number;
  total: number;
  percentage: number;
  free: number;
}

export interface NetworkHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency: number;
  throughput: number;
  connections: number;
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  lastChecked: Date;
  error?: string;
}

export interface HealthSummary {
  status: string;
  uptime: string;
  checks: number;
  healthy: number;
  degraded: number;
  unhealthy: number;
}

export interface HealthDashboard {
  overall: HealthStatus;
  summary: HealthSummary;
  trends: HealthTrend[];
  alerts: HealthAlert[];
}

export interface HealthTrend {
  timestamp: Date;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface HealthAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
  service?: string;
}
