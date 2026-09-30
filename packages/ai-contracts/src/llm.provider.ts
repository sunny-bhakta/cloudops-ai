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
  systemPrompt?: string;
}

export interface LlmUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface LlmResponse {
  content: string | null;
  model: string;
  usage?: LlmUsage;
  toolCalls?: {
    id: string;
    name: string;
    arguments:string;
    // tool: string;
    // input: Record<string, unknown>;
    // result: unknown;
  }[] | undefined;
}

export interface LlmProvider {
  // TODO instead of tool:any use generinc type defined in another package
  generate(request: LlmRequest, tools: any): Promise<LlmResponse>;
  // chat(request: LlmRequest): Promise<LlmResponse>;
}
