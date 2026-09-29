import Groq from 'groq-sdk';

import type {
  LlmProvider,
  LlmRequest,
  LlmResponse,
} from '@cloudops/ai-contracts';

export interface GroqProviderOptions {
  apiKey: string;
  defaultModel: string;
}

export class GroqProvider implements LlmProvider {
  private readonly client: Groq;
  private readonly defaultModel: string;

  constructor(options: GroqProviderOptions) {
    this.client = new Groq({
      apiKey: options.apiKey,
    });

    this.defaultModel = options.defaultModel;
  }

  async generate(request: LlmRequest): Promise<LlmResponse> {
    const response = await this.client.chat.completions.create({
      model: request.model ?? this.defaultModel,
      messages: request.messages,
      temperature: request.temperature,
    });

    const choice = response.choices[0];

    if (!choice?.message?.content) {
      throw new Error('Groq returned an empty response');
    }

    return {
      content: choice.message.content,
      model: response.model,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  }
}



// import { Injectable } from '@nestjs/common';
// import { ChatGroq } from '@langchain/groq';
// import type {
//   LlmProvider,
//   LlmRequest,
//   LlmResponse,
// } from '@cloudops/ai-contracts';

// @Injectable()
// export class GroqProvider implements LlmProvider {
//   private readonly model: ChatGroq;

//   constructor() {
//     console.log("1....", process.env.GROQ_API_KEY, " 2.....");
//     this.model = new ChatGroq({
//       model: 'openai/gpt-oss-20b',
//       temperature: 0,
//       apiKey: process.env.GROQ_API_KEY,
//     });
//   }

//   async chat(request: LlmRequest): Promise<LlmResponse> {
//     const response = await this.model.invoke([
//       {
//         role: 'system',
//         content:
//           request.systemPrompt ??
//           'You are a helpful AI assistant.',
//       },
//       {
//         role: 'user',
//         content: request.message,
//       },
//     ]);

//     return {
//       content:
//         typeof response.content === 'string'
//           ? response.content
//           : JSON.stringify(response.content),
//     };
//   }
// }


// // import { Injectable } from '@nestjs/common';
// // import { ChatGroq } from '@langchain/groq';
// // import {
// //   AIMessage,
// //   HumanMessage,
// //   SystemMessage,
// //   ToolMessage,
// // } from '@langchain/core/messages';

// // import {
// //   LlmMessage,
// //   LlmProvider,
// //   LlmRequest,
// //   LlmResponse,
// // } from '@cloudops/ai-contracts/llm-provider';

// // @Injectable()
// // export class GroqProvider implements LlmProvider {
// //   private model: ChatGroq | null = null;

// //   async chat(request: LlmRequest): Promise<LlmResponse> {
// //     const messages = request.messages.map((message) =>
// //       this.toLangChainMessage(message),
// //     );

// //     const llm = this.getModel();

// //     const model = request.tools?.length
// //       ? llm.bindTools(request.tools)
// //       : llm;

// //     const response = await model.invoke(messages);

// //     const toolCalls = response.tool_calls ?? [];

// //     return {
// //       content:
// //         typeof response.content === 'string'
// //           ? response.content
// //           : JSON.stringify(response.content),

// //       toolCalls: toolCalls.map((call) => ({
// //         id: call.id ?? crypto.randomUUID(),
// //         name: call.name,
// //         input: call.args as Record<string, unknown>,
// //       })),

// //       rawMessage: response,
// //     };
// //   }

// //   private toLangChainMessage(message: LlmMessage) {
// //     switch (message.role) {
// //       case 'system':
// //         return new SystemMessage(message.content);

// //       case 'user':
// //         return new HumanMessage(message.content);

// //       case 'assistant':
// //         return new AIMessage({
// //           content: message.content,

// //           tool_calls: (message.tool_calls ?? []).map(
// //             (call) => ({
// //               id: call.id,
// //               name: call.name,
// //               args: call.args,
// //             }),
// //           ),
// //         });

// //       case 'tool':
// //         return new ToolMessage({
// //           content: message.content,
// //           tool_call_id: message.tool_call_id!,
// //         });

// //       default:
// //         throw new Error(
// //           `Unsupported message role: ${message.role}`,
// //         );
// //     }
// //   }

// //   private getModel(): ChatGroq {
// //     if (this.model) {
// //       return this.model;
// //     }

// //     const apiKey = process.env.GROQ_API_KEY;

// //     if (!apiKey) {
// //       throw new Error(
// //         'Groq API key not found. Please set the GROQ_API_KEY environment variable or provide the key into "apiKey"',
// //       );
// //     }

// //     this.model = new ChatGroq({
// //       model: 'openai/gpt-oss-20b',
// //       temperature: 0,
// //       apiKey,
// //     });

// //     return this.model;
// //   }
// // }