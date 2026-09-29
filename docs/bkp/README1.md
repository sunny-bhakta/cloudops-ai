# apps/api - PR-1 AI Module Scaffold

This NestJS + TypeScript service implements the PR-1 vertical slice:

- `POST /ai/chat`
- Provider abstraction (`llm.provider.ts` + `bedrock.provider.ts`)
- Tool registry with schema validation
- First read-only tool: `getServiceHealth`
- Basic guardrails (RBAC, prompt safety, PII log redaction)
- Basic observability hooks (structured logs + metrics counters)

## Local development

1. Install dependencies
2. Run tests
3. Run the app

## API contract (current)

### Request

```json
{
  "prompt": "check health status of api",
  "context": {
    "tenantId": "acme"
  }
}
```

### Response

```json
{
  "response": "I will check service health before finalizing.",
  "citations": [],
  "toolActions": [
    {
      "name": "getServiceHealth",
      "status": "success",
      "output": {
        "service": "api",
        "status": "ok"
      }
    }
  ],
  "metadata": {
    "model": "bedrock-mock-v1",
    "confidence": 0.8,
    "fallbackUsed": false,
    "correlationId": "..."
  }
}
```

## Notes

- Current provider is a mock behavior layer for safe local development.
- Replace `bedrock.provider.ts` internals with real AWS Bedrock invocation in PR-2/PR-3.


```
User
 ↓
POST /ai/chat
 ↓
Groq
 ↓
Tool call?
 ├── No → final response
 │
 └── Yes
      ↓
   ToolRegistry
      ↓
 getServiceHealth
      ↓
   Tool result
      ↓
    Groq again
      ↓
   Final response
   ```

   PR-1 — AI Chat + Safe Tool Calling

✅ POST /ai/chat
✅ LLM provider abstraction
✅ Groq provider
✅ Groq tool calling
✅ Tool contract
✅ Tool registry
✅ getServiceHealth
✅ Tool execution layer
✅ JSON-schema validation
✅ Timeout
✅ Retry
✅ Idempotency-aware retry
✅ Unit tests
⬜ RBAC / permission enforcement
⬜ PII redaction
⬜ Structured logs / metrics
⬜ Final PR-1 cleanup