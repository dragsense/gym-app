import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ProfilesModule } from './profiles/profiles.module';
import { PasswordService } from './services/password.service';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from '@/config';
import { ConfigService } from '@nestjs/config';
import { ActionModule } from '@/common/helper/action.module';
import { UsersWebSocketService } from './services/users-websocket.service';
import { UserEmailService } from './services/user-email.service';
import { UserEventListenerService } from './services/user-event-listener.service';
import { UserProcessor } from './services/user.processor';
import { BaseUserModule } from '@/common/base-user/base-users.module';
import { TokenService } from '../auth/services/tokens.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '../auth/entities/tokens.entity';
import { UserSubscriber } from './subscribers/user.subscriber';
import { UserAvailabilityModule } from '../user-availability/user-availability.module';
import { NotificationModule } from '@/common/notification/notification.module';
import { UserNotificationService } from './services/user-notification.service';
import { User } from '@/common/base-user/entities/user.entity';

@Module({
  imports: [
    ProfilesModule,
    UserAvailabilityModule,
    ActionModule,
    BaseUserModule,
    NotificationModule,
    BullModule.registerQueue({ name: 'user' }),
    JwtModule.registerAsync({
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([RefreshToken, User]),
  ],
  exports: [UsersService, UserEmailService, UsersWebSocketService],
  controllers: [UsersController],
  providers: [
    TokenService,
    UsersService,
    UserEmailService,
    UserEventListenerService,
    UserNotificationService,
    UserProcessor,
    PasswordService,
    UsersWebSocketService,
    UserSubscriber,
  ],
})
export class UsersModule {}
