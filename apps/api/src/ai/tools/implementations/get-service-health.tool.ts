// import { Injectable } from '@nestjs/common';

// import { AiTool } from '@cloudops/ai-contracts/tools';

// export interface ServiceHealthInput {
//   service: string;
// }

// export interface ServiceHealthOutput {
//   service: string;
//   status: 'healthy' | 'unhealthy';
//   timestamp: string;
// }

// @Injectable()
// export class GetServiceHealthTool
//   implements AiTool<ServiceHealthInput, ServiceHealthOutput>
// {
//   name = 'getServiceHealth';

//   description =
//     'Check the health status of an application service.';

//   inputSchema = {
//     type: 'object',
//     properties: {
//       service: {
//         type: 'string',
//         description: 'Name of the service to check',
//       },
//     },
//     required: ['service'],
//     additionalProperties: false,
//   };

//   permission = 'service:health:read';

//   timeoutMs = 3000;

//   retry = {
//     maxAttempts: 2,
//   };

//   idempotent = true;

//   async execute(
//     input: ServiceHealthInput,
//   ): Promise<ServiceHealthOutput> {
//     return {
//       service: input.service,
//       status: 'healthy',
//       timestamp: new Date().toISOString(),
//     };
//   }
// }