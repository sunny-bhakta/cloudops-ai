// import {
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';

// import { TOOL_SECURITY_CONTRACTS } from './tool-security.registry.js';
// import { ToolSecurityContract } from './tool-security.types.js';

// @Injectable()
// export class ToolSecurityService {
//   getContract(toolName: string): ToolSecurityContract {
//     const contract = TOOL_SECURITY_CONTRACTS[toolName];

//     if (!contract) {
//       throw new NotFoundException(
//         `Security contract not found for tool: ${toolName}`,
//       );
//     }

//     return contract;
//   }

//   hasContract(toolName: string): boolean {
//     return Boolean(TOOL_SECURITY_CONTRACTS[toolName]);
//   }

//   getAllContracts(): ToolSecurityContract[] {
//     return Object.values(TOOL_SECURITY_CONTRACTS);
//   }
// }