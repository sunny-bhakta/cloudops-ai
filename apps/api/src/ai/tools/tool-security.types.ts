// export type ToolPermission =
//   | 'read'
//   | 'incident:create'
//   | 'deploy:trigger';

// export type ToolRetryPolicy = {
//   maxAttempts: number;
//   backoffMs: number;
// };

// export type ToolSecurityContract = {
//   name: string;
//   description: string;

//   /**
//    * JSON-schema-like input definition.
//    * The actual validation will be implemented by each tool.
//    */
//   inputSchema: Record<string, unknown>;

//   /**
//    * Permission required to execute the tool.
//    */
//   permission: ToolPermission;

//   /**
//    * Maximum execution time.
//    */
//   timeoutMs: number;

//   /**
//    * Retry configuration.
//    */
//   retry: ToolRetryPolicy;

//   /**
//    * Whether the operation can safely be repeated.
//    */
//   idempotent: boolean;

//   /**
//    * Whether human approval is required before execution.
//    */
//   requiresApproval: boolean;
// };