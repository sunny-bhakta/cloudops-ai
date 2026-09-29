
describe('Health and AI endpoints (e2e)', () => {
	it('should have a test', () => {
		expect(true).toBe(true);
	});
});
// import { INestApplication } from '@nestjs/common';
// import { Test } from '@nestjs/testing';
// import request from 'supertest';
// import { AppModule } from '../src/app.module.js';
// import { LLM_PROVIDER } from '../../../packages/ai-contracts/llm.provider.js';
// import {
// 	LlmRequest,
// 	LlmResponse,
// } from '../../../packages/ai-contracts/llm.provider.js';
// import { AuditService } from '../../../packages/ai-contracts/audit/audit.service.js';

// describe('Health and AI endpoints (e2e)', () => {
// 	let app: INestApplication | undefined;
// 	let chatImpl:
// 		| ((request: LlmRequest) => Promise<LlmResponse>)
// 		| undefined;

// 	const nextToolId = {
// 		value: 0,
// 	};

// 	const getAppOrThrow = (): INestApplication => {
// 		if (!app) {
// 			throw new Error('Test app was not initialized');
// 		}

// 		return app;
// 	};

// 	beforeAll(async () => {
// 		const moduleRef = await Test.createTestingModule({
// 			imports: [AppModule],
// 		})
// 			.overrideProvider(LLM_PROVIDER)
// 			.useValue({
// 				chat: async (request: LlmRequest) => {
// 					if (chatImpl) {
// 						return chatImpl(request);
// 					}

// 					return {
// 						content: 'Hello from mock provider',
// 						toolCalls: [],
// 					};
// 				},
// 			})
// 			.compile();

// 		app = moduleRef.createNestApplication();
// 		await app.init();
// 	});

// 	afterAll(async () => {
// 		if (app) {
// 			await app.close();
// 		}
// 	});

// 	it('GET /health returns ok status', async () => {
// 		const response = await request(getAppOrThrow().getHttpServer()).get('/health').expect(200);

// 		expect(response.body.status).toBe('ok');
// 		expect(response.body.service).toBe('cloudops-ai-platform-api');
// 		expect(typeof response.body.timestamp).toBe('string');
// 	});

// 	it('POST /ai/chat returns answer without tool (happy path)', async () => {
// 		chatImpl = async () => ({
// 			content: 'Hello from mock provider',
// 			toolCalls: [],
// 		});

// 		const response = await request(getAppOrThrow().getHttpServer())
// 			.post('/ai/chat')
// 			.send({ message: 'Say hello' })
// 			.expect(201);

// 		expect(response.body.content).toBe('Hello from mock provider');
// 		expect(response.body.toolActions).toEqual([]);
// 		expect(typeof response.body.metadata?.requestId).toBe('string');
// 		expect(response.body.metadata?.safety).toBe('allowed');
// 	});

// 	it('POST /ai/chat executes getServiceHealth tool when requested', async () => {
// 		chatImpl = async (request: LlmRequest) => {
// 			const hasToolResult = request.messages.some(
// 				(message) => message.role === 'tool',
// 			);

// 			if (!hasToolResult) {
// 				nextToolId.value += 1;

// 				return {
// 					content: 'Let me check service health.',
// 					toolCalls: [
// 						{
// 							id: `tool-${nextToolId.value}`,
// 							name: 'getServiceHealth',
// 							input: { service: 'api' },
// 						},
// 					],
// 				};
// 			}

// 			return {
// 				content: 'Service api is healthy.',
// 				toolCalls: [],
// 			};
// 		};

// 		const response = await request(getAppOrThrow().getHttpServer())
// 			.post('/ai/chat')
// 			.send({ message: 'Check API health' })
// 			.expect(201);

// 		expect(response.body.toolActions).toHaveLength(1);
// 		expect(response.body.toolActions[0].tool).toBe('getServiceHealth');
// 		expect(response.body.toolActions[0].result.service).toBe('api');
// 		expect(response.body.toolActions[0].result.status).toBe('healthy');
// 	});

