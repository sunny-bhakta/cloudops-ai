export type AiRole =
  | 'viewer'
  | 'operator'
  | 'admin';

export type PolicyDecision =
  | 'ALLOW'
  | 'DENY'
  | 'REQUIRE_APPROVAL';

export type PolicyContext = {
  role: AiRole;
  toolName: string;
  environment?: 'dev' | 'stage' | 'prod';
};