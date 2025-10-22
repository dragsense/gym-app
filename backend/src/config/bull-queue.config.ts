import { registerAs } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';


export default registerAs('bullQueue', () => ({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    retryDelayOnFailover: 50,
    maxRetriesPerRequest: 5,
    lazyConnect: true,
    keepAlive: 60000,
    connectTimeout: 5000,
    commandTimeout: 3000,
    enableReadyCheck: true,
    maxMemoryPolicy: 'allkeys-lru',
    compression: true,
  },
}));


export const getBullQueueConfig = (configService: ConfigService) => {
  const redisConfig = configService.get('bullQueue.redis');

  return {
    redis: { ...redisConfig },
  };
};