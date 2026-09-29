
---

## 21.5 Deployment rollback

### `ops/runbooks/deployment-rollback.md`

```md
# Runbook: ECS Deployment Rollback

## When to use

Use this procedure when a new application image causes:

- ECS task failures
- ALB health check failures
- elevated 5xx errors
- `/ai/chat` failures
- severe application regressions

## Step 1 — Identify current image

Check the ECS task definition and identify the deployed image tag.

## Step 2 — Identify known-good image

Use the previously verified Git SHA image from ECR.

## Step 3 — Deploy known-good revision

Update the ECS task definition to use the known-good image.

Deploy the new task definition revision to the ECS service.

## Step 4 — Verify

Check:

- ECS running task count
- ALB target health
- `/health`
- `/ai/chat`
- CloudWatch logs

## Step 5 — Document

Record:

- failed image SHA
- rollback image SHA
- deployment time
- observed failure
- recovery result

## Follow-up

Create a root-cause investigation before redeploying the failed
version.