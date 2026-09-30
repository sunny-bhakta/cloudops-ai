
import type { 
    Guardrail,
    GuardrailContext,
    GuardrailResult,
    GuardrailEngineOptions
 } from "@cloudops/ai-contracts";
import { GuardrailBlockedError } from "./guardrail.blocked.error.js";

export class GuardrailEngine {
  private readonly guardrails: Guardrail[];
  private readonly mode: "all" | "first-block";

  constructor(options: GuardrailEngineOptions) {
    this.guardrails = options.guardrails;
    this.mode = options.mode ?? "first-block";
  }

  async check(
    input: string,
    context?: GuardrailContext,
  ): Promise<GuardrailResult> {
    let value = input;
    const reasons: string[] = [];
    const metadata: Record<string, unknown> = {};

    for (const guardrail of this.guardrails) {
      const result = await guardrail.check(value, context);

      if (result.action === "block") {
        reasons.push(...result.reasons);

        if (this.mode === "first-block") {
          return {
            action: "block",
            value,
            reasons,
            metadata: {
              ...metadata,
              ...result.metadata,
              blockedBy: guardrail.name
            }
          };
        }
      }

      if (result.action === "sanitize") {
        value = result.value;
      }

      reasons.push(...result.reasons);

      Object.assign(metadata, result.metadata);
    }

    if (reasons.length > 0 && value !== input) {
      return {
        action: "sanitize",
        value,
        reasons,
        metadata
      };
    }

    return {
      action: "allow",
      value,
      reasons,
      metadata
    };
  }

  async assertAllowed(
    input: string,
    context?: GuardrailContext,
  ): Promise<string> {
    const result = await this.check(input, context);

    if (result.action === "block") {
      throw new GuardrailBlockedError(result.reasons);
    }

    return result.value;
  }
}

