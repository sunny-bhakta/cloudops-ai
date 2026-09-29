
---

## 21.3 AI provider failure

### `ops/runbooks/ai-provider-failure.md`

```md
# Runbook: AI Provider Failure

## Symptoms

- `/ai/chat` returns an error.
- AI request success rate decreases.
- Groq requests fail.
- AI latency increases.

## Step 1 — Check application logs

```bash
aws logs tail <log-group> \
  --since 30m \
  --region <region>

  Look for provider errors.

Never log or expose the GROQ_API_KEY.

Step 2 — Check application metrics

Review:

AI request count
AI request failures
AI latency
tool-call failures
Step 3 — Check configuration

Verify the ECS task references the correct Secrets Manager secret.

Do not retrieve or print the secret value during normal diagnosis.

Recovery

If the problem is provider-side:

Confirm application infrastructure is healthy.
Confirm the secret configuration is present.
Record the provider error.
Retry after the provider recovers.

If the problem is caused by a deployment:

Identify the previous working image.
Roll back the ECS deployment.
Verify /health.
Verify /ai/chat.
Escalation

Record:

timestamp
provider error
affected endpoint
deployment/image version
approximate duration