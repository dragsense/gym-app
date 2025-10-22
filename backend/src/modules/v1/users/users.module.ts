import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEmailService } from './services/user-email.service';
import { UserEventListenerService } from './services/user-event-listener.service';
import { UserProcessor } from './services/user.processor';
import { UserSubscriber } from './subscribers/user.subscriber';
import { ProfilesModule } from './profiles/profiles.module';
import { PasswordService } from './services/password.service';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from '@/config';
import { ConfigService } from '@nestjs/config';
import { TokenService } from '../auth/services/tokens.service';
import { RefreshToken } from '../auth/entities/tokens.entity';
import { User } from '@/modules/v1/users/entities/user.entity';
import { CrudModule } from '@/common/crud/crud.module';
import { UserSeeder } from './seeders/user.seeder';
import { ActionModule } from '@/common/helper/action.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),
    ProfilesModule,
    ActionModule,
    CrudModule,
    BullModule.registerQueue({ name: 'user' }),
    JwtModule.registerAsync({
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  exports: [UsersService, UserEmailService],
  controllers: [UsersController],
  providers: [UsersService,
    UserEmailService,
    UserEventListenerService,
    UserProcessor,
    UserSubscriber,
    PasswordService,
    TokenService,
    UserSeeder],
})
export class UsersModule { }
