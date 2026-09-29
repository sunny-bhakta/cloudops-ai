# Runbooks

Operational procedures for diagnosing and recovering the CloudOps AI Platform.

## Planned Runbooks

- ECS deployment failure
- ECS task failure
- ALB health check failure
- AI provider failure
- Secrets Manager failure
- High CPU or memory usage
- Application rollback

# Runbooks

Operational procedures for diagnosing and recovering the
CloudOps AI Platform.

## Available Runbooks

- [ECS Task Failure](./ecs-task-failure.md)
- [ALB Health Check Failure](./alb-health-check-failure.md)
- [AI Provider Failure](./ai-provider-failure.md)
- [Secrets Manager Failure](./secrets-manager-failure.md)
- [Deployment Rollback](./deployment-rollback.md)

## General Principles

1. Diagnose before changing infrastructure.
2. Never expose secrets in logs or incident reports.
3. Prefer rollback when a deployment is known to be the cause.
4. Verify `/health` after recovery.
5. Verify `/ai/chat` after recovery.
6. Document the incident and recovery actions.