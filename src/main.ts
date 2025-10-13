import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as hpp from 'hpp';

import { AppModule } from './app.module';
import { scalarConfig, scalarThemes } from './config/scalar.config';

import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as compression from 'compression';
import * as csurf from 'csurf';
import { ResponseEncryptionInterceptor } from './interceptors/response-encryption-interceptor';
import { BrowserHtmlInterceptor } from './interceptors/BrowserHtmlInterceptor';
import { ExceptionsFilter } from './exceptions/exceptions-filter';
import { LoggerService } from './common/logger/logger.service';
import { LoggerInterceptor } from './common/logger/interceptors/logger.interceptor';
import { ActivityLogInterceptor } from './common/activity-logs/interceptors/activity-log.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  const configService = app.get(ConfigService);

  // Use custom logger globally
  const loggerService = app.get(LoggerService);
  loggerService.setContext('Bootstrap');
  app.useLogger(loggerService);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:"],
      },
    },
    crossOriginEmbedderPolicy: true,
    hidePoweredBy: true,
  }));
  app.use(hpp());
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  app.use(cookieParser(configService.get('app').cookieSecret));
  app.use(compression());
  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      },
    }),
  );

  const port = configService.get<number>('app.port', 3000);

  // API documentation with Scalar
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Customer App Web API')
      .setDescription(
        'Empower coaches to manage clients, track progress, and deliver results — all in one simple, powerful tool.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
        },
        'access-token',
      )
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Users', 'User management endpoints')
      .addTag('Sessions', 'Training session management')
      .addTag('Payments', 'Payment processing and history')
      .addTag('Invoices', 'Invoice management')
      .addTag('Settings', 'Application settings')
      .addTag('Roles & Permissions', 'Role and permission management')
      .addTag('Health', 'System health and monitoring')
      .addTag('Cache', 'Cache management')
      .addTag('Queue', 'Background job management')
      .addTag('Schedule', 'Scheduled task management')
      .addTag('Activity Logs', 'User activity tracking')
      .addTag('Notifications', 'Notification management')
      .addTag('File Upload', 'File upload and management')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // Setup Scalar API Reference with dynamic theme
    const scalarTheme = configService.get<string>('scalar.theme', 'purple');
    const selectedTheme = scalarThemes[scalarTheme] || scalarThemes.purple;
    
    app.use(
      '/api/docs',
      apiReference({
        content: document,
        ...selectedTheme,
        title: configService.get<string>('scalar.title', 'Customer App Web API'),
        meta: {
          description: configService.get<string>('scalar.description', 'Empower coaches to manage clients, track progress, and deliver results — all in one simple, powerful tool.'),
        },
      }),
    );

    // Also keep the JSON endpoint for external tools
    SwaggerModule.setup('api/docs-json', app, document);

    loggerService.log(
      `🚀 Scalar API documentation available at: http://localhost:${port}/api/docs`,
    );
    loggerService.log(
      `📄 OpenAPI JSON available at: http://localhost:${port}/api/docs-json`,
    );
  }

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

  const activityLogInterceptor = app.get(ActivityLogInterceptor)
  interceptors.push(activityLogInterceptor);

  app.useGlobalInterceptors(...interceptors);



  app.useGlobalFilters(new ExceptionsFilter());


  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      validationError: { target: false },
    }),
  );



  // CORS configuration
  const corsOrigins = configService.get<string>('app.corsOrigins', 'http://localhost:5173').split(',');
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Timezone'],
    exposedHeaders: ['Content-Disposition'],
    credentials: true,
    maxAge: 3600,
  });

  app.setGlobalPrefix('api');

  await app.listen(port);

  loggerService.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
