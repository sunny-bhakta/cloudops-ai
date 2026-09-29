
---

## 21.2 ALB health check failure

### `ops/runbooks/alb-health-check-failure.md`

```md
# Runbook: ALB Health Check Failure

## Symptoms

- ALB target is unhealthy.
- `/health` returns an error.
- Requests through the ALB fail.

## Step 1 — Check target health

```bash
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn> \
  --region <region>

  Check the target health reason.

Step 2 — Check ECS

Verify:

ECS task is running.
Container is listening on the expected port.
Task security group allows traffic from the ALB.
Step 3 — Check application

Check CloudWatch logs for:

startup failure
port configuration
application crash
health endpoint errors
Step 4 — Test health endpoint
http://<ALB-DNS>/health
Recovery

Fix the underlying application, port, security group, or health
check configuration.

Then verify:

ECS task running
Target healthy
/health successful
/ai/chat successful