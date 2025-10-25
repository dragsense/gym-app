import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntityRouterService } from '../database/entity-router.service';
import { DatabaseManager } from '../database/database-manager.service';
import {
  IConnectionHealth,
  IDatabaseHealth,
  IMemoryHealth,
  INetworkHealth,
  IHealthStatus,
} from '@shared/interfaces/health.interface';
import { EHealthStatus } from '@shared/enums';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class HealthService {
  private readonly logger = new LoggerService(HealthService.name);
  private startTime: Date = new Date();

  constructor(
    private readonly configService: ConfigService,
    private readonly entityRouter: EntityRouterService,
    private readonly databaseManager: DatabaseManager,
  ) {}

  /**
   * Get comprehensive health status
   */
  async getHealthStatus(): Promise<IHealthStatus> {
    this.logger.log('Performing comprehensive health check...');

    const [databaseHealth, memoryHealth, networkHealth] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkMemoryHealth(),
      this.checkNetworkHealth(),
    ]);

    const overallStatus = this.determineOverallStatus([
      databaseHealth.status,
      memoryHealth.status,
      networkHealth.status,
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
        network: networkHealth,
      },
    };
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<IDatabaseHealth> {
    try {
      const startTime = Date.now();

      // Test main connection
      await this.entityRouter.executeQuery('SELECT 1');
      const responseTime = Date.now() - startTime;

      // Get all connections
      const connections = this.databaseManager.getAllConnections();
      const connectionHealth: IConnectionHealth[] = [];

      for (const [name, connection] of connections) {
        try {
          const connStartTime = Date.now();
          await connection.query('SELECT 1');
          const connResponseTime = Date.now() - connStartTime;

          connectionHealth.push({
            name,
            status: EHealthStatus.HEALTHY,
            responseTime: connResponseTime,
            lastChecked: new Date(),
          });
        } catch (error) {
          connectionHealth.push({
            name,
            status: EHealthStatus.UNHEALTHY,
            responseTime: 0,
            lastChecked: new Date(),
            error: error.message,
          });
        }
      }

      const status = connectionHealth.every(
        (c) => c.status === EHealthStatus.HEALTHY,
      )
        ? EHealthStatus.HEALTHY
        : connectionHealth.some((c) => c.status === EHealthStatus.UNHEALTHY)
          ? EHealthStatus.UNHEALTHY
          : EHealthStatus.DEGRADED;

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
        status: EHealthStatus.UNHEALTHY,
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
  private async checkMemoryHealth(): Promise<IMemoryHealth> {
    try {
      const memUsage = process.memoryUsage();
      const total = memUsage.heapTotal;
      const used = memUsage.heapUsed;
      const free = total - used;
      const percentage = (used / total) * 100;

      let status = EHealthStatus.HEALTHY;

      if (percentage > 90) {
        status = EHealthStatus.UNHEALTHY;
      } else if (percentage > 75) {
        status = EHealthStatus.DEGRADED;
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
        status: EHealthStatus.UNHEALTHY,
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
  private async checkNetworkHealth(): Promise<INetworkHealth> {
    try {
      // Simulate network check
      const startTime = Date.now();
      await this.entityRouter.executeQuery('SELECT 1');
      const latency = Date.now() - startTime;

      let status = EHealthStatus.HEALTHY;

      if (latency > 5000) {
        status = EHealthStatus.UNHEALTHY;
      } else if (latency > 1000) {
        status = EHealthStatus.DEGRADED;
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
        status: EHealthStatus.UNHEALTHY,
        latency: 0,
        throughput: 0,
        connections: 0,
      };
    }
  }

  /**
   * Determine overall status
   */
  private determineOverallStatus(statuses: EHealthStatus[]): EHealthStatus {
    if (statuses.includes(EHealthStatus.UNHEALTHY)) {
      return EHealthStatus.UNHEALTHY;
    }
    if (statuses.includes(EHealthStatus.DEGRADED)) {
      return EHealthStatus.DEGRADED;
    }
    return EHealthStatus.HEALTHY;
  }
}
