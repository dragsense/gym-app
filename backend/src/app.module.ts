import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';

import {
  configOptions,
  appConfig,
  cacheConfig,
  healthConfig,
  databaseConfig,
  jwtConfig,
  mailerConfig,
  getMailerConfig,
  superAdminConfig,
  clusterConfig,
  activityLogsConfig,
  stripeConfig,
  getJwtConfig,
  bullQueueConfig,
} from './config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Feature modules - exported from modules index
import {
  UsersModule,
  AuthModule,
  ChatModule,
  ClientsModule,
  TrainersModule,
  TrainerClientsModule,
  SessionsModule,
  BillingsModule,
  ReferralLinksModule,
  RewardsModule,
  UserSettingsModule,
  UserAvailabilityModule,
  StripeModule,
} from './modules';
import { SeedsModule } from './seeds/seeds.module';

// Common modules - exported from index
import {
  BaseUserModule,
  FileUploadModule,
  ActivityLogsModule,
  WorkerModule,
  LoggerModule,
  DatabaseModule,
  ServerGatewayModule,
  SettingsModule,
  PaymentMethodsModule,
  ActionModule,
  CacheModule,
  RolesModule,
  HealthModule,
  NotificationModule,
  RequestContextMiddleware,
  RequestContextInterceptor,
  UserLevelGuard,
} from './common';

import { join } from 'path';
import { ResponseEncryptionInterceptor } from './interceptors/response-encryption-interceptor';
import { EncryptionService } from './lib/encryption.service';
import { getBullQueueConfig } from './config/bull-queue.config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/auth.gaurd';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      ...configOptions,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        mailerConfig,
        clusterConfig,
        superAdminConfig,
        activityLogsConfig,
        stripeConfig,
        cacheConfig,
        healthConfig,
        bullQueueConfig,
      ],
      isGlobal: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public',
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'dist'),
      serveRoot: '/',
      exclude: ['/api*'],
    }),

    // Database - Unified System
    DatabaseModule.forRoot(),

    // Email
    MailerModule.forRootAsync({
      useFactory: getMailerConfig,
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 60, // 60 requests per minute
      },
    ]),

    JwtModule.registerAsync({
      useFactory: getJwtConfig,
      inject: [ConfigService],
      global: true,
    }),

    // Events
    EventEmitterModule.forRoot(),

    // Bull Queues
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getBullQueueConfig,
      inject: [ConfigService],
    }),

    // Common modules
    BaseUserModule,
    LoggerModule,
    ServerGatewayModule,
    NotificationModule,
    FileUploadModule,
    ActivityLogsModule,
    CacheModule,
    WorkerModule,
    HealthModule,
    RolesModule,
    ChatModule,

    // Feature modules
    TrainersModule,
    ClientsModule,
    TrainerClientsModule,
    SessionsModule,
    BillingsModule,
    ReferralLinksModule,
    RewardsModule,
    UserSettingsModule,
    SettingsModule,
    UserAvailabilityModule,
    PaymentMethodsModule,
    StripeModule,
    SeedsModule,
    UsersModule,
    AuthModule,
    ActionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EncryptionService,
    ResponseEncryptionInterceptor,
    RequestContextMiddleware,
    RequestContextInterceptor,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UserLevelGuard,
    },
  ],
})
export class AppModule {}
