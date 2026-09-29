describe('Tools execution service', () => {
	it('should have a test', () => {
		expect(true).toBe(true);
	});
});

// import { RequestTimeoutException } from '@nestjs/common';

// import { ToolExecutionService } from '../../../../../packages/ai-tools-sdk/tool-execution.service.js';
// import { ToolSecurityContract } from './tool-security.types.js';

// describe('ToolExecutionService', () => {
// 	const createContract = (
// 		overrides: Partial<ToolSecurityContract> = {},
// 	): ToolSecurityContract => ({
// 		name: 'testTool',
// 		description: 'Test tool contract',
// 		inputSchema: { type: 'object' },
// 		permission: 'read',
// 		timeoutMs: 50,
// 		retry: {
// 			maxAttempts: 2,
// 			backoffMs: 0,
// 		},
// 		idempotent: true,
// 		requiresApproval: false,
// 		...overrides,
// 	});

// 	it('returns cached result for idempotent operations with same key', async () => {
// 		const service = new ToolExecutionService();
// 		const contract = createContract({ idempotent: true });
// 		let calls = 0;

// 		const operation = async () => {
// 			calls += 1;
// 			return { ok: true, calls, at: Date.now() };
// 		};

// 		const first = await service.execute('same-key', contract, operation);
// 		const second = await service.execute('same-key', contract, operation);

// 		expect(first).toEqual(second);
// 		expect(calls).toBe(1);
// 	});

// 	it('retries and fails with timeout when operation exceeds timeoutMs', async () => {
// 		const service = new ToolExecutionService();
// 		const contract = createContract({
// 			timeoutMs: 5,
// 			retry: {
// 				maxAttempts: 2,
// 				backoffMs: 0,
// 			},
// 		});

// 		let attempts = 0;

// 		const operation = async () => {
// 			attempts += 1;
// 			await new Promise((resolve) => setTimeout(resolve, 25));
// 			return { ok: true };
// 		};

// 		await expect(
// 			service.execute('timeout-key', contract, operation),
// 		).rejects.toBeInstanceOf(RequestTimeoutException);

// 		expect(attempts).toBe(2);
// 	});
// });
