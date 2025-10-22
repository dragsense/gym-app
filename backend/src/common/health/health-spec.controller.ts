import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppHealthService } from './app-health.service';

/**
 * Simple Health Spec Controller
 * Provides basic health check endpoints for monitoring and load balancers
 */
@Controller('health-spec')
export class HealthSpecController {
  constructor(private readonly healthService: AppHealthService) {}

  /**
   * Simple health check - returns 200 if service is running
   */
  @Get()
  async getSimpleHealth(@Res() res: Response) {
    try {
      const health = await this.healthService.getHealthStatus();
      
      // Simple check - if we can get health status, service is running
      res.status(HttpStatus.OK).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'running'
      });
    } catch (error) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable'
      });
    }
  }

  /**
   * Liveness probe - indicates if the service is alive
   */
  @Get('live')
  async getLiveness(@Res() res: Response) {
    try {
      // Simple liveness check - just verify service is responding
      res.status(HttpStatus.OK).json({
        status: 'alive',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'dead',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Readiness probe - indicates if the service is ready to accept traffic
   */
  @Get('ready')
  async getReadiness(@Res() res: Response) {
    try {
      const health = await this.healthService.getHealthStatus();
      
      // Check if critical services are healthy
      const isReady = health.status === 'healthy' || health.status === 'degraded';
      
      if (isReady) {
        res.status(HttpStatus.OK).json({
          status: 'ready',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          status: 'not-ready',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'not-ready',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Startup probe - indicates if the service has started successfully
   */
  @Get('startup')
  async getStartup(@Res() res: Response) {
    try {
      const health = await this.healthService.getHealthStatus();
      
      // Check if basic services are initialized
      const isStarted = health.checks.database.status === 'healthy' || 
                          health.checks.database.status === 'degraded';
      
      if (isStarted) {
        res.status(HttpStatus.OK).json({
          status: 'started',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          status: 'starting',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'starting',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Basic metrics endpoint
   */
  @Get('metrics')
  async getBasicMetrics(@Res() res: Response) {
    try {
      const health = await this.healthService.getHealthStatus();
      
      res.status(HttpStatus.OK).json({
        uptime: health.uptime,
        memory: health.checks.memory,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'error',
        timestamp: new Date().toISOString()
      });
    }
  }
}
