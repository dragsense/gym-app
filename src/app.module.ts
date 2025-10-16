import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { configOptions, appConfig, databaseConfig, jwtConfig, mailerConfig, getMailerConfig, superAdminConfig } from './config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Feature modules
import { UsersModule } from './modules/v1/users/users.module';
import { AuthModule } from './modules/v1/auth/auth.module';

import { FileUploadModule } from './common/file-upload/file-upload.module';
import { ActivityLogsModule } from './common/activity-logs/activity-logs.module';

// Common modules
import { LoggerModule } from './common/logger/logger.module';
import { DatabaseModule } from './common/database/database.module';

// Entities for dashboard stats
import { ServerGateway } from './gateways/server.gateway';
import { join } from 'path';
import { ResponseEncryptionInterceptor } from './interceptors/response-encryption-interceptor';

import { EncryptionService } from './lib/encryption.service';
import { ClientsModule } from './modules/v1/clients/clients.module';
import { TrainersModule } from './modules/v1/trainers/trainers.module';
import { TrainerClientsModule } from './modules/v1/trainer-clients/trainer-clients.module';
import { SessionsModule } from './modules/v1/sessions/sessions.module';



@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      ...configOptions,
      load: [appConfig, databaseConfig, jwtConfig, mailerConfig, superAdminConfig],
      isGlobal: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public',
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'dist'),

    }),

    // Database - Unified System
    DatabaseModule.forRoot(),

    // Email
    MailerModule.forRootAsync({
      useFactory: getMailerConfig,
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 60,  // 60 requests per minute
    }]),

    // Events
    EventEmitterModule.forRoot(),

    // Common modules
    LoggerModule,
    FileUploadModule,
    ActivityLogsModule,


    // Feature modules
    TrainersModule,
    ClientsModule,
    TrainerClientsModule,
    SessionsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ServerGateway,
    EncryptionService,
    ResponseEncryptionInterceptor,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
}) 
export class AppModule { }
 