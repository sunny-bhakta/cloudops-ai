import type {
  AiRole,
  AiToolDefinition,
} from '@cloudops/ai-contracts';

import {
  getServiceHealthTool,
} from './implementations/get-service-health.tool.js';
import { triggerDeployTool } from './implementations/trigger-deploy.tool.js';
import { createIncidentTool } from './implementations/create-incident.tool.js';

import type { StructuredToolInterface } from '@langchain/core/tools';

export interface RegisteredTool {
  definition: AiToolDefinition;
  tool: StructuredToolInterface;
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

  {
    definition: {
      name: 'trigger_deploy',
      description:
        'Trigger a deployment for a CloudOps service and environment. Use this only when the requested service, environment, and deployment version are clearly specified.',
      allowedRoles: [
        'operator',
        'admin',
      ],
    },

    tool: triggerDeployTool,
  },

  {
    definition: {
      name: 'create_incident',
      description:
        'Create a CloudOps incident for a service. Use this when an operational incident needs to be formally recorded.',
      allowedRoles: [
        'operator',
        'admin',
      ],
    },

    tool: createIncidentTool,
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
