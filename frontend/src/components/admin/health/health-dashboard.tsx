import { Button } from '@/components/ui/button';
import { AppCard } from '@/components/layout-ui/app-card';
import { 
  Activity, 
  Database, 
  HardDrive, 
  Wifi, 
  Server, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw
} from 'lucide-react';
import type { HealthStatus } from '@shared/interfaces/health.interface';
import { useId, useMemo, useDeferredValue, useTransition } from 'react';

interface HealthDashboardProps {
  data: HealthStatus | null | undefined;
  loading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

export const HealthDashboard = ({
  data: healthData,
  loading,
  error,
  onRefresh,
}: HealthDashboardProps) => {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();
  
  // React 19: Deferred data for better performance
  const deferredHealthData = useDeferredValue(healthData);
  
  // React 19: Memoized loading state
  const memoizedLoadingState = useMemo(() => (
    <div className="flex items-center justify-center h-64">
      <Activity className="h-8 w-8 animate-spin" />
      <span className="ml-2">Loading health data...</span>
    </div>
  ), []);

  // React 19: Memoized error state
  const memoizedErrorState = useMemo(() => (
    <div className="text-center py-8">
      <p className="text-red-500 mb-4">Failed to fetch health data</p>
      <Button onClick={onRefresh} variant="outline">
        Try Again
      </Button>
    </div>
  ), [onRefresh]);

  // React 19: Smooth refresh
  const handleRefresh = () => {
    startTransition(() => {
      onRefresh();
    });
  };

  if (loading && !deferredHealthData) {
    return memoizedLoadingState;
  }

  if (error) {
    return memoizedErrorState;
  }

  if (!deferredHealthData) return null;

  const { status, checks, uptime, version, environment } = deferredHealthData;
  const { database, memory, disk, network, services } = checks;

  // Status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'unhealthy':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6" data-component-id={componentId}>
      {/* Overall Status */}
      <AppCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(status)}
            <div>
              <h3 className="text-lg font-semibold">System Health</h3>
              <p className={`text-sm font-medium ${getStatusColor(status)}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Uptime: {Math.floor(uptime / 1000 / 60 / 60)}h</p>
            <p className="text-sm text-gray-600">v{version} ({environment})</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </AppCard>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Database Health */}
        <AppCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              <span className="font-medium">Database</span>
            </div>
            {getStatusIcon(database.status)}
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-600">Mode:</span>
              <span className="ml-2 font-medium">{database.mode}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Response:</span>
              <span className="ml-2 font-medium">{database.responseTime}ms</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Connections:</span>
              <span className="ml-2 font-medium">{database.connections.length}</span>
            </div>
          </div>
        </AppCard>

        {/* Memory Health */}
        <AppCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              <span className="font-medium">Memory</span>
            </div>
            {getStatusIcon(memory.status)}
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-600">Usage:</span>
              <span className="ml-2 font-medium">{memory.percentage.toFixed(1)}%</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Used:</span>
              <span className="ml-2 font-medium">{(memory.used / 1024 / 1024).toFixed(1)}MB</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Free:</span>
              <span className="ml-2 font-medium">{(memory.free / 1024 / 1024).toFixed(1)}MB</span>
            </div>
          </div>
        </AppCard>

        {/* Disk Health */}
        <AppCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <HardDrive className="h-5 w-5 mr-2" />
              <span className="font-medium">Disk</span>
            </div>
            {getStatusIcon(disk.status)}
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-600">Usage:</span>
              <span className="ml-2 font-medium">{disk.percentage.toFixed(1)}%</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Used:</span>
              <span className="ml-2 font-medium">{(disk.used / 1024 / 1024 / 1024).toFixed(1)}GB</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Free:</span>
              <span className="ml-2 font-medium">{(disk.free / 1024 / 1024 / 1024).toFixed(1)}GB</span>
            </div>
          </div>
        </AppCard>

        {/* Network Health */}
        <AppCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Wifi className="h-5 w-5 mr-2" />
              <span className="font-medium">Network</span>
            </div>
            {getStatusIcon(network.status)}
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-600">Latency:</span>
              <span className="ml-2 font-medium">{network.latency}ms</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Throughput:</span>
              <span className="ml-2 font-medium">{network.throughput}Mbps</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Connections:</span>
              <span className="ml-2 font-medium">{network.connections}</span>
            </div>
          </div>
        </AppCard>
      </div>

      {/* Services Status */}
      <AppCard
        header={
          <div className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            Services Status
          </div>
        }
      >
        <div className="space-y-3">
          {services.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="font-medium">{service.name}</span>
                <span className="ml-2 text-sm text-gray-600">({service.responseTime}ms)</span>
              </div>
              <div className="flex items-center">
                {getStatusIcon(service.status)}
                <span className={`ml-2 text-sm font-medium ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </AppCard>

      {/* Database Connections */}
      <AppCard
        header={
          <div className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Database Connections
          </div>
        }
      >
        <div className="space-y-3">
          {database.connections.map((connection, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="font-medium">{connection.name}</span>
                <span className="ml-2 text-sm text-gray-600">({connection.responseTime}ms)</span>
              </div>
              <div className="flex items-center">
                {getStatusIcon(connection.status)}
                <span className={`ml-2 text-sm font-medium ${getStatusColor(connection.status)}`}>
                  {connection.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </AppCard>
    </div>
  );
};
