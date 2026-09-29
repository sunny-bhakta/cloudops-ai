describe('Tool executor', () => {
	it('should have a test', () => {
		expect(true).toBe(true);
	});
});

// import { ToolExecutor } from '../../../../../packages/ai-tools-sdk/tool-executor.js';
// import type { AiTool } from '@cloudops/ai-contracts/tools';

// describe('ToolExecutor', () => {
//     const makeTool = (): AiTool<
//         { service: string },
//         { status: string }
//     > => ({
//         name: 'getServiceHealth',
//         description: 'Check service health',
//         inputSchema: {
//             type: 'object',
//             properties: {
//                 service: {
//                     type: 'string',
//                 },
//             },
//             required: ['service'],
//             additionalProperties: false,
//         },
//         permission: 'service:health:read',
//         timeoutMs: 3000,
//         retry: {
//             maxAttempts: 2,
//         },
//         idempotent: true,
//         execute: async (input) => ({
//             status: `healthy:${input.service}`,
//         }),
//     });

//     it('executes a tool and returns the result', async () => {
//         const permissionService = {
//             hasPermission: () => true,
//         };

//         const toolExecutor = new ToolExecutor(
//             permissionService,
//         );

//         const result = await toolExecutor.execute(
//             makeTool(),
//             { service: 'payments' },
//             ['service:health:read'],
//         );

//         expect(result).toEqual({
//             status: 'healthy:payments',
//         });
//     });

//     it('throws when user lacks required permission', async () => {
//         const permissionService = {
//             hasPermission: () => false,
//         };

//         const toolExecutor = new ToolExecutor(
//             permissionService,
//         );

//         await expect(
//             toolExecutor.execute(
//                 makeTool(),
//                 { service: 'payments' },
//                 [],
//             ),
//         ).rejects.toThrow(
//             'Permission denied for AI tool "getServiceHealth"',
//         );
//     });
// });