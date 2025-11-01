import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy, RefreshJwtStrategy } from './strategies/jwt.strategy';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { UsersModule } from '@/modules/v1/users/users.module';
import { TokenService } from './services/tokens.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '@/modules/v1/auth/entities/tokens.entity';
import { MfaService } from './services/mfa-device.service';
import { OtpService } from './services/otp.service';
import { User } from '@/common/system-user/entities/user.entity';
import { TrustedDevice } from '@/modules/v1/auth/entities/trusted-device.entity';
import { OtpCode } from '@/modules/v1/auth/entities/otp-code.entity';
import { ActivityLogsModule } from '@/common/activity-logs/activity-logs.module';
import { RewardsModule } from '@/modules/v1/rewards/rewards.module';
import { TrainersModule } from '@/modules/v1/trainers/trainers.module';
import { ProfilesModule } from '../users/profiles/profiles.module';
import { SystemUserModule } from '@/common/system-user/system-users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, User, TrustedDevice, OtpCode]),
    UsersModule,
    ActivityLogsModule,
    RewardsModule,
    PassportModule,
    TrainersModule,
    ProfilesModule,
    SystemUserModule,
  ],
  exports: [TokenService, JwtStrategy],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshJwtStrategy,
    TokenService,
    MfaService,
    OtpService,
  ],
})
export class AuthModule {}
