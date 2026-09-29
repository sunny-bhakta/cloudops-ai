import type {
  AiRole,
  AiToolDefinition,
} from '@cloudops/ai-contracts';

export interface PolicyDecision {
  allowed: boolean;
  reason: string;
}

export class AiPolicy {
  canUseTool(
    role: AiRole,
    tool: AiToolDefinition,
  ): PolicyDecision {
    if (tool.allowedRoles.includes(role)) {
      return {
        allowed: true,
        reason: `Role "${role}" is allowed to use "${tool.name}"`,
      };
    }

    return {
      allowed: false,
      reason: `Role "${role}" is not allowed to use "${tool.name}"`,
    };
  }
}
