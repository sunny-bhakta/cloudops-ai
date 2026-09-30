import {
  Body,
  Controller,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';

import type {
  LlmRequest,
} from '@cloudops/ai-contracts';

import type {
  Request,
} from 'express';

import {
  AiService,
} from './ai.service.js';

import {
  AiContextInterceptor,
} from '../../context/ai-context.interceptor.js';

import {
  GenerateDto,
} from './dto/generate.dto.js';

@Controller('ai')
@UseInterceptors(AiContextInterceptor)
export class AiController {
  constructor(
    private readonly aiService: AiService,
  ) {}

  @Post('generate')
  generate(
    @Body() body: GenerateDto,
    @Req() request: Request,
  ) {
    if (!request.aiContext) {
      throw new Error(
        'AI request context was not initialized',
      );
    }

    const aiRequest: LlmRequest = {
      messages: body.messages,
      model: body.model,
      temperature: body.temperature,
    };

    return this.aiService.generate(
      aiRequest,
      request.aiContext,
    );
  }
}
