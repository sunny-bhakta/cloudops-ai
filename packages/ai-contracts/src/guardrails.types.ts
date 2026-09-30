export type GuardrailAction =
  | "allow"
  | "block"
  | "sanitize";

export interface GuardrailContext {
  requestId?: string;
  userId?: string;
  agentId?: string;
  toolName?: string;
  metadata?: Record<string, unknown>;
}

export interface GuardrailResult {
  action: GuardrailAction;
  value: string;

  reasons: string[];

  metadata?: Record<string, unknown>;
}

export interface Guardrail {
  name: string;

  check(
    input: string,
    context?: GuardrailContext,
  ): Promise<GuardrailResult>;
}

export interface GuardrailEngineOptions {
  guardrails: Guardrail[];
  mode?: "all" | "first-block";
}