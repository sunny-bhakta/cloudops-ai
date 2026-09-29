// import { Injectable } from '@nestjs/common';
// import { randomUUID } from 'node:crypto';

// import { ApprovalService } from '../../approval/approval.service.js';
// import { validateDeploymentTarget } from '../deployment-policy.js';
// import { AiTool } from '@cloudops/ai-contracts/tools';

// export type TriggerDeployInput = {
//   service: string;
//   version: string;
//   environment: 'dev' | 'stage' | 'prod';
//   requestedBy: string;
// };

// export type DeploymentRequest = {
//   requestId: string;
//   approvalId: string;
//   service: string;
//   version: string;
//   environment: 'dev' | 'stage' | 'prod';
//   status: 'PENDING_APPROVAL';
// };

// @Injectable()
// export class TriggerDeployTool
//   implements AiTool<TriggerDeployInput, DeploymentRequest>
// {
//   readonly name = 'triggerDeploy';

//   readonly description =
//     'Creates a deployment request that requires human approval before execution.';

//   readonly inputSchema = {
//     type: 'object',
//     properties: {
//       service: { type: 'string' },
//       version: { type: 'string' },
//       environment: {
//         type: 'string',
//         enum: ['dev', 'stage', 'prod'],
//       },
//       requestedBy: { type: 'string' },
//     },
//     required: [
//       'service',
//       'version',
//       'environment',
//       'requestedBy',
//     ],
//     additionalProperties: false,
//   };

//   readonly permission = 'deploy:trigger';

//   readonly timeoutMs = 5000;

//   readonly retry = {
//     maxAttempts: 1,
//   };

//   readonly idempotent = true;

//   constructor(
//     private readonly approvalService: ApprovalService,
//   ) {}

//   async execute(
//     deployment: TriggerDeployInput,
//   ): Promise<DeploymentRequest> {

//     validateDeploymentTarget(
//       deployment.service,
//       deployment.environment,
//     );

//     const requestId = randomUUID();

//     const approval =
//       this.approvalService.createRequest({
//         requestId,
//         service: deployment.service,
//         version: deployment.version,
//         environment: deployment.environment,
//         requestedBy: deployment.requestedBy,
//       });

//     return {
//       requestId,
//       approvalId: approval.approvalId,
//       service: deployment.service,
//       version: deployment.version,
//       environment: deployment.environment,
//       status: 'PENDING_APPROVAL',
//     };
//   }
// }