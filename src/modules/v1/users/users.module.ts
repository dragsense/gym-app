import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEmailService } from './services/user-email.service';
import { UserSubscriber } from './subscribers/user.subscriber';
import { ProfilesModule } from './profiles/profiles.module';
import { PasswordService } from './services/password.service';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from '@/config';
import { ConfigService } from '@nestjs/config';
import { TokenService } from '../auth/services/tokens.service';
import { RefreshToken } from '../auth/entities/tokens.entity';
import { User } from '@/modules/v1/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User,RefreshToken]),
    ProfilesModule,
  JwtModule.registerAsync({
    useFactory: getJwtConfig,
    inject: [ConfigService],
  }),
  ],
  exports: [UsersService, UserEmailService],
  controllers: [UsersController],
  providers: [UsersService, UserEmailService, UserSubscriber, PasswordService, TokenService],
})
export class UsersModule { }
