// export const DEPLOYMENT_POLICY = {
//   services: [
//     'cloudops-ai-platform-api',
//   ],

//   environments: [
//     'dev',
//     'stage',
//     'prod',
//   ],
// };

// export function validateDeploymentTarget(
//   service: string,
//   environment: 'dev' | 'stage' | 'prod',
// ): void {
//   if (
//     !DEPLOYMENT_POLICY.services.includes(service)
//   ) {
//     throw new Error(
//       `Deployment service is not allowed: ${service}`,
//     );
//   }

//   if (
//     !DEPLOYMENT_POLICY.environments.includes(
//       environment,
//     )
//   ) {
//     throw new Error(
//       `Deployment environment is not allowed: ${environment}`,
//     );
//   }
// }