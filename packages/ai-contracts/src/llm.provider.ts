export type LlmRole =
  | 'system'
  | 'user'
  | 'assistant';

export interface LlmMessage {
  role: LlmRole;
  content: string;
}

export interface LlmRequest {
  messages: LlmMessage[];
  model?: string;
  temperature?: number;
}

export interface LlmUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface LlmResponse {
  content: string;
  model: string;
  usage?: LlmUsage;
}

export interface LlmProvider {
  generate(
    request: LlmRequest,
  ): Promise<LlmResponse>;
}
