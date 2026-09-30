import { tool } from '@langchain/core/tools';
import { z } from 'zod';

const createIncidentInputSchema = z.object({
  service: z
    .string()
    .min(1)
    .describe('Affected CloudOps service'),

  title: z
    .string()
    .min(1)
    .max(200)
    .describe('Short incident title'),

  description: z
    .string()
    .min(1)
    .describe('Description of the incident'),

  severity: z
    .enum([
      'low',
      'medium',
      'high',
      'critical',
    ])
    .describe('Incident severity'),

  environment: z
    .enum([
      'development',
      'staging',
      'production',
    ])
    .describe('Affected environment'),
});

const createIncident = async ({
  service,
  title,
  description,
  severity,
  environment,
}: {
  service: string;
  title: string;
  description: string;
  severity:
    | 'low'
    | 'medium'
    | 'high'
    | 'critical';
  environment:
    | 'development'
    | 'staging'
    | 'production';
}) => {
  // Simulate incident creation.
  //
  // Replace this with your real IncidentService/API.

  return new Promise<{
    id: string;
    service: string;
    title: string;
    description: string;
    severity: string;
    environment: string;
    status: string;
  }>((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'incident-id',
        service,
        title,
        description,
        severity,
        environment,
        status: 'open',
      });
    }, 1000);
  });
};

export const createIncidentTool = tool(
  async ({
    service,
    title,
    description,
    severity,
    environment,
  }) => {
    const incident = await createIncident({
      service,
      title,
      description,
      severity,
      environment,
    });

    return JSON.stringify({
      incidentId: incident.id,
      service: incident.service,
      title: incident.title,
      severity: incident.severity,
      environment: incident.environment,
      status: incident.status,
    });
  },
  {
    name: 'create_incident',

    description:
      'Create an operational incident for a CloudOps service. Use this when a service issue needs to be formally recorded.',

    schema: createIncidentInputSchema,
  },
);

export type CreateIncidentInput =
  z.infer<typeof createIncidentInputSchema>;
