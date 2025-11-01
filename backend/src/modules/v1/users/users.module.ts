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
import { SystemUserModule } from '@/common/system-user/system-users.module';
import { TokenService } from '../auth/services/tokens.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '../auth/entities/tokens.entity';

@Module({
  imports: [
    ProfilesModule,
    ActionModule,
    SystemUserModule,
    BullModule.registerQueue({ name: 'user' }),
    JwtModule.registerAsync({
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([RefreshToken]),
  ],
  exports: [UsersService, UserEmailService, UsersWebSocketService],
  controllers: [UsersController],
  providers: [
    TokenService,
    UsersService,
    UserEmailService,
    UserEventListenerService,
    UserProcessor,
    PasswordService,
    UsersWebSocketService,
  ],
})
export class UsersModule {}
