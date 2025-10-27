import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function setupCors(app: INestApplication, configService: ConfigService) {
  // CORS configuration
  const corsOrigins = configService
    .get<string>('app.corsOrigins', 'http://localhost:5173')
    .split(',');
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-Timezone',
    ],
    exposedHeaders: ['Content-Disposition'],
    credentials: true,
    maxAge: 3600,
  });
}
