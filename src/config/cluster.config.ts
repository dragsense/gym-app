import { registerAs } from '@nestjs/config';

export default registerAs('cluster', () => ({
  enabled: process.env.CLUSTER_ENABLED === 'true' || false,
  workers: parseInt(process.env.CLUSTER_WORKERS || '0') || require('os').cpus().length,
}));
