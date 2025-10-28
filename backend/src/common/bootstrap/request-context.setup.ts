import { INestApplication } from '@nestjs/common';
import { RequestContextMiddleware } from '../context/request-context.middleware';

export function setupRequestContext(app: INestApplication) {
  const requestContextMiddleware = app.get(RequestContextMiddleware);
  app.use(requestContextMiddleware.use.bind(requestContextMiddleware));
}
