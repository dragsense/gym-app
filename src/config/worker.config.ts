import { registerAs } from '@nestjs/config';

export default registerAs('worker', () => ({
  enabled: process.env.WORKER_ENABLED !== 'false',
  maxConcurrency: parseInt(process.env.WORKER_MAX_CONCURRENCY || '5'),
  retryAttempts: parseInt(process.env.WORKER_RETRY_ATTEMPTS || '3'),
  retryDelay: parseInt(process.env.WORKER_RETRY_DELAY || '1000'),
}));
