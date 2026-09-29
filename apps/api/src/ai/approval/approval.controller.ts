// import {
//   Body,
//   Controller,
//   Get,
//   Param,
//   Post,
// } from '@nestjs/common';

// import { ApprovalService } from './approval.service.js';

// @Controller('ai/approvals')
// export class ApprovalController {
//   constructor(
//     private readonly approvalService: ApprovalService,
//   ) {}

//   @Get(':approvalId')
//   getApproval(
//     @Param('approvalId') approvalId: string,
//   ) {
//     return this.approvalService.getRequest(
//       approvalId,
//     );
//   }

//   @Post(':approvalId/approve')
//   approve(
//     @Param('approvalId') approvalId: string,
//   ) {
//     return this.approvalService.approve(
//       approvalId,
//     );
//   }

//   @Post(':approvalId/reject')
//   reject(
//     @Param('approvalId') approvalId: string,
//     @Body() body: { reason: string },
//   ) {
//     return this.approvalService.reject(
//       approvalId,
//       body.reason,
//     );
//   }
// }