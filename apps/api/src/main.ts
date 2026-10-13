import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { HttpException, HttpStatus } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';

class ProblemFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const result = error instanceof HttpException ? error.getResponse() : null;
    const provided = result && typeof result === 'object' ? result as Record<string, unknown> : null;
    const title = provided?.title && typeof provided.title === 'string' ? provided.title : status === 500 ? 'Internal error' : 'Request failed';
    response.status(status).type('application/problem+json').json({
      type: provided?.type ?? '/problems/request-failed', title, status,
      detail: status === 500 ? 'An unexpected error occurred.' : provided?.detail ?? (typeof result === 'string' ? result : provided?.message ?? 'Please check your request.'),
      instance: request.path,
      ...(provided?.errors ? { errors: provided.errors } : {}),
    });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  app.use(helmet());
  app.use(cookieParser());
  app.use((_req: Request, response: Response, next: () => void) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.useGlobalFilters(new ProblemFilter());
  await app.listen(Number(process.env.PORT ?? 4000), '0.0.0.0');
}
void bootstrap();
