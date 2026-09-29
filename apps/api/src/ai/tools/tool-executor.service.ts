// import {
//   BadRequestException,
//   Injectable,
// } from '@nestjs/common';

// import { PolicyService } from '../guardrails/policy.service.js';
// import { AiRole } from '../guardrails/policy.types.js';

// import { ToolExecutionService } from '../../../../../packages/ai-tools-sdk/tool-execution.service.js';
// import { ToolSecurityService } from './tool-security.service.js';
// import { ToolRegistry } from './tool-registry.js';

// @Injectable()
// export class ToolExecutorService {
//   constructor(
//     private readonly toolRegistry: ToolRegistry,
//     private readonly toolSecurityService: ToolSecurityService,
//     private readonly toolExecutionService: ToolExecutionService,
//     private readonly policyService: PolicyService,
//   ) {}

//   async execute(
//     toolName: string,
//     input: unknown,
//     role: AiRole,
//     idempotencyKey: string,
//   ): Promise<unknown> {
//     const tool =
//       this.toolRegistry.get(toolName);

//     if (!tool) {
//       throw new BadRequestException(
//         `Unknown AI tool: ${toolName}`,
//       );
//     }

//     const decision =
//       this.policyService.evaluate({
//         role,
//         toolName,
//       });

//     if (decision === 'DENY') {
//       throw new BadRequestException(
//         `Tool execution denied: ${toolName}`,
//       );
//     }

//     /*
//      * Tools requiring approval are allowed to create
//      * an approval request, but must not perform the
//      * protected operation.
//      */
//     if (decision === 'REQUIRE_APPROVAL') {
//       return tool.execute(input);
//     }

//     const contract =
//       this.toolSecurityService.getContract(
//         toolName,
//       );

//     return this.toolExecutionService.execute(
//       idempotencyKey,
//       contract,
//       () => tool.execute(input),
//     );
//   }
// }