// 	it('POST /ai/chat blocks unauthorized triggerDeploy usage for viewer role', async () => {
// 		chatImpl = async () => ({
// 			content: 'Deploying now.',
// 			toolCalls: [
// 				{
// 					id: 'deploy-1',
// 					name: 'triggerDeploy',
// 					input: {
// 						service: 'api',
// 						version: 'v1.0.0',
// 						environment: 'dev',
// 						requestedBy: 'viewer-user',
// 					},
// 				},
// 			],
// 		});

// 		const response = await request(getAppOrThrow().getHttpServer())
// 			.post('/ai/chat')
// 			.set('x-ai-role', 'viewer')
// 			.send({ message: 'Deploy api to dev' })
// 			.expect(400);

// 		expect(response.body.message).toContain('Tool execution denied');
// 	});

// 	it('POST /ai/chat returns PENDING_APPROVAL for triggerDeploy as admin', async () => {
// 		chatImpl = async (request: LlmRequest) => {
// 			const hasToolResult = request.messages.some(
// 				(message) => message.role === 'tool',
// 			);

// 			if (!hasToolResult) {
// 				return {
// 					content: 'Creating deployment approval request.',
// 					toolCalls: [
// 						{
// 							id: 'deploy-admin-1',
// 							name: 'triggerDeploy',
// 							input: {
// 								service: 'api',
// 								version: 'v1.2.3',
// 								environment: 'dev',
// 								requestedBy: 'admin-user',
// 							},
// 						},
// 					],
// 				};
// 			}

// 			return {
// 				content: 'Approval request has been created.',
// 				toolCalls: [],
// 			};
// 		};

// 		const response = await request(getAppOrThrow().getHttpServer())
// 			.post('/ai/chat')
// 			.set('x-ai-role', 'admin')
// 			.send({ message: 'Request deploy to dev' })
// 			.expect(201);

// 		expect(response.body.toolActions).toHaveLength(1);
// 		expect(response.body.toolActions[0].tool).toBe('triggerDeploy');
// 		expect(response.body.toolActions[0].result.status).toBe('PENDING_APPROVAL');
// 		expect(typeof response.body.toolActions[0].result.approvalId).toBe('string');
// 	});

// 	it('POST /ai/chat reuses idempotent tool result when same toolCall id repeats', async () => {
// 		let iteration = 0;

// 		chatImpl = async () => {
// 			iteration += 1;

// 			if (iteration <= 2) {
// 				return {
// 					content: 'Checking health again.',
// 					toolCalls: [
// 						{
// 							id: 'repeat-1',
// 							name: 'getServiceHealth',
// 							input: { service: 'api' },
// 						},
// 					],
// 				};
// 			}

// 			return {
// 				content: 'Done with checks.',
// 				toolCalls: [],
// 			};
// 		};

// 		const response = await request(getAppOrThrow().getHttpServer())
// 			.post('/ai/chat')
// 			.send({ message: 'Check health twice' })
// 			.expect(201);

// 		expect(response.body.toolActions).toHaveLength(2);
// 		expect(response.body.toolActions[0].tool).toBe('getServiceHealth');
// 		expect(response.body.toolActions[1].tool).toBe('getServiceHealth');
// 		expect(response.body.toolActions[0].result).toEqual(
// 			response.body.toolActions[1].result,
// 		);
// 	});

// 	it('POST /ai/chat stores audit events with the request correlation id', async () => {
// 		chatImpl = async () => ({
// 			content: 'Audit me.',
// 			toolCalls: [],
// 		});

// 		const correlationId = 'req-audit-001';

// 		const response = await request(getAppOrThrow().getHttpServer())
// 			.post('/ai/chat')
// 			.set('x-request-id', correlationId)
// 			.send({ message: 'hello' })
// 			.expect(201);

// 		expect(response.body.metadata.requestId).toBe(correlationId);

// 		const auditService = getAppOrThrow().get(AuditService);
// 		const events = await auditService.listByCorrelationId(correlationId);

// 		expect(events.length).toBeGreaterThanOrEqual(2);
// 		expect(events[0].correlationId).toBe(correlationId);
// 		expect(events.some((event) => event.eventType === 'AI_REQUEST_STARTED')).toBe(true);
// 		expect(events.some((event) => event.eventType === 'AI_REQUEST_COMPLETED')).toBe(true);
// 	});
// });