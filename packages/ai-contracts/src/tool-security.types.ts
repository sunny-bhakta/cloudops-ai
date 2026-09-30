export type ToolPermission =
  | 'read'
  | 'incident:create'
  | 'deploy:trigger';

export type ToolRetryPolicy = {
  maxAttempts: number;
  backoffMs: number;
};

export type ToolSecurityContract = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  permission: ToolPermission;
  timeoutMs: number;
  retry: ToolRetryPolicy;
  idempotent: boolean;
  requiresApproval: boolean;
};