import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const getServiceHealthTool = tool(
  async ({ service }) => {
    // Replace this with your real service-health implementation.
    //
    // For now this simulates a health lookup.

    const healthyServices = new Set([
      'api',
      'payments',
      'database',
    ]);

    const healthy = healthyServices.has(service);

    return JSON.stringify({
      service,
      status: healthy ? 'healthy' : 'unknown',
      checkedAt: new Date().toISOString(),
    });
  },
  {
    name: 'get_service_health',

    description:
      'Get the current health status of a CloudOps service.',

    schema: z.object({
      service: z
        .string()
        .min(1)
        .describe('The service name to check'),
    }),
  },
);
