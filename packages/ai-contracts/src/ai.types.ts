export interface ToolAction {
    tool: string;
    input: Record<string, unknown>;
    result: unknown;
}


export interface AiChatResponse {
  content: string;

  toolActions: ToolAction[];

  metadata: {
    requestId: string;
    safety: 'allowed' | 'blocked';
  };
}