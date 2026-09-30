export type AiRole =
  | 'operator'
  | 'admin'
  | 'viewer';

export interface AiRequestContext {
  requestId: string;
  role: AiRole;
}

export interface AiToolContext {
  request: AiRequestContext;
}

export interface AiToolDefinition {
  name: string;
  description: string;
  allowedRoles: AiRole[];
}


export interface AiTool<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  execute(input: TInput): Promise<TOutput>;
  permission: string;
  timeoutMs: number;
  retry: {
    maxAttempts: number;
  };
  idempotent: boolean;
}