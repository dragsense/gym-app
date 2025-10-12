import { registerAs } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

export default registerAs('bullQueue', () => ({
  dragonfly: {
    host: process.env.DRAGONFLY_HOST || 'localhost',
    port: parseInt(process.env.DRAGONFLY_PORT || '6379', 10),
    password: process.env.DRAGONFLY_PASSWORD,
    db: parseInt(process.env.DRAGONFLY_DB || '0', 10),
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
  const dragonflyConfig = configService.get('bullQueue.dragonfly');
  
  return {
    redis: {
      host: dragonflyConfig.host,
      port: dragonflyConfig.port,
      password: dragonflyConfig.password,
      db: dragonflyConfig.db,
      retryDelayOnFailover: dragonflyConfig.retryDelayOnFailover,
      maxRetriesPerRequest: dragonflyConfig.maxRetriesPerRequest,
      lazyConnect: dragonflyConfig.lazyConnect,
      keepAlive: dragonflyConfig.keepAlive,
      connectTimeout: dragonflyConfig.connectTimeout,
      commandTimeout: dragonflyConfig.commandTimeout,
      enableReadyCheck: dragonflyConfig.enableReadyCheck,
      maxMemoryPolicy: dragonflyConfig.maxMemoryPolicy,
      compression: dragonflyConfig.compression,
    },
  };
};
