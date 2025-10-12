import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { ResourceSeeder } from './seeders/resource.seeder';
import { Resource } from './entities/resource.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Resource, Role, Permission])],
  controllers: [RolesController],
  providers: [RolesService, ResourceSeeder],
  exports: [RolesService, ResourceSeeder],
})
export class RolesModule {}
