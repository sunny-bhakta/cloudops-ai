import { Injectable } from '@nestjs/common';

@Injectable()
export class PiiRedactionService {
  redact(value: unknown): unknown {
    if (typeof value === 'string') {
      return this.redactString(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.redact(item));
    }

    if (value && typeof value === 'object') {
      const result: Record<string, unknown> = {};

      for (const [key, item] of Object.entries(
        value as Record<string, unknown>,
      )) {
        if (this.isSensitiveKey(key)) {
          result[key] = '[REDACTED]';
        } else {
          result[key] = this.redact(item);
        }
      }

      return result;
    }

    return value;
  }

  private redactString(value: string): string {
    return value
      .replace(
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
        '[REDACTED_EMAIL]',
      )
      .replace(
        /\b(?:\+?\d{1,3}[-.\s]?)?\d{10}\b/g,
        '[REDACTED_PHONE]',
      );
  }

  private isSensitiveKey(key: string): boolean {
    return /password|token|secret|api[-_]?key|authorization|cookie/i.test(
      key,
    );
  }
}