import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from '@/config/database.config';
import { DatabaseManager } from './database-manager.service';
import { EntityRouterService } from './entity-router.service';

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        ConfigModule,
        // Main TypeORM connection for backward compatibility
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: getTypeOrmConfig,
        }),
      ],
      providers: [
        DatabaseManager,
        EntityRouterService,
      ],
      exports: [
        DatabaseManager,
        EntityRouterService,
        TypeOrmModule,
      ],
    };
  }

  static forFeature(entities: any[]): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forFeature(entities),
      ],
      exports: [TypeOrmModule],
    };
  }
}
