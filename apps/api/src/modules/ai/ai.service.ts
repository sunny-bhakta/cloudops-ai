import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';

import type {
  AiRequestContext,
  LlmProvider,
  LlmRequest,
  LlmResponse,
} from '@cloudops/ai-contracts';

import {
  AiPolicy,
} from '@cloudops/ai-policy';

import {
  ToolRegistry,
} from '@cloudops/ai-tools-sdk';

import {
  AI_POLICY,
  LLM_PROVIDER,
  TOOL_REGISTRY,
} from './ai.tokens.js';

@Injectable()
export class AiService {
  constructor(
    @Inject(LLM_PROVIDER)
    private readonly provider: LlmProvider,

    @Inject(AI_POLICY)
    private readonly policy: AiPolicy,

    @Inject(TOOL_REGISTRY)
    private readonly toolRegistry: ToolRegistry,
  ) {}

  async generate(
    request: LlmRequest,
    context: AiRequestContext,
  ): Promise<LlmResponse> {
    const availableTools =
      this.toolRegistry.getAllowedForRole(
        context.role,
      );

    console.log(
      `[AI] request=${context.requestId} role=${context.role} tools=${availableTools
        .map((tool) => tool.definition.name)
        .join(',')}`,
    );

    for (const registeredTool of availableTools) {
      const decision =
        this.policy.canUseTool(
          context.role,
          registeredTool.definition,
        );

      if (!decision.allowed) {
        throw new BadRequestException(
          decision.reason,
        );
      }
    }

    return this.provider.generate(request, availableTools);
  }
}
