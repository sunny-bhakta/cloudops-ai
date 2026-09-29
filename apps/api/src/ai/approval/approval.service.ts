// import {
//   BadRequestException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { randomUUID } from 'node:crypto';

// import {
//   ApprovalRequest,
//   ApprovalStatus,
// } from '../../../../../packages/ai-contracts/approval.types.js';

// @Injectable()
// export class ApprovalService {
//   private readonly requests = new Map<
//     string,
//     ApprovalRequest
//   >();

//   createRequest(input: {
//     requestId: string;
//     service: string;
//     version: string;
//     environment: 'dev' | 'stage' | 'prod';
//     requestedBy: string;
//   }): ApprovalRequest {
//     const approvalId = randomUUID();

//     const request: ApprovalRequest = {
//       approvalId,
//       requestId: input.requestId,
//       service: input.service,
//       version: input.version,
//       environment: input.environment,
//       requestedBy: input.requestedBy,
//       status: 'PENDING',
//       createdAt: new Date().toISOString(),
//     };

//     this.requests.set(approvalId, request);

//     return request;
//   }

//   getRequest(
//     approvalId: string,
//   ): ApprovalRequest {
//     const request =
//       this.requests.get(approvalId);

//     if (!request) {
//       throw new NotFoundException(
//         `Approval request not found: ${approvalId}`,
//       );
//     }

//     return request;
//   }

//   approve(
//     approvalId: string,
//   ): ApprovalRequest {
//     const request =
//       this.getRequest(approvalId);

//     this.ensurePending(request);

//     request.status = 'APPROVED';
//     request.approvedAt =
//       new Date().toISOString();

//     return request;
//   }

//   reject(
//     approvalId: string,
//     reason: string,
//   ): ApprovalRequest {
//     const request =
//       this.getRequest(approvalId);

//     this.ensurePending(request);

//     request.status = 'REJECTED';
//     request.rejectedAt =
//       new Date().toISOString();
//     request.rejectionReason = reason;

//     return request;
//   }

//   private ensurePending(
//     request: ApprovalRequest,
//   ): void {
//     if (request.status !== 'PENDING') {
//       throw new BadRequestException(
//         `Approval request is already ${request.status}`,
//       );
//     }
//   }
// }