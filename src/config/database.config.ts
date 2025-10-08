import { registerAs } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export default registerAs('database', () => ({
  postgres: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'Customer_app',
    synchronize: process.env.TYPEORM_SYNCHRONIZE,
    logging: process.env.TYPEORM_LOGGING,
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      min: parseInt(process.env.DB_POOL_MIN || '5', 10),
      idle: parseInt(process.env.DB_POOL_IDLE || '30000', 10),
      connTimeout: parseInt(process.env.DB_POOL_CONN_TIMEOUT || '5000', 10),
    },
  },
}));

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const postgresConfig = configService.get('database.postgres');

  return {
    type: 'postgres',
    host: postgresConfig.host,
    port: postgresConfig.port,
    username: postgresConfig.username,
    password: postgresConfig.password,
    database: postgresConfig.database,
    entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
    autoLoadEntities: true,
    synchronize: postgresConfig.synchronize,
    logging: postgresConfig.logging,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    extra: {
      max: postgresConfig.pool.max,
      min: postgresConfig.pool.min,
      idleTimeoutMillis: postgresConfig.pool.idle,
      connectionTimeoutMillis: postgresConfig.pool.connTimeout,
    },
  };
};
