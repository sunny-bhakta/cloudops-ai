// import { Injectable } from '@nestjs/common';

// export interface AiMetricsSnapshot {
//   requests: {
//     total: number;
//     success: number;
//     failed: number;
//     blocked: number;
//   };

//   tools: {
//     total: number;
//     success: number;
//     failed: number;
//   };

//   latency: {
//     requestTotalMs: number;
//     toolTotalMs: number;
//   };
// }

// @Injectable()
// export class AiMetrics {
//   private requestTotal = 0;
//   private requestSuccess = 0;
//   private requestFailedCount = 0;
//   private requestBlocked = 0;

//   private toolTotal = 0;
//   private toolSuccess = 0;
//   private toolFailed = 0;

//   private requestTotalMs = 0;
//   private toolTotalMs = 0;

//   requestStarted(): void {
//     this.requestTotal++;
//   }

//   requestCompleted(
//     durationMs: number,
//     outcome: 'success' | 'blocked',
//   ): void {
//     this.requestTotalMs += durationMs;

//     if (outcome === 'success') {
//       this.requestSuccess++;
//     } else {
//       this.requestBlocked++;
//     }
//   }

//   requestFailed(durationMs: number): void {
//     this.requestTotalMs += durationMs;
//     this.requestFailedCount ++;
//   }

//   toolStarted(): void {
//     this.toolTotal++;
//   }

//   toolCompleted(
//     durationMs: number,
//     success: boolean,
//   ): void {
//     this.toolTotalMs += durationMs;

//     if (success) {
//       this.toolSuccess++;
//     } else {
//       this.toolFailed++;
//     }
//   }

//   snapshot(): AiMetricsSnapshot {
//     return {
//       requests: {
//         total: this.requestTotal,
//         success: this.requestSuccess,
//         failed: this.requestFailedCount,
//         blocked: this.requestBlocked,
//       },

//       tools: {
//         total: this.toolTotal,
//         success: this.toolSuccess,
//         failed: this.toolFailed,
//       },

//       latency: {
//         requestTotalMs: this.requestTotalMs,
//         toolTotalMs: this.toolTotalMs,
//       },
//     };
//   }
// }