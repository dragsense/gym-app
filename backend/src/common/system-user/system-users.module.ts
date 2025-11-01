import { Module } from '@nestjs/common';

import { SystemUsersService } from './system-users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/common/system-user/entities/user.entity';
import { CrudModule } from '../crud/crud.module';
import { UserSeed } from './seeder/user.seed';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CrudModule],
  providers: [SystemUsersService, UserSeed],
  exports: [SystemUsersService, UserSeed],
})
export class SystemUserModule {}
