import { registerAs } from '@nestjs/config';

export default registerAs('cluster', () => ({
  enabled: process.env.CLUSTER_ENABLED === 'true',
  workers: parseInt(process.env.CLUSTER_WORKERS || '0', 10) || undefined, // 0 means auto-detect
}));
