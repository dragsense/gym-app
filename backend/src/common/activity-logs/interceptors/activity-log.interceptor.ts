import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ActivityLogsService } from     '@/common/activity-logs/activity-logs.service';
import { EActivityType, EActivityStatus } from 'shared/enums/activity-log.enum';
import { LoggerService } from '@/common/logger/logger.service';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  private readonly logger = new LoggerService(ActivityLogInterceptor.name);

  constructor(private readonly activityLogsService: ActivityLogsService) {}

  /**
   * Get all nested keys from an object
   */
  private getNestedKeys(obj: any, prefix = ''): string[] {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return [];
    }

    const keys: string[] = [];
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        keys.push(fullKey);
        
        // Recursively get nested keys
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          keys.push(...this.getNestedKeys(obj[key], fullKey));
        }
      }
    }
    return keys;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    const startTime = Date.now();
    const { method, url, ip, headers } = request;

    const userAgent = headers['user-agent'];
    const user = (request as any).user;

    // Determine activity type based on HTTP method
    const activityType = this.getActivityType(method);
    const description = this.getDescription(method, url);

    return next.handle().pipe(
      tap(async (data) => {
        try {
          const duration = Date.now() - startTime;
          
          // Check if activity should be logged based on configuration
          const shouldLog = this.activityLogsService.shouldLogActivity(
            url,
            method,
            activityType
          );

          if (!shouldLog) {
            return;
          }
          
          // Safely get response size without circular reference errors
          let responseSize = 0;
          try {
            responseSize = JSON.stringify(data).length;
          } catch (e) {
            // Ignore circular reference errors
            responseSize = 0;
          }

          // Get all nested keys from request body (not values for privacy)
          const bodyKeys = request.body ? this.getNestedKeys(request.body) : [];
          
          await this.activityLogsService.create({
            description,
            type: activityType,
            status: EActivityStatus.SUCCESS,
            ipAddress: ip,
            userAgent,
            endpoint: url,
            method,
            statusCode: response.statusCode,
            metadata: {
              duration,
              responseSize,
              timestamp: new Date().toISOString(),
              bodyKeys,
            },
            userId: user?.id || null,
          });
        } catch (error) {
          this.logger.error('Failed to log activity', error);
        }
      }),
      catchError(async (error) => {
        try {
          const duration = Date.now() - startTime;

          // Check if activity should be logged based on configuration
          const shouldLog = this.activityLogsService.shouldLogActivity(
            url,
            method,
            activityType
          );

          if (!shouldLog) {
            throw error;
          }

          // Get all nested keys from request body (not values for privacy)
          const bodyKeys = request.body ? this.getNestedKeys(request.body) : [];
          
          await this.activityLogsService.createActivityLog({
            description,
            type: activityType,
            status: EActivityStatus.FAILED,
            ipAddress: ip,
            userAgent,
            endpoint: url,
            method,
            statusCode: error.status || 500,
            metadata: {
              duration,
              timestamp: new Date().toISOString(),
              bodyKeys,
            },
            errorMessage: error.message,
            userId: user?.id || null,
          });
        } catch (logError) {
          this.logger.error('Failed to log activity error', logError);
        }
        
        throw error;
      }),
    );
  }

  private getActivityType(method: string): EActivityType {
    switch (method.toUpperCase()) {
      case 'GET':
        return EActivityType.READ;
      case 'POST':
        return EActivityType.CREATE;
      case 'PUT':
      case 'PATCH':
        return EActivityType.UPDATE;
      case 'DELETE':
        return EActivityType.DELETE;
      default:
        return EActivityType.READ;
    }
  }

  private getDescription(method: string, url: string): string {
    const segments = url.split('/').filter(Boolean);
    const resource = segments[segments.length - 1] || 'resource';
    const action = method.toLowerCase();
    
    const actionDescriptions = {
      get: 'Retrieved',
      post: 'Created',
      put: 'Updated',
      patch: 'Modified',
      delete: 'Deleted',
    };

    const actionDesc = actionDescriptions[action] || 'Accessed';
    return `${actionDesc} ${resource}`;
  }
}
