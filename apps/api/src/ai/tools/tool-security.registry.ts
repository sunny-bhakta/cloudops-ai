// import { ToolSecurityContract } from './tool-security.types.js';

// export const TOOL_SECURITY_CONTRACTS: Record<
//   string,
//   ToolSecurityContract
// > = {
//   getServiceHealth: {
//     name: 'getServiceHealth',
//     description: 'Read the health status of a service.',

//     inputSchema: {
//       type: 'object',
//       properties: {
//         service: {
//           type: 'string',
//         },
//       },
//       required: ['service'],
//     },

//     permission: 'read',

//     timeoutMs: 5_000,

//     retry: {
//       maxAttempts: 2,
//       backoffMs: 500,
//     },

//     idempotent: true,

//     requiresApproval: false,
//   },

//   createIncident: {
//     name: 'createIncident',
//     description: 'Create an operational incident.',

//     inputSchema: {
//       type: 'object',
//       properties: {
//         title: {
//           type: 'string',
//         },
//         description: {
//           type: 'string',
//         },
//         severity: {
//           type: 'string',
//           enum: ['low', 'medium', 'high', 'critical'],
//         },
//       },
//       required: ['title', 'description', 'severity'],
//     },

//     permission: 'incident:create',

//     timeoutMs: 10_000,

//     retry: {
//       maxAttempts: 2,
//       backoffMs: 1_000,
//     },

//     idempotent: true,

//     requiresApproval: false,
//   },

//   triggerDeploy: {
//     name: 'triggerDeploy',
//     description: 'Trigger a deployment for an approved service and version.',

//     inputSchema: {
//       type: 'object',
//       properties: {
//         service: {
//           type: 'string',
//         },
//         version: {
//           type: 'string',
//         },
//         environment: {
//           type: 'string',
//           enum: ['dev', 'stage', 'prod'],
//         },
//       },
//       required: ['service', 'version', 'environment'],
//     },

//     permission: 'deploy:trigger',

//     timeoutMs: 30_000,

//     retry: {
//       maxAttempts: 1,
//       backoffMs: 0,
//     },

//     idempotent: false,

//     requiresApproval: true,
//   },
// };