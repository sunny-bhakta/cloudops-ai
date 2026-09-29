// import { Injectable } from '@nestjs/common';
// import { randomUUID } from 'node:crypto';

// import { PiiRedactionService } from '../../../../../packages/ai-guardrails/pii-redaction.service.js';
// import {
// 	AuditEvent,
// 	AuditStore,
// 	CreateAuditEventInput,
// } from './audit.types.js';

// class InMemoryAuditStore implements AuditStore {
// 	private readonly events: AuditEvent[] = [];
// 	private readonly maxEvents = 1000;

// 	async append(event: AuditEvent): Promise<void> {
// 		this.events.push(event);

// 		if (this.events.length > this.maxEvents) {
// 			this.events.splice(0, this.events.length - this.maxEvents);
// 		}
// 	}

// 	async listByCorrelationId(
// 		correlationId: string,
// 	): Promise<AuditEvent[]> {
// 		return this.events.filter(
// 			(event) => event.correlationId === correlationId,
// 		);
// 	}

// 	async listAll(limit = 100): Promise<AuditEvent[]> {
// 		return this.events.slice(-Math.max(1, limit));
// 	}
// }

// @Injectable()
// export class AuditService {
// 	private readonly store: AuditStore = new InMemoryAuditStore();

// 	constructor(
// 		private readonly piiRedactionService: PiiRedactionService,
// 	) {}

// 		async record<
// 			TData extends Record<string, unknown> = Record<string, unknown>,
// 		>(
// 		input: CreateAuditEventInput<TData>,
// 	): Promise<AuditEvent<TData>> {
// 		const event: AuditEvent<TData> = {
// 			id: randomUUID(),
// 			timestamp: new Date().toISOString(),
// 			correlationId: input.correlationId,
// 			eventType: input.eventType,
// 			actor: input.actor,
// 			data: this.piiRedactionService.redact(
// 				input.data,
// 			) as TData,
// 		};

// 		await this.store.append(event);

// 		return event;
// 	}

// 	async listByCorrelationId(
// 		correlationId: string,
// 	): Promise<AuditEvent[]> {
// 		return this.store.listByCorrelationId(correlationId);
// 	}

// 	async listRecent(limit = 100): Promise<AuditEvent[]> {
// 		return this.store.listAll(limit);
// 	}
// }
