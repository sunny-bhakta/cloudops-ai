export type AuditEventType =
  | "generation.started"
  | "generation.completed"
  | "generation.failed"
  | "tool.started"
  | "tool.completed"
  | "tool.failed"
  | "guardrail.blocked";

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  timestamp: string;

  requestId?: string;
  userId?: string;
  agentId?: string;

  provider?: string;
  model?: string;
  toolName?: string;

  input?: unknown;
  output?: unknown;
  metadata?: Record<string, unknown>;

  durationMs?: number;
  error?: {
    name: string;
    message: string;
  };
}

export interface AuditSink {
  write(event: AuditEvent): Promise<void>;
}

export interface AuditLoggerOptions {
  sink: AuditSink;
  redact?: (value: unknown) => unknown;
}

