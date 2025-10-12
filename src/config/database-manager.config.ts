import { registerAs } from '@nestjs/config';

export default registerAs('databaseManager', () => ({
  defaultConnection: process.env.DB_DEFAULT_CONNECTION || 'default',
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
  connections: {
    default: {
      name: 'default',
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
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
    },
  },
}));
