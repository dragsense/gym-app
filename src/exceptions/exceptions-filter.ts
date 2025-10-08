import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();


    const isBrowserNavigation =
      req.method === 'GET' &&
      req.headers['accept']?.includes('text/html') &&
      !req.xhr;

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal Server Error';

    if (isBrowserNavigation) {
      res.status(status).type('html');
      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>Error ${status}</title>
            <style>
              body { font-family: sans-serif; text-align: center; padding: 50px; background: #f8f9fa; }
              h1 { font-size: 3em; margin-bottom: 0.5em; color: #dc3545; }
              p { color: #555; margin-bottom: 1em; }
              pre { background: #eee; padding: 1em; border-radius: 5px; text-align: left; }
            </style>
          </head>
          <body>
            <h1>Error ${status}</h1>
            <p>While requesting <code>${req.url}</code></p>
            <pre>${JSON.stringify(message, null, 2)}</pre>
            <p><a href="/api/docs">API Docs</a></p>
          </body>
        </html>
      `);
    }

    // Default JSON error for API clients
    res.status(status).json({
      statusCode: status,
      path: req.url,
      error: message,
    });
  }
}
