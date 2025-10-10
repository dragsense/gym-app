import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as hpp from 'hpp';

import { AppModule } from './app.module';

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

  // API documentation
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
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/docs', app, documentFactory, {
      customSiteTitle: 'Customer App Web API',
      swaggerOptions: {
        persistAuthorization: true,
        withCredentials: true,
      },
    });

    loggerService.log(
      `API documentation available at: http://localhost:${port}/api/docs`,
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
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['Content-Disposition'],
    credentials: true,
    maxAge: 3600,
  });

  app.setGlobalPrefix('api');

  await app.listen(port);

  loggerService.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
