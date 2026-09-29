# Runbook: ECS Task Failure

## Symptoms

- ECS desired count is greater than running count.
- ECS task repeatedly stops.
- ALB target becomes unhealthy.

## Step 1 — Check ECS service

```bash
aws ecs describe-services \
  --cluster <cluster-name> \
  --services <service-name> \
  --region <region>

Check:

desiredCount
runningCount
pendingCount
events
Step 2 — Check stopped tasks
aws ecs list-tasks \
  --cluster <cluster-name> \
  --service-name <service-name> \
  --desired-status STOPPED \
  --region <region>

Then inspect the stopped task:

aws ecs describe-tasks \
  --cluster <cluster-name> \
  --tasks <task-arn> \
  --region <region>

Look for:

stoppedReason
stopCode
container exitCode
container reason
Step 3 — Check CloudWatch logs
aws logs tail <log-group> \
  --since 30m \
  --region <region>

Look for:

application startup errors
configuration errors
Groq provider errors
authentication errors
Step 4 — Check Secrets Manager

Verify that the required secret exists and ECS has permission
to retrieve it.

Do not print the secret value.

Recovery

If the failure is caused by a bad deployment:

Identify the last known-good image.
Update the ECS task definition.
Deploy the known-good revision.
Verify ECS task health.
Verify ALB target health.
Test /health.
Test /ai/chat.
Escalation

If the task continues to fail after rollback, preserve:

ECS service events
stopped task reason
CloudWatch logs
deployment/image version