import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { ResourceSeeder } from './seeders/resource.seeder';
import { Resource } from './entities/resource.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { PermissionsService } from './services/permissions.service';
import { ResourcesService } from './services/resources.service';
import { CrudModule } from '../crud/crud.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resource, Role, Permission]),
    CrudModule,
  ],
  controllers: [RolesController],
  providers: [RolesService, PermissionsService, ResourcesService, ResourceSeeder],
  exports: [RolesService, PermissionsService, ResourcesService, ResourceSeeder],
})
export class RolesModule {}
