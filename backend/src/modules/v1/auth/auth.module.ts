import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { RefreshJwtStrategy } from './strategies/jwt.strategy';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

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
import { RewardsModule } from '@/modules/v1/rewards/rewards.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, User, TrustedDevice, OtpCode]),
    UsersModule,
    ActivityLogsModule,
    RewardsModule,
    PassportModule,
  ],
  exports: [TokenService],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshJwtStrategy,
    TokenService,
    MfaService,
    OtpService,
  ],
})
export class AuthModule {}
