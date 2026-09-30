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
