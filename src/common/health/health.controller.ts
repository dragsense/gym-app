import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppHealthService } from './app-health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: AppHealthService) {}

  /**
   * Basic health check endpoint
   */
  @Get()
  async getHealth(@Res() res: Response) {
    try {
      const health = await this.healthService.getHealthStatus();
      
      const statusCode = health.status === 'healthy' 
        ? HttpStatus.OK 
        : health.status === 'degraded' 
          ? HttpStatus.OK 
          : HttpStatus.SERVICE_UNAVAILABLE;

      res.status(statusCode).json({
        status: health.status,
        timestamp: health.timestamp,
        uptime: health.uptime,
        version: health.version,
        environment: health.environment,
      });
    } catch (error) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'unhealthy',
        timestamp: new Date(),
        error: error.message,
      });
    }
  }

  /**
   * Detailed health check endpoint
   */
  @Get('detailed')
  async getDetailedHealth(@Res() res: Response) {
    try {
      const health = await this.healthService.getHealthStatus();
      
      const statusCode = health.status === 'healthy' 
        ? HttpStatus.OK 
        : health.status === 'degraded' 
          ? HttpStatus.OK 
          : HttpStatus.SERVICE_UNAVAILABLE;

      res.status(statusCode).json(health);
    } catch (error) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'unhealthy',
        timestamp: new Date(),
        error: error.message,
      });
    }
  }

  /**
   * Health summary endpoint
   */
  @Get('summary')
  async getHealthSummary(@Res() res: Response) {
    try {
      const summary = await this.healthService.getHealthSummary();
      
      const statusCode = summary.status === 'healthy' 
        ? HttpStatus.OK 
        : summary.status === 'degraded' 
          ? HttpStatus.OK 
          : HttpStatus.SERVICE_UNAVAILABLE;

      res.status(statusCode).json(summary);
    } catch (error) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'unhealthy',
        error: error.message,
      });
    }
  }

  /**
   * Database health check endpoint
   */
  @Get('database')
  async getDatabaseHealth(@Res() res: Response) {
    try {
      const health = await this.healthService.getHealthStatus();
      
      const statusCode = health.checks.database.status === 'healthy' 
        ? HttpStatus.OK 
        : health.checks.database.status === 'degraded' 
          ? HttpStatus.OK 
          : HttpStatus.SERVICE_UNAVAILABLE;

      res.status(statusCode).json({
        database: health.checks.database,
        timestamp: health.timestamp,
      });
    } catch (error) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'unhealthy',
        error: error.message,
      });
    }
  }

  /**
   * Memory health check endpoint
   */
  @Get('memory')
  async getMemoryHealth(@Res() res: Response) {
    try {
      const health = await this.healthService.getHealthStatus();
      
      const statusCode = health.checks.memory.status === 'healthy' 
        ? HttpStatus.OK 
        : health.checks.memory.status === 'degraded' 
          ? HttpStatus.OK 
          : HttpStatus.SERVICE_UNAVAILABLE;

      res.status(statusCode).json({
        memory: health.checks.memory,
        timestamp: health.timestamp,
      });
    } catch (error) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'unhealthy',
        error: error.message,
      });
    }
  }

  /**
   * Services health check endpoint
   */
  @Get('services')
  async getServicesHealth(@Res() res: Response) {
    try {
      const health = await this.healthService.getHealthStatus();
      
      const statusCode = health.checks.services.every(s => s.status === 'healthy')
        ? HttpStatus.OK 
        : health.checks.services.some(s => s.status === 'unhealthy')
          ? HttpStatus.SERVICE_UNAVAILABLE
          : HttpStatus.OK;

      res.status(statusCode).json({
        services: health.checks.services,
        timestamp: health.timestamp,
      });
    } catch (error) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'unhealthy',
        error: error.message,
      });
    }
  }
}
