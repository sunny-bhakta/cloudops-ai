export class GuardrailBlockedError extends Error {
  readonly code = "AI_GUARDRAIL_BLOCKED";

  constructor(
    public readonly reasons: string[],
  ) {
    super(
      reasons.length > 0
        ? `AI request blocked: ${reasons.join("; ")}`
        : "AI request blocked by guardrail",
    );

    this.name = "GuardrailBlockedError";
  }
}
