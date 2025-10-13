import { registerAs } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

// Database modes
export enum DatabaseMode {
  SINGLE = 'single',
  MULTI_SCHEMA = 'multi-schema', 
  MULTI_DATABASE = 'multi-database',
}

// Connection configuration
export interface DatabaseConnection {
  name: string;
  type: 'postgres';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  schema?: string;
  ssl?: boolean | object;
  pool?: {
    max: number;
    min: number;
    idle: number;
    connTimeout: number;
  };
  extra?: Record<string, any>;
}

// Main database configuration
export interface DatabaseConfig {
  mode: DatabaseMode;
  defaultConnection: string;
  connections: Record<string, DatabaseConnection>;
  autoReplica: boolean;
  autoArchive: boolean;
  healthCheck: {
    interval: number;
    timeout: number;
    query: string;
  };
  retry: {
    maxAttempts: number;
    delay: number;
    backoffMultiplier: number;
  };
}

export default registerAs('database', (): DatabaseConfig => {
  // Validate database mode
  const validateDatabaseMode = (mode: string): DatabaseMode | null => {
    if (Object.values(DatabaseMode).includes(mode as DatabaseMode)) {
      return mode as DatabaseMode;
    }
    return null;
  };

  const dbMode = process.env.DB_MODE || DatabaseMode.SINGLE;

  const mode = validateDatabaseMode(dbMode);
  
  if (!mode) {
    throw new Error('Invalid database mode. Please check DB_MODE environment variable.');
  }

  const dbDefaultConnection = process.env.DB_DEFAULT_CONNECTION || 'default';


  // Base connection configuration with validation
  const baseConnection: DatabaseConnection = {
    name: dbDefaultConnection,
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'Customer_app',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      min: parseInt(process.env.DB_POOL_MIN || '5', 10),
      idle: parseInt(process.env.DB_POOL_IDLE || '30000', 10),
      connTimeout: parseInt(process.env.DB_POOL_CONN_TIMEOUT || '5000', 10),
    },
  };

  // Validate required fields
  if (!baseConnection.host || !baseConnection.username || !baseConnection.password) {
    throw new Error('Database configuration is incomplete. Please check DB_HOST, DB_USER, and DB_PASS environment variables.');
  }

  return {
    mode,
    defaultConnection: dbDefaultConnection,
    connections: {
      [dbDefaultConnection]: baseConnection,
    },
    autoReplica: process.env.DB_AUTO_REPLICA === 'true',
    autoArchive: process.env.DB_AUTO_ARCHIVE === 'true',
    healthCheck: {
      interval: parseInt(process.env.DB_HEALTH_CHECK_INTERVAL || '30000', 10),
      timeout: parseInt(process.env.DB_HEALTH_CHECK_TIMEOUT || '5000', 10),
      query: process.env.DB_HEALTH_CHECK_QUERY || 'SELECT 1',
    },
    retry: {
      maxAttempts: parseInt(process.env.DB_RETRY_MAX_ATTEMPTS || '3', 10),
      delay: parseInt(process.env.DB_RETRY_DELAY || '1000', 10),
      backoffMultiplier: parseFloat(process.env.DB_RETRY_BACKOFF_MULTIPLIER || '2'),
    },
  };
});

// Legacy function for backward compatibility
export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const dbConfig = configService.get<DatabaseConfig>('database');
  
  if (!dbConfig) {
    throw new Error('Database configuration not found. Please check your environment variables.');
  }

  const defaultConnection = dbConfig.connections[dbConfig.defaultConnection];
  
  if (!defaultConnection) {
    throw new Error(`Default connection '${dbConfig.defaultConnection}' not found in configuration.`);
  }

  return {
    type: defaultConnection.type,
    host: defaultConnection.host,
    port: defaultConnection.port,
    username: defaultConnection.username,
    password: defaultConnection.password,
    database: defaultConnection.database,
    schema: defaultConnection.schema,
    entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
    autoLoadEntities: true,
    synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
    logging: false,
    ssl: defaultConnection.ssl,
    extra: {
      max: defaultConnection.pool?.max  ?? 20,
      min: defaultConnection.pool?.min  ?? 5,
      idleTimeoutMillis: defaultConnection.pool?.idle  ?? 30000,
      connectionTimeoutMillis: defaultConnection.pool?.connTimeout  ?? 5000,
      ...defaultConnection.extra,
    },
  };
};