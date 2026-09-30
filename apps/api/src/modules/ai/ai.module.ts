import {
  Module,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  GroqProvider,
} from '@cloudops/ai-providers';

import {
  AiPolicy,
} from '@cloudops/ai-policy';

import {
  ToolRegistry,
} from '@cloudops/ai-tools-sdk';

import {
  AiController,
} from './ai.controller.js';

import {
  AiService,
} from './ai.service.js';

import {
  AiContextInterceptor,
} from '../../context/ai-context.interceptor.js';

import {
  AI_POLICY,
  LLM_PROVIDER,
  TOOL_REGISTRY,
} from './ai.tokens.js';

@Module({
  controllers: [
    AiController,
  ],

  providers: [
    {
      provide: LLM_PROVIDER,

      inject: [
        ConfigService,
      ],

      useFactory: (
        config: ConfigService,
      ) => {
        return new GroqProvider({
          apiKey:
            config.getOrThrow<string>(
              'groq.apiKey',
            ),

          defaultModel:
            config.getOrThrow<string>(
              'groq.model',
            ),
        });
      },
    },

    {
      provide: AI_POLICY,
      useClass: AiPolicy,
    },

    {
      provide: TOOL_REGISTRY,
      useClass: ToolRegistry,
    },

    AiContextInterceptor,

    AiService,
  ],

  exports: [
    AiService,
  ],
})
export class AiModule {}
