
---

## 21.4 Secrets Manager failure

### `ops/runbooks/secrets-manager-failure.md`

```md
# Runbook: Secrets Manager Failure

## Symptoms

- ECS task fails during startup.
- Application reports missing API credentials.
- AI requests fail because provider authentication is unavailable.

## Step 1 — Verify secret metadata

```bash
aws secretsmanager describe-secret \
  --secret-id <secret-name> \
  --region <region>

  Do not retrieve the secret value.

Step 2 — Verify ECS IAM permissions

Verify that the ECS execution/task role has only the permissions
required to retrieve the required secret.

Step 3 — Check CloudWatch logs

Look for:

AccessDenied
ResourceNotFound
application configuration errors

Never copy the secret value into logs.

Recovery

Correct:

secret configuration
secret ARN
IAM permissions
ECS task definition

Then redeploy the ECS task and verify /health and /ai/chat.