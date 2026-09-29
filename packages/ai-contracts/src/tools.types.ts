// export interface AiTool<TInput = unknown, TOutput = unknown> {
//   name: string;

//   description: string;

//   inputSchema: Record<string, unknown>;

//   execute(input: TInput): Promise<TOutput>;

//   permission: string;

//   timeoutMs: number;

//   retry: {
//     maxAttempts: number;
//   };

//   idempotent: boolean;
// }