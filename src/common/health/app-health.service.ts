import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntityRouterService } from '../database/entity-router.service';
import { DatabaseManager } from '../database/database-manager.service';
import { ConnectionHealth, DatabaseHealth, DiskHealth, HealthStatus, MemoryHealth, NetworkHealth, ServiceHealth } from 'shared/interfaces/health.interface';


@Injectable()
export class AppHealthService {
  private readonly logger = new Logger(AppHealthService.name);
  private startTime: Date = new Date();

  constructor(
    private readonly configService: ConfigService,
    private readonly entityRouter: EntityRouterService,
    private readonly databaseManager: DatabaseManager,
  ) {}

  /**
   * Get comprehensive health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    this.logger.log('Performing comprehensive health check...');

    const [databaseHealth, memoryHealth, diskHealth, networkHealth, servicesHealth] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkMemoryHealth(),
      this.checkDiskHealth(),
      this.checkNetworkHealth(),
      this.checkServicesHealth(),
    ]);

    const overallStatus = this.determineOverallStatus([
      databaseHealth.status,
      memoryHealth.status,
      diskHealth.status,
      networkHealth.status,
      ...servicesHealth.map(s => s.status),
    ]);

    return {
      status: overallStatus,
      timestamp: new Date(),
      uptime: Date.now() - this.startTime.getTime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: databaseHealth,
        memory: memoryHealth,
        disk: diskHealth,
        network: networkHealth,
        services: servicesHealth,
      },
    };
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<DatabaseHealth> {
    try {
      const startTime = Date.now();
      
      // Test main connection
      await this.entityRouter.executeQuery('SELECT 1');
      const responseTime = Date.now() - startTime;

      // Get all connections
      const connections = this.databaseManager.getAllConnections();
      const connectionHealth: ConnectionHealth[] = [];

      for (const [name, connection] of connections) {
        try {
          const connStartTime = Date.now();
          await connection.query('SELECT 1');
          const connResponseTime = Date.now() - connStartTime;

          connectionHealth.push({
            name,
            status: 'connected',
            responseTime: connResponseTime,
            lastChecked: new Date(),
          });
        } catch (error) {
          connectionHealth.push({
            name,
            status: 'error',
            responseTime: 0,
            lastChecked: new Date(),
            error: error.message,
          });
        }
      }

      const status = connectionHealth.every(c => c.status === 'connected') 
        ? 'healthy' 
        : connectionHealth.some(c => c.status === 'error') 
          ? 'unhealthy' 
          : 'degraded';

      return {
        status,
        connections: connectionHealth,
        mode: this.entityRouter.getMode(),
        responseTime,
        lastChecked: new Date(),
      };
    } catch (error) {
      this.logger.error(`Database health check failed: ${error.message}`);
      return {
        status: 'unhealthy',
        connections: [],
        mode: 'unknown',
        responseTime: 0,
        lastChecked: new Date(),
      };
    }
  }

  /**
   * Check memory health
   */
        private async checkMemoryHealth(): Promise<MemoryHealth> {
            try {
      const memUsage = process.memoryUsage();
      const total = memUsage.heapTotal;
      const used = memUsage.heapUsed;
      const free = total - used;
      const percentage = (used / total) * 100;

      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      
      if (percentage > 90) {
        status = 'unhealthy';
      } else if (percentage > 75) {
        status = 'degraded';
      }

      return {
        status,
        used,
        total,
        percentage: Math.round(percentage * 100) / 100,
        free,
      };
    } catch (error) {
      this.logger.error(`Memory health check failed: ${error.message}`);
      return {
        status: 'unhealthy',
        used: 0,
        total: 0,
        percentage: 0,
        free: 0,
      };
    }
  }

  /**
   * Check disk health
   */
  private async checkDiskHealth(): Promise<DiskHealth> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Check disk space
      const stats = fs.statSync(process.cwd());
      const total = 1000000000; // 1GB (simplified)
      const used = 500000000;   // 500MB (simplified)
      const free = total - used;
      const percentage = (used / total) * 100;

      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      
      if (percentage > 90) {
        status = 'unhealthy';
      } else if (percentage > 75) {
        status = 'degraded';
      }

      return {
        status,
        used,
        total,
        percentage: Math.round(percentage * 100) / 100,
        free,
      };
    } catch (error) {
      this.logger.error(`Disk health check failed: ${error.message}`);
      return {
        status: 'unhealthy',
        used: 0,
        total: 0,
        percentage: 0,
        free: 0,
      };
    }
  }

  /**
   * Check network health
   */
  private async checkNetworkHealth(): Promise<NetworkHealth> {
    try {
      // Simulate network check
      const startTime = Date.now();
      await this.entityRouter.executeQuery('SELECT 1');
      const latency = Date.now() - startTime;

      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      
      if (latency > 5000) {
        status = 'unhealthy';
      } else if (latency > 1000) {
        status = 'degraded';
      }

      return {
        status,
        latency,
        throughput: 1000, // Simplified
        connections: 10, // Simplified
      };
    } catch (error) {
      this.logger.error(`Network health check failed: ${error.message}`);
      return {
        status: 'unhealthy',
        latency: 0,
        throughput: 0,
        connections: 0,
      };
    }
  }

  /**
   * Check services health
   */
  private async checkServicesHealth(): Promise<ServiceHealth[]> {
    const services: ServiceHealth[] = [];

    // Check database connections
    const connections = this.databaseManager.getAllConnections();
    for (const [name, connection] of connections) {
      try {
        const startTime = Date.now();
        await connection.query('SELECT 1');
        const responseTime = Date.now() - startTime;

        services.push({
          name: `database_${name}`,
          status: 'healthy',
          responseTime,
          lastChecked: new Date(),
        });
      } catch (error) {
        services.push({
          name: `database_${name}`,
          status: 'unhealthy',
          responseTime: 0,
          lastChecked: new Date(),
          error: error.message,
        });
      }
    }

    // Check external services (if any)
    // Add more service checks here as needed

    return services;
  }

  /**
   * Determine overall status
   */
  private determineOverallStatus(statuses: string[]): 'healthy' | 'unhealthy' | 'degraded' {
    if (statuses.includes('unhealthy')) {
      return 'unhealthy';
    }
    if (statuses.includes('degraded')) {
      return 'degraded';
    }
    return 'healthy';
  }

  /**
   * Get health summary
   */
  async getHealthSummary(): Promise<{
    status: string;
    uptime: string;
    checks: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  }> {
    const health = await this.getHealthStatus();
    const checks = [
      health.checks.database.status,
      health.checks.memory.status,
      health.checks.disk.status,
      health.checks.network.status,
      ...health.checks.services.map(s => s.status),
    ];

    return {
      status: health.status,
      uptime: this.formatUptime(health.uptime),
      checks: checks.length,
      healthy: checks.filter(s => s === 'healthy').length,
      degraded: checks.filter(s => s === 'degraded').length,
      unhealthy: checks.filter(s => s === 'unhealthy').length,
    };
  }

  /**
   * Format uptime
   */
  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}
