import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
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

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

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

    logger.log(
      `API documentation available at: http://localhost:${port}/api/docs`,
    );
  }
  const encryptionInterceptor = app.get(ResponseEncryptionInterceptor);

  app.useGlobalInterceptors(
    new BrowserHtmlInterceptor(),
    encryptionInterceptor,
  );

  

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

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
