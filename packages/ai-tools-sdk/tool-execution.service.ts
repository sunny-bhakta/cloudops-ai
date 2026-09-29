// import {
//   Injectable,
//   RequestTimeoutException,
// } from '@nestjs/common';

// import {
//   ToolSecurityContract,
// } from '../../apps/api/src/ai/tools/tool-security.types.js';

// @Injectable()
// export class ToolExecutionService {
//   private readonly results = new Map<
//     string,
//     unknown
//   >();

//   async execute<T>(
//     idempotencyKey: string,
//     contract: ToolSecurityContract,
//     operation: () => Promise<T>,
//   ): Promise<T> {
//     if (contract.idempotent) {
//       const existing =
//         this.results.get(idempotencyKey);

//       if (existing !== undefined) {
//         return existing as T;
//       }
//     }

//     let lastError: unknown;

//     for (
//       let attempt = 1;
//       attempt <= contract.retry.maxAttempts;
//       attempt++
//     ) {
//       try {
//         const result =
//           await this.withTimeout(
//             operation(),
//             contract.timeoutMs,
//           );

//         if (contract.idempotent) {
//           this.results.set(
//             idempotencyKey,
//             result,
//           );
//         }

//         return result;
//       } catch (error) {
//         lastError = error;

//         if (
//           attempt <
//           contract.retry.maxAttempts
//         ) {
//           await this.sleep(
//             contract.retry.backoffMs,
//           );
//         }
//       }
//     }

//     throw lastError;
//   }

//   private async withTimeout<T>(
//     promise: Promise<T>,
//     timeoutMs: number,
//   ): Promise<T> {
//     let timeoutHandle: NodeJS.Timeout | undefined;

//     try {
//       return await Promise.race([
//         promise,
//         new Promise<T>((_, reject) => {
//           timeoutHandle = setTimeout(() => {
//             reject(
//               new RequestTimeoutException(
//                 `Tool execution timed out after ${timeoutMs}ms`,
//               ),
//             );
//           }, timeoutMs);
//         }),
//       ]);
//     } finally {
//       if (timeoutHandle) {
//         clearTimeout(timeoutHandle);
//       }
//     }
//   }

//   private async sleep(
//     milliseconds: number,
//   ): Promise<void> {
//     if (milliseconds <= 0) {
//       return;
//     }

//     await new Promise((resolve) =>
//       setTimeout(resolve, milliseconds),
//     );
//   }
// }