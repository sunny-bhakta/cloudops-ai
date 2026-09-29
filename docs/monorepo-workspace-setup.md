# Monorepo Workspace Setup (Nx-free)

This repository now uses a lightweight workspace structure with one runtime app and reusable packages.

## Workspace files

- Root `package.json`: npm workspaces + cross-workspace scripts
- Root `tsconfig.base.json`: shared TypeScript compiler defaults
- Root `tsconfig.json`: project references
- `packages/ai-contracts/package.json`
- `packages/ai-contracts/tsconfig.json`
- `packages/ai-contracts/index.ts`

## Where to move code (source-of-truth mapping)

### `packages/ai-contracts` (types/interfaces only)

Move/keep these here:

- `apps/api/src/ai/provider/llm.provider.ts` → `packages/ai-contracts/llm.provider.ts`
- `apps/api/src/ai/tools/tools.types.ts` → `packages/ai-contracts/tools.types.ts`
- `apps/api/src/ai/audit/audit.types.ts` → `packages/ai-contracts/audit.types.ts`

Rules:

- No Nest decorators
- No runtime dependencies on `@nestjs/*`
- Types/interfaces/schemas/constants only

### `packages/ai-guardrails` (pure logic)

Move pure, framework-agnostic logic first:

- `apps/api/src/ai/guardrails/pii-redaction.service.ts` core redaction logic
- `apps/api/src/ai/guardrails/prompt-safety.service.ts` core policy checks

Keep Nest wrappers in `apps/api` initially and delegate into package functions.

### `packages/ai-policy` (decision engine)

Move reusable decision logic:

- `apps/api/src/ai/guardrails/policy.types.ts`
- policy evaluation core from `policy.service.ts`
- role/permission matrices from `authz.service.ts` (as pure functions/config)

Keep HTTP/auth integration in app layer.

### `packages/ai-audit` (contracts + storage adapters)

Move reusable abstractions:

- Audit store interface + adapters (in-memory, DB later)
- Event normalization helpers

Keep Nest module wiring in `apps/api/src/ai/audit` until extraction is complete.

### `packages/ai-tools-sdk` (shared tool runtime helpers)

Move generic tool execution primitives:

- timeout wrapper logic
- retry + backoff helpers
- idempotency cache abstraction
- schema validation helpers

Likely sources:

- `apps/api/src/ai/tools/tool-executor.ts`
- `apps/api/src/ai/tools/tool-execution.service.ts`

### `packages/ai-testkit` (reusable tests)

Move reusable fixtures/mocks:

- mock LLM responses
- tool-call fixtures
- policy/approval test scenarios

Likely sources:

- `apps/api/test/ai.e2e.spec.ts`
- tool tests under `apps/api/src/ai/tools/*.spec.ts`

## Incremental migration order (safe)

1. Contracts first (`ai-contracts`)
2. Pure logic extraction (`ai-guardrails`, `ai-policy`)
3. Runtime helpers (`ai-tools-sdk`)
4. Shared tests (`ai-testkit`)
5. Optional persistent audit adapters (`ai-audit`)

## App import convention

Use package aliases from `apps/api/tsconfig.json`:

- `@cloudops/ai-contracts`
- `@cloudops/ai-contracts/llm-provider`
- `@cloudops/ai-contracts/tools`
- `@cloudops/ai-contracts/audit`

Avoid deep relative imports into `packages/*` paths.
