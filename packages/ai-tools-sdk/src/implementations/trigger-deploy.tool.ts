import { tool } from '@langchain/core/tools';
import { z } from 'zod';

const triggerDeployInputSchema = z.object({
  service: z
    .string()
    .min(1)
    .describe('Name of the service to deploy'),

  environment: z
    .enum([
      'development',
      'staging',
      'production',
    ])
    .describe('Target deployment environment'),

  version: z
    .string()
    .min(1)
    .describe('Version, release tag, or commit to deploy'),
});

const createDeployment = async ({
  service,
  environment,
  version,
}: {
  service: string;
  environment:
    | 'development'
    | 'staging'
    | 'production';
  version: string;
}) => {
  // Simulate deployment creation.
  //
  // Replace this with your real DeploymentService
  // once the tool-calling flow is working.

  return new Promise<{
    id: string;
    service: string;
    environment: string;
    version: string;
    status: string;
  }>((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'deployment-id',
        service,
        environment,
        version,
        status: 'in_progress',
      });
    }, 1000);
  });
};

export const triggerDeployTool = tool(
  async ({
    service,
    environment,
    version,
  }) => {
    const deployment = await createDeployment({
      service,
      environment,
      version,
    });

    return JSON.stringify({
      deploymentId: deployment.id,
      service: deployment.service,
      environment: deployment.environment,
      version: deployment.version,
      status: deployment.status,
    });
  },
  {
    name: 'trigger_deploy',

    description:
      'Trigger a deployment for a CloudOps service. Requires the service name, target environment, and version to deploy.',

    schema: triggerDeployInputSchema,
  },
);

export type TriggerDeployInput =
  z.infer<typeof triggerDeployInputSchema>;
