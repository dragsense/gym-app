import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';

import { configOptions, appConfig, cacheConfig, databaseConfig, jwtConfig, mailerConfig, getMailerConfig, superAdminConfig, clusterConfig, activityLogsConfig, stripeConfig } from './config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Feature modules
import { UsersModule } from './modules/v1/users/users.module';
import { AuthModule } from './modules/v1/auth/auth.module';

import { FileUploadModule } from './common/file-upload/file-upload.module';
import { ActivityLogsModule } from './common/activity-logs/activity-logs.module';
import { WorkerModule } from './common/worker/worker.module';

// Common modules
import { LoggerModule } from './common/logger/logger.module';
import { DatabaseModule } from './common/database/database.module';

import { ServerGateway } from './gateways/server.gateway';
import { join } from 'path';
import { ResponseEncryptionInterceptor } from './interceptors/response-encryption-interceptor';

import { EncryptionService } from './lib/encryption.service';
import { ClientsModule } from './modules/v1/clients/clients.module';
import { TrainersModule } from './modules/v1/trainers/trainers.module';
import { TrainerClientsModule } from './modules/v1/trainer-clients/trainer-clients.module';
import { SessionsModule } from './modules/v1/sessions/sessions.module';
import { BillingsModule } from './modules/v1/billings/billings.module';
import { ReferralLinksModule } from './modules/v1/referral-links/referral-links.module';
import { RewardsModule } from './modules/v1/rewards/rewards.module';
import { UserSettingsModule } from './modules/v1/user-settings/user-settings.module';
import { SettingsModule } from './common/settings/settings.module';
import { UserAvailabilityModule } from './modules/v1/user-availability/user-availability.module';
import { PaymentMethodsModule } from './common/payment-methods/payment-methods.module';
import { StripeModule } from './modules/v1/stripe/stripe.module';
import { SeedsModule } from './common/seeds/seeds.module';
import { ActionModule } from './common/helper/action.module';
import { getBullQueueConfig } from './config/bull-queue.config';
import { CacheModule } from './common/cache/cache.module';



@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      ...configOptions,
      load: [appConfig,
         databaseConfig,
          jwtConfig, 
          mailerConfig, 
          clusterConfig, 
          superAdminConfig,
          activityLogsConfig,
          stripeConfig,
          cacheConfig
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
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 60,  // 60 requests per minute
    }]),

    // Events
    EventEmitterModule.forRoot(),

    // Bull Queues
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getBullQueueConfig,
      inject: [ConfigService],
    }),
    // Register specific queues
    BullModule.registerQueue(
      { name: 'schedule' },
      { name: 'email' },
      { name: 'notification' },
      { name: 'file-processing' },
      { name: 'user-activity' },
      { name: 'billing' },
      { name: 'analytics' },
      { name: 'user' },
      { name: 'session' }
    ),

    // Common modules
    LoggerModule,
    FileUploadModule,
    ActivityLogsModule,
    CacheModule,
    WorkerModule,


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
