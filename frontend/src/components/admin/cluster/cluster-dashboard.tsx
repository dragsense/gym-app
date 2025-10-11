import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RefreshCw, Server, Cpu, HardDrive, Activity, Users } from 'lucide-react';
import { type IDetailedClusterInfo } from '@shared/interfaces/cluster.interface';

interface ClusterDashboardProps {
  data: IDetailedClusterInfo | null | undefined;
  loading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

// Utility functions
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

export const ClusterDashboard = ({
  data: clusterData,
  loading,
  error,
  onRefresh,
}: ClusterDashboardProps) => {

  if (loading && !clusterData) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading cluster data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Failed to fetch cluster data</p>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!clusterData) return null;

  const { cluster, system, process } = clusterData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cluster Dashboard</h2>
          <p className="text-gray-600">System and cluster monitoring</p>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Cluster Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            Cluster Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{cluster.totalWorkers}</div>
              <div className="text-sm text-gray-600">Total Workers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{process.pid}</div>
              <div className="text-sm text-gray-600">Process ID</div>
            </div>
            <div className="text-center">
              <Badge variant={cluster.isMaster ? 'default' : 'secondary'}>
                {cluster.isMaster ? 'Master' : 'Worker'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cpu className="h-5 w-5 mr-2" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>CPU Usage</span>
                <span className="font-bold">{system.cpu.usage}%</span>
              </div>
              <Progress 
                value={system.cpu.usage} 
                className="h-2"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Cores</div>
                  <div className="font-semibold">{system.cpu.cores}</div>
                </div>
                <div>
                  <div className="text-gray-600">Model</div>
                  <div className="font-semibold text-xs">{system.cpu.model}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HardDrive className="h-5 w-5 mr-2" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Memory Usage</span>
                <span className="font-bold">{system.memory.usage}%</span>
              </div>
              <Progress 
                value={system.memory.usage} 
                className="h-2"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Used</div>
                  <div className="font-semibold">
                    {formatBytes(system.memory.used)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Total</div>
                  <div className="font-semibold">
                    {formatBytes(system.memory.total)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Process Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Uptime</div>
              <div className="font-semibold">
                {formatUptime(process.uptime)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Node Version</div>
              <div className="font-semibold">{process.version}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Platform</div>
              <div className="font-semibold">{process.platform} ({process.arch})</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workers List */}
      {cluster.workers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Workers ({cluster.workers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cluster.workers.map((worker) => (
                <div key={worker.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={worker.connected ? 'default' : 'destructive'}>
                      {worker.connected ? 'Connected' : 'Disconnected'}
                    </Badge>
                    <span className="font-mono text-sm">PID: {worker.pid}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Worker #{worker.id}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">System Uptime</div>
              <div className="font-semibold">
                {formatUptime(system.uptime)}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Load Average</div>
              <div className="font-semibold">
                {system.loadAverage.map(load => load.toFixed(2)).join(', ')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
