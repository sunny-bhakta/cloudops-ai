import type {
  AiRole,
  AiToolDefinition,
} from '@cloudops/ai-contracts';

import {
  getServiceHealthTool,
} from './implementations/get-service-health.tool.js';

export interface RegisteredTool {
  definition: AiToolDefinition;
  tool: typeof getServiceHealthTool;
}

const registeredTools: RegisteredTool[] = [
  {
    definition: {
      name: 'get_service_health',
      description:
        'Get the current health status of a CloudOps service.',
      allowedRoles: [
        'operator',
        'admin',
      ],
    },

    tool: getServiceHealthTool,
  },
];

export class ToolRegistry {
  getAll(): RegisteredTool[] {
    return registeredTools;
  }

  getAllowedForRole(
    role: AiRole,
  ): RegisteredTool[] {
    return registeredTools.filter((registeredTool) =>
      registeredTool.definition.allowedRoles.includes(role),
    );
  }

  getByName(
    name: string,
  ): RegisteredTool | undefined {
    return registeredTools.find(
      (registeredTool) =>
        registeredTool.definition.name === name,
    );
  }
}
