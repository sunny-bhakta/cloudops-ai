// export type AuditActorRole =
// 	| 'admin'
// 	| 'operator'
// 	| 'viewer'
// 	| 'system';

// export type AuditEventType =
// 	| 'AI_REQUEST_STARTED'
// 	| 'AI_REQUEST_BLOCKED'
// 	| 'AI_TOOL_EXECUTED'
// 	| 'AI_REQUEST_COMPLETED'
// 	| 'AI_REQUEST_FAILED';

// export interface AuditActor {
// 	id: string;
// 	role: AuditActorRole;
// }

// export interface AuditEvent<
// 	TData extends Record<string, unknown> = Record<string, unknown>,
// > {
// 	id: string;
// 	timestamp: string;
// 	correlationId: string;
// 	eventType: AuditEventType;
// 	actor: AuditActor;
// 	data: TData;
// }

// export interface CreateAuditEventInput<
// 	TData extends Record<string, unknown> = Record<string, unknown>,
// > {
// 	correlationId: string;
// 	eventType: AuditEventType;
// 	actor: AuditActor;
// 	data: TData;
// }

// export interface AuditStore {
// 	append(event: AuditEvent): Promise<void>;
// 	listByCorrelationId(
// 		correlationId: string,
// 	): Promise<AuditEvent[]>;
// 	listAll(limit?: number): Promise<AuditEvent[]>;
// }
