import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { JwtStrategy, RefreshJwtStrategy } from './strategies/jwt.strategy';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { getJwtConfig } from '@/config/jwt.config';

import { UsersModule } from '@/modules/v1/users/users.module';
import { TokenService } from './services/tokens.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '@/modules/v1/auth/entities/tokens.entity';
import { MfaService } from './services/mfa-device.service';
import { OtpService } from './services/otp.service';
import { User } from '@/modules/v1/users/entities/user.entity';
import { TrustedDevice } from '@/modules/v1/auth/entities/trusted-device.entity';
import { OtpCode } from '@/modules/v1/auth/entities/otp-code.entity';
import { ActivityLogsModule } from '@/common/activity-logs/activity-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, User, TrustedDevice, OtpCode]),
    UsersModule,
    ActivityLogsModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  exports: [TokenService],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshJwtStrategy, TokenService, MfaService, OtpService],
})
export class AuthModule { }
