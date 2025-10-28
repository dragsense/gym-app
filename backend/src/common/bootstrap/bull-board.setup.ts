import { INestApplication } from '@nestjs/common';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { Queue } from 'bull';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bull';

export function setupBullBoard(
  app: INestApplication,
  loggerService: LoggerService,
  configService: ConfigService,
) {
  const port = configService.get<number>('app.port', 3000);

  // Bull Board setup
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/bull-board');

  // Get all registered queues dynamically
  const queues: Queue[] = [];
  const queueNames = ['schedule', 'billing', 'session', 'user'];

  for (const queueName of queueNames) {
    try {
      const token = getQueueToken(queueName);
      const queue = app.get<Queue>(token, { strict: false });
      if (queue) {
        queues.push(queue);
      }
    } catch (error) {
      loggerService.warn(`⚠️ Bull Board: Queue '${queueName}' not found`);
    }
  }

  if (queues.length > 0) {
    createBullBoard({
      queues: queues.map((queue) => new BullAdapter(queue)),
      serverAdapter,
    });

    app.use('/bull-board', serverAdapter.getRouter());

    loggerService.log(
      `🎯 Bull Board available at: http://localhost:${port}/bull-board`,
    );
  } else {
    loggerService.error('❌ Bull Board: No queues found!');
  }
}
