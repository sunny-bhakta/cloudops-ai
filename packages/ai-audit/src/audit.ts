import type { AuditEvent, AuditSink, AuditLoggerOptions } from "@cloudops/ai-contracts";


function createId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function defaultRedact(value: unknown): unknown {
    return value;
}

export class AuditLogger {
    private readonly sink: AuditSink;
    private readonly redact: (value: unknown) => unknown;

    constructor(options: AuditLoggerOptions) {
        this.sink = options.sink;
        this.redact = options.redact ?? defaultRedact;
    }

    async log(
        event: Omit<AuditEvent, "id" | "timestamp">,
    ): Promise<AuditEvent> {
        const auditEvent: AuditEvent = {
            ...event,
            id: createId(),
            timestamp: new Date().toISOString(),
            input:
                event.input === undefined ? undefined : this.redact(event.input),
            output:
                event.output === undefined ? undefined : this.redact(event.output),
            metadata:
                event.metadata === undefined
                    ? undefined
                    : (this.redact(event.metadata) as Record<string, unknown>)
        };

        await this.sink.write(auditEvent);

        return auditEvent;
    }

    async generationStarted(params: {
        requestId?: string;
        userId?: string;
        agentId?: string;
        provider?: string;
        model?: string;
        input?: unknown;
        metadata?: Record<string, unknown>;
    }): Promise<AuditEvent> {
        return this.log({
            type: "generation.started",
            ...params
        });
    }

    async generationCompleted(params: {
        requestId?: string;
        provider?: string;
        model?: string;
        output?: unknown;
        durationMs?: number;
        metadata?: Record<string, unknown>;
    }): Promise<AuditEvent> {
        return this.log({
            type: "generation.completed",
            ...params
        });
    }

    async generationFailed(params: {
        requestId?: string;
        provider?: string;
        model?: string;
        durationMs?: number;
        error: Error;
        metadata?: Record<string, unknown>;
    }): Promise<AuditEvent> {
        return this.log({
            type: "generation.failed",
            requestId: params.requestId,
            provider: params.provider,
            model: params.model,
            durationMs: params.durationMs,
            metadata: params.metadata,
            error: {
                name: params.error.name,
                message: params.error.message
            }
        });
    }

    async toolStarted(params: {
        requestId?: string;
        toolName: string;
        input?: unknown;
        metadata?: Record<string, unknown>;
    }): Promise<AuditEvent> {
        return this.log({
            type: "tool.started",
            ...params
        });
    }

    async toolCompleted(params: {
        requestId?: string;
        toolName: string;
        output?: unknown;
        durationMs?: number;
        metadata?: Record<string, unknown>;
    }): Promise<AuditEvent> {
        return this.log({
            type: "tool.completed",
            ...params
        });
    }

    async toolFailed(params: {
        requestId?: string;
        toolName: string;
        durationMs?: number;
        error: Error;
        metadata?: Record<string, unknown>;
    }): Promise<AuditEvent> {
        return this.log({
            type: "tool.failed",
            requestId: params.requestId,
            toolName: params.toolName,
            durationMs: params.durationMs,
            metadata: params.metadata,
            error: {
                name: params.error.name,
                message: params.error.message
            }
        });
    }

    async guardrailBlocked(params: {
        requestId?: string;
        input?: unknown;
        metadata?: Record<string, unknown>;
    }): Promise<AuditEvent> {
        return this.log({
            type: "guardrail.blocked",
            ...params
        });
    }
}

/**
 * Simple sink useful during development.
 */
export class ConsoleAuditSink implements AuditSink {
    async write(event: AuditEvent): Promise<void> {
        console.log("[AI AUDIT]", JSON.stringify(event));
    }
}

/**
 * In-memory sink useful for tests.
 */
export class MemoryAuditSink implements AuditSink {
    readonly events: AuditEvent[] = [];

    async write(event: AuditEvent): Promise<void> {
        this.events.push(event);
    }

    clear(): void {
        this.events.length = 0;
    }
}
