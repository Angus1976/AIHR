import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * 统一错误 JSON（含 path、timestamp），生产环境不向外暴露非 HttpException 的堆栈与细节。
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  private rid(req: Request) {
    return req.requestId;
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId = this.rid(req);

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const payload =
        typeof body === 'object' && body !== null && !Array.isArray(body)
          ? { ...(body as Record<string, unknown>) }
          : { message: body };
      return res.status(status).json({
        ...payload,
        statusCode: status,
        path: req.url,
        requestId,
        timestamp: new Date().toISOString(),
      });
    }

    const err = exception instanceof Error ? exception : new Error('Unknown error');
    this.logger.error(
      `[${requestId ?? '—'}] ${req.method} ${req.url}: ${err.message}`,
      err.stack,
    );

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : err.message,
      path: req.url,
      requestId,
      timestamp: new Date().toISOString(),
    });
  }
}
