import { INestApplication } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { ResponseEncryptionInterceptor } from '../../interceptors/response-encryption-interceptor';
import { BrowserHtmlInterceptor } from '../../interceptors/BrowserHtmlInterceptor';
import { LoggerInterceptor } from '../logger/interceptors/logger.interceptor';
import { ActivityLogInterceptor } from '../activity-logs/interceptors/activity-log.interceptor';

export function setupInterceptors(app: INestApplication, loggerService: LoggerService) {
  // Build interceptors array based on environment
  const interceptors: any[] = [new BrowserHtmlInterceptor()];

  // Only use encryption in production
  if (process.env.NODE_ENV === 'production') {
    const encryptionInterceptor = app.get(ResponseEncryptionInterceptor);
    interceptors.push(encryptionInterceptor);
    loggerService.log('✅ Encryption interceptor enabled');
  } else {
    loggerService.warn('⚠️ Encryption disabled (development mode)');
  }

  const loggerInterceptor = app.get(LoggerInterceptor);
  interceptors.push(loggerInterceptor);

  const activityLogInterceptor = app.get(ActivityLogInterceptor);
  interceptors.push(activityLogInterceptor);

  app.useGlobalInterceptors(...interceptors);
}
