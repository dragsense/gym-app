import { registerAs } from '@nestjs/config';

export default registerAs('bullQueue', () => ({
  dragonfly: {
    host: process.env.DRAGONFLY_HOST || 'localhost',
    port: parseInt(process.env.DRAGONFLY_PORT, 10) || 6379,
    password: process.env.DRAGONFLY_PASSWORD,
    db: parseInt(process.env.DRAGONFLY_DB, 10) || 0,
    retryDelayOnFailover: 50,
    maxRetriesPerRequest: 5,
    lazyConnect: true,
    keepAlive: 60000,
    connectTimeout: 5000,
    commandTimeout: 3000,
    // DragonflyDB specific optimizations
    enableReadyCheck: true,
    maxMemoryPolicy: 'allkeys-lru',
    compression: true,
  },
  workers: {
    concurrency: parseInt(process.env.BULL_WORKER_CONCURRENCY, 10) || 5,
    stalledInterval: 30000,
    maxStalledCount: 1,
  },
  monitoring: {
    enabled: process.env.NODE_ENV === 'production',
    port: parseInt(process.env.BULL_MONITORING_PORT, 10) || 3001,
  },
}));
