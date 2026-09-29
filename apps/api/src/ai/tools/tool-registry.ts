// import { Injectable } from '@nestjs/common';

// import { GetServiceHealthTool } from './implementations/get-service-health.tool.js';
// import { TriggerDeployTool } from './implementations/trigger-deploy.tool.js';
// import { AiTool } from '@cloudops/ai-contracts/tools';

// @Injectable()
// export class ToolRegistry {
//   private readonly tools = new Map<string, AiTool>();

//   constructor(
//     private readonly getServiceHealthTool: GetServiceHealthTool,
//     private readonly triggerDeployTool: TriggerDeployTool,
//   ) {
//     this.register(getServiceHealthTool);
//     this.register(triggerDeployTool);
//   }

//   register(tool: AiTool): void {
//     this.tools.set(tool.name, tool);
//   }

//   get(name: string): AiTool | undefined {
//     return this.tools.get(name);
//   }

//   has(name: string): boolean {
//     return this.tools.has(name);
//   }

//   list(): string[] {
//     return Array.from(this.tools.keys());
//   }
// }