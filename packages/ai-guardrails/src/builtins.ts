import type {
  Guardrail,
  GuardrailContext,
  GuardrailResult
} from "@cloudops/ai-contracts";

export interface PatternGuardrailOptions {
  name: string;
  patterns: Array<{
    pattern: RegExp;
    reason: string;
  }>;
}

export class PatternGuardrail implements Guardrail {
  readonly name: string;

  private readonly patterns: PatternGuardrailOptions["patterns"];

  constructor(options: PatternGuardrailOptions) {
    this.name = options.name;
    this.patterns = options.patterns;
  }

  async check(
    input: string,
    _context?: GuardrailContext,
  ): Promise<GuardrailResult> {
    const matches = this.patterns.filter(({ pattern }) => {
      pattern.lastIndex = 0;
      return pattern.test(input);
    });

    if (matches.length === 0) {
      return {
        action: "allow",
        value: input,
        reasons: []
      };
    }

    return {
      action: "block",
      value: input,
      reasons: matches.map((match) => match.reason),
      metadata: {
        guardrail: this.name
      }
    };
  }
}

export interface RedactionRule {
  name: string;
  pattern: RegExp;
  replacement: string;
}

export class RedactionGuardrail implements Guardrail {
  readonly name = "sensitive-data-redaction";

  constructor(
    private readonly rules: RedactionRule[],
  ) {}

  async check(
    input: string,
    _context?: GuardrailContext,
  ): Promise<GuardrailResult> {
    let value = input;
    const reasons: string[] = [];

    for (const rule of this.rules) {
      rule.pattern.lastIndex = 0;

      if (rule.pattern.test(value)) {
        rule.pattern.lastIndex = 0;
        value = value.replace(rule.pattern, rule.replacement);

        reasons.push(`Redacted ${rule.name}`);
      }
    }

    if (value === input) {
      return {
        action: "allow",
        value: input,
        reasons: []
      };
    }

    return {
      action: "sanitize",
      value,
      reasons
    };
  }
}

export const defaultSensitiveDataGuardrail =
  new RedactionGuardrail([
    {
      name: "email address",
      pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      replacement: "[REDACTED_EMAIL]"
    },
    {
      name: "phone number",
      pattern: /\b(?:\+?\d[\d\s().-]{7,}\d)\b/g,
      replacement: "[REDACTED_PHONE]"
    }
  ]);

export const defaultPromptInjectionGuardrail =
  new PatternGuardrail({
    name: "prompt-injection",
    patterns: [
      {
        pattern: /ignore\s+(all\s+)?previous\s+instructions/i,
        reason: "Detected instruction override attempt"
      },
      {
        pattern: /ignore\s+(the\s+)?system\s+message/i,
        reason: "Detected system-message override attempt"
      },
      {
        pattern: /reveal\s+(your\s+)?system\s+prompt/i,
        reason: "Detected system prompt extraction attempt"
      }
    ]
  });
