import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Observable } from 'rxjs';

import type {
  AiRequestContext,
} from '@cloudops/ai-contracts';

import {
  createAiRequestContext,
} from './ai-request-context.js';

export const AI_CONTEXT = Symbol('AI_CONTEXT');

declare module 'express-serve-static-core' {
  interface Request {
    aiContext?: AiRequestContext;
  }
}

@Injectable()
export class AiContextInterceptor
  implements NestInterceptor
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request =
      context.switchToHttp().getRequest<Request>();

    request.aiContext =
      createAiRequestContext(
        request.header('X-Request-Id'),
        request.header('X-Ai-Role'),
      );

    return next.handle();
  }
}
