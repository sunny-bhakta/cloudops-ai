// import { Injectable } from '@nestjs/common';
// import { PiiRedactionService } from '../../../../../packages/ai-guardrails/pii-redaction.service.js';

// export interface AiLogContext {
//   requestId: string;
//   userId?: string;
//   tenantId?: string;
// }

// @Injectable()
// export class AiLogger {
//   constructor(
//     private readonly piiRedaction: PiiRedactionService,
//   ) {}

//   requestStarted(
//     context: AiLogContext,
//     message: string,
//   ): void {
//     this.write('ai.request.started', {
//       ...context,
//       message: this.piiRedaction.redact(message),
//     });
//   }

//   toolExecuted(
//     context: AiLogContext,
//     tool: string,
//     input: unknown,
//     result: unknown,
//   ): void {
//     this.write('ai.tool.executed', {
//       ...context,
//       tool,
//       input: this.piiRedaction.redact(input),
//       result: this.piiRedaction.redact(result),
//     });
//   }

//   requestCompleted(
//     context: AiLogContext,
//     outcome: string,
//   ): void {
//     this.write('ai.request.completed', {
//       ...context,
//       outcome,
//     });
//   }

//   requestFailed(
//     context: AiLogContext,
//     error: unknown,
//   ): void {
//     this.write('ai.request.failed', {
//       ...context,
//       error: this.piiRedaction.redact(
//         error instanceof Error
//           ? error.message
//           : error,
//       ),
//     });
//   }

//   private write(
//     event: string,
//     data: Record<string, unknown>,
//   ): void {
//     console.log(
//       JSON.stringify({
//         timestamp: new Date().toISOString(),
//         event,
//         ...data,
//       }),
//     );
//   }
// }