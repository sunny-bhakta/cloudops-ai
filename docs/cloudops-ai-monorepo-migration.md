# CloudOps AI Platform — Nx-Free Monorepo Migration

## 1. Purpose

This document defines the migration of the existing CloudOps AI Platform from a single NestJS application structure into a lightweight **npm-workspaces monorepo without Nx**.

The goal is to create reusable, framework-agnostic AI packages while keeping the NestJS API as the runtime application.

### Target stack

- Node.js
- npm workspaces
- TypeScript project references
- NestJS
- AWS
- Terraform
- ECS/Fargate
- GitHub Actions
- No Kubernetes
- No Nx

---

# 2. Target Repository Structure

```text
cloudops-ai-platform/

├── apps/
│   └── api/
│       ├── src/
│       │   ├── ai/
│       │   │   ├── controller/
│       │   │   ├── service/
│       │   │   ├── provider/
│       │   │   ├── tools/
│       │   │   ├── guardrails/
│       │   │   ├── approval/
│       │   │   ├── audit/
│       │   │   └── observability/
│       │   └── ...
│       ├── test/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── ai-contracts/
│   ├── ai-guardrails/
│   ├── ai-policy/
│   ├── ai-audit/
│   ├── ai-tools-sdk/
│   └── ai-testkit/
│
├── infra/
│   └── terraform/
│       ├── modules/
│       └── envs/
│           ├── dev/
│           ├── stage/
│           └── prod/
│
├── ops/
│   ├── runbooks/
│   ├── slo/
│   └── incident-templates/
│
├── knowledge/
│   ├── docs/
│   └── runbooks/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── terraform-plan.yml
│       ├── terraform-apply.yml
│       └── security.yml
│
├── package.json
├── package-lock.json
├── tsconfig.base.json
└── tsconfig.json
```

---

# 3. Migration Principles

The migration follows these principles:

1. Contracts are extracted first.
2. Pure logic is separated from NestJS.
3. Generic runtime helpers are reusable.
4. Application-specific tools remain in `apps/api`.
5. Infrastructure remains independent from application packages.
6. Packages must not depend on `apps/api`.
7. Shared packages must not require NestJS unless explicitly necessary.
8. The root `package-lock.json` is the dependency source of truth.
9. CI and Docker builds operate from the repository root.
10. Existing AI behavior must remain unchanged during extraction.

---

# 4. Workspace Configuration

## 4.1 Root `package.json`

The root package should become the workspace orchestrator.

```json
{
  "name": "cloudops-ai-platform",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "typecheck": "npm run typecheck --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present",

    "build:api": "npm run build --workspace=@cloudops/api",
    "typecheck:api": "npm run typecheck --workspace=@cloudops/api",
    "test:api": "npm run test --workspace=@cloudops/api",

    "check": "npm run typecheck && npm run lint && npm run build"
  }
}
```

The root should own workspace orchestration.

---

# 5. TypeScript Configuration

## 5.1 `tsconfig.base.json`

Shared compiler settings should live here.

Example:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

Keep project-specific configuration in each workspace.

---

## 5.2 Root `tsconfig.json`

Use TypeScript project references.

```json
{
  "files": [],
  "references": [
    {
      "path": "./packages/ai-contracts"
    },
    {
      "path": "./packages/ai-guardrails"
    },
    {
      "path": "./packages/ai-policy"
    },
    {
      "path": "./packages/ai-audit"
    },
    {
      "path": "./packages/ai-tools-sdk"
    },
    {
      "path": "./packages/ai-testkit"
    },
    {
      "path": "./apps/api"
    }
  ]
}
```

---

# 6. Package Build Requirements

Each reusable package should have its own:

```text
package.json
tsconfig.json
index.ts
```

Packages should use:

```json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist"
  }
}
```

Do not commit generated `dist/` or TypeScript build-info files.

---

# 7. Package 1 — `ai-contracts`

## Purpose

Shared types, interfaces, schemas, and constants.

## Move

```text
apps/api/src/ai/provider/llm.provider.ts
    ↓
packages/ai-contracts/llm-provider.ts

apps/api/src/ai/tools/tools.types.ts
    ↓
packages/ai-contracts/tools.types.ts

apps/api/src/ai/audit/audit.types.ts
    ↓
packages/ai-contracts/audit.types.ts
```

## Recommended additional contracts

```text
packages/ai-contracts/
├── index.ts
├── llm-provider.ts
├── tools.types.ts
├── audit.types.ts
├── ai.types.ts
├── approval.types.ts
└── error.types.ts
```

## Rules

`ai-contracts` must contain:

- Types
- Interfaces
- Schemas
- Constants

It must NOT contain:

- Nest decorators
- Nest modules
- AWS SDK integration
- Groq SDK integration
- Database connections
- Application services

---

# 8. Package 2 — `ai-guardrails`

## Purpose

Framework-agnostic safety and input protection logic.

## Move

Extract pure logic from:

```text
apps/api/src/ai/guardrails/pii-redaction.service.ts
apps/api/src/ai/guardrails/prompt-safety.service.ts
```

## Target

```text
packages/ai-guardrails/
├── index.ts
├── pii-redaction.ts
└── prompt-safety.ts
```

Keep NestJS wrappers in:

```text
apps/api/src/ai/guardrails/
```

Example architecture:

```text
NestJS Service
      ↓
Pure Guardrail Function
      ↓
ai-guardrails
```

The package should not depend on NestJS.

---

# 9. Package 3 — `ai-policy`

## Purpose

Reusable authorization and policy decision logic.

## Move

Extract:

```text
apps/api/src/ai/guardrails/policy.types.ts
apps/api/src/ai/guardrails/policy.service.ts
apps/api/src/ai/guardrails/authz.service.ts
```

The pure portions should move into:

```text
packages/ai-policy/
├── index.ts
├── policy.types.ts
├── policy-engine.ts
└── permissions.ts
```

## Policy decisions

The policy engine should support:

```text
ALLOW
DENY
REQUIRE_APPROVAL
```

Application-specific HTTP/auth integration remains in `apps/api`.

---

# 10. Package 4 — `ai-audit`

## Purpose

Provide reusable audit contracts and storage abstractions.

Target:

```text
packages/ai-audit/
├── index.ts
├── audit-store.ts
├── audit-normalizer.ts
├── audit-events.ts
└── in-memory-audit-store.ts
```

Example abstraction:

```ts
export interface AuditStore {
  append(event: AuditEvent): Promise<void>;

  findByCorrelationId(
    correlationId: string,
  ): Promise<AuditEvent[]>;
}
```

NestJS wiring remains in:

```text
apps/api/src/ai/audit/
```

Later this package can support:

```text
InMemoryAuditStore
PostgresAuditStore
Other durable adapters
```

This aligns with the later Feature 30 — AI Audit Persistence.

---

# 11. Package 5 — `ai-tools-sdk`

## Purpose

Reusable tool execution primitives.

Move generic logic from:

```text
apps/api/src/ai/tools/tool-executor.ts
apps/api/src/ai/tools/tool-execution.service.ts
```

Target:

```text
packages/ai-tools-sdk/
├── index.ts
├── timeout.ts
├── retry.ts
├── idempotency.ts
└── schema-validation.ts
```

## Important rule

Do NOT move application-specific tools here.

Keep these in `apps/api`:

```text
apps/api/src/ai/tools/implementations/
├── get-service-health.tool.ts
├── create-incident.tool.ts
└── trigger-deploy.tool.ts
```

The SDK provides generic execution mechanisms.

---

# 12. Package 6 — `ai-testkit`

## Purpose

Reusable AI testing infrastructure.

Target:

```text
packages/ai-testkit/
├── index.ts
├── fixtures/
├── mocks/
└── scenarios/
```

Potential reusable components:

- Mock LLM responses
- Tool-call fixtures
- Policy scenarios
- Approval scenarios
- Prompt-injection scenarios
- Timeout scenarios
- Provider failure scenarios

Application E2E tests remain in:

```text
apps/api/test/
```

---

# 13. Application Responsibilities

`apps/api` remains the runtime application.

It owns:

```text
apps/api/src/ai/

├── controller/
├── service/
├── provider/
├── tools/
├── guardrails/
├── approval/
├── audit/
└── observability/
```

The application owns:

- HTTP endpoints
- NestJS modules
- NestJS dependency injection
- Provider implementations
- Application-specific tools
- AWS integration
- Authentication integration
- Runtime configuration
- Controllers
- Runtime orchestration

---

# 14. Import Convention

Use workspace package names.

Examples:

```ts
import type { LlmProvider } from '@cloudops/ai-contracts';

import type {
  AiTool,
  ToolSecurityContract,
} from '@cloudops/ai-contracts/tools';

import type {
  AuditEvent,
  AuditStore,
} from '@cloudops/ai-contracts/audit';
```

Avoid:

```ts
import ... from '../../../../packages/ai-contracts/...';
```

Avoid hidden source-path coupling between workspaces.

---

# 15. Package Dependency Rules

The dependency direction should be:

```text
                    ai-contracts
                   /      |      \
                  /       |       \
                 ↓        ↓        ↓
        ai-guardrails  ai-policy  ai-audit
                  \       |       /
                   \      |      /
                    ↓     ↓     ↓
                    ai-tools-sdk
                         ↓
                     ai-testkit
                         ↓
                       apps/api
```

## Allowed dependencies

| Workspace | Allowed internal dependencies |
|---|---|
| `ai-contracts` | None |
| `ai-guardrails` | `ai-contracts` |
| `ai-policy` | `ai-contracts` |
| `ai-audit` | `ai-contracts` |
| `ai-tools-sdk` | `ai-contracts` |
| `ai-testkit` | Shared packages |
| `apps/api` | All required shared packages |

## Forbidden dependencies

```text
packages/* → apps/api
ai-contracts → ai-policy
ai-contracts → NestJS
ai-policy → apps/api
ai-tools-sdk → apps/api
```

Avoid circular dependencies.

---

# 16. NestJS Boundary

Reusable packages should remain framework agnostic.

Preferred architecture:

```text
apps/api
    ↓
NestJS Adapter / Service
    ↓
Reusable Package
    ↓
Pure Logic
```

Example:

```ts
@Injectable()
export class PiiRedactionService {
  redact(input: unknown) {
    return redactSensitiveData(input);
  }
}
```

The reusable package contains `redactSensitiveData`.

The NestJS application provides the runtime integration.

---

# 17. Approval Architecture

Do not extract the entire approval workflow immediately.

Keep application integration in:

```text
apps/api/src/ai/approval/
├── approval.controller.ts
├── approval.service.ts
└── approval.module.ts
```

Shared approval types can live in:

```text
packages/ai-contracts/approval.types.ts
```

Policy decisions can live in:

```text
packages/ai-policy/
```

This keeps the extraction incremental.

---

# 18. Tool Architecture

Application-specific tools remain:

```text
apps/api/src/ai/tools/implementations/

├── get-service-health.tool.ts
├── create-incident.tool.ts
└── trigger-deploy.tool.ts
```

Runtime flow:

```text
AI
 ↓
Tool Registry
 ↓
Tool Security Contract
 ↓
RBAC
 ↓
Policy
 ↓
Approval if required
 ↓
Tool Executor
 ↓
Tool Implementation
 ↓
Audit + Metrics
```

The LLM is never the security boundary.

---

# 19. CI/CD Changes

The root workspace becomes the CI entry point.

## Before migration

The workflow may effectively operate from:

```text
apps/api
```

## After migration

CI should operate from:

```text
repository root
```

Typical flow:

```text
npm ci
    ↓
typecheck
    ↓
lint
    ↓
test
    ↓
build
```

Recommended root commands:

```bash
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
```

API-specific commands remain available:

```bash
npm run build:api
npm run typecheck:api
npm run test:api
```

The root `package-lock.json` becomes the dependency source of truth.

---

# 20. GitHub Actions Updates

Review all workflows:

```text
.github/workflows/
├── ci.yml
├── terraform-plan.yml
├── terraform-apply.yml
└── security.yml
```

Update application CI to run from repository root.

Verify:

- `npm ci`
- Workspace dependency installation
- Typecheck
- Build
- Tests
- Security scanning
- Package dependency resolution

Terraform workflows remain independent of application package compilation where appropriate.

---

# 21. Docker Build Changes

This is critical after the workspace migration.

Because `apps/api` now depends on packages under:

```text
packages/
```

the Docker build context should be the repository root.

Preferred conceptual command:

```bash
docker build -f apps/api/Dockerfile .
```

not:

```bash
cd apps/api
docker build .
```

The Docker build must have access to:

```text
apps/api/
packages/ai-contracts/
packages/ai-guardrails/
packages/ai-policy/
packages/ai-audit/
packages/ai-tools-sdk/
```

---

# 22. Dockerfile Considerations

The Dockerfile should:

1. Copy root workspace files.
2. Copy workspace package manifests.
3. Run `npm ci`.
4. Copy required source.
5. Build the workspace/application.
6. Produce the runtime image.

Conceptually:

```text
Repository root
      ↓
Docker build context
      ↓
npm ci
      ↓
workspace build
      ↓
API runtime image
```

Do not accidentally create a Docker image that only contains `apps/api`.

---

# 23. ECS / AWS Impact

Terraform does not need to understand the internal monorepo package structure.

The architecture remains:

```text
Monorepo
   ↓
GitHub Actions
   ↓
Docker build
   ↓
ECR
   ↓
ECS/Fargate
   ↓
ALB
```

The ECS task still runs the API container.

The change is primarily in the build process.

---

# 24. Testing Structure

Application integration/E2E tests:

```text
apps/api/test/
├── ai.e2e.spec.ts
└── ...
```

Reusable testing infrastructure:

```text
packages/ai-testkit/
├── fixtures/
├── mocks/
└── scenarios/
```

Use `ai-testkit` from application tests where appropriate.

Deep unit-test extraction can be incremental.

---

# 25. Build and Validation Checklist

After each package migration:

```text
[ ] Package has package.json
[ ] Package has tsconfig.json
[ ] Package has index.ts
[ ] Package builds independently
[ ] Package typechecks independently
[ ] No NestJS dependency where prohibited
[ ] No dependency on apps/api
[ ] No circular dependency
[ ] API imports package through workspace name
[ ] Existing behavior still works
```

---

# 26. Migration Order

Follow this sequence.

## Step 1 — Root Workspace

```text
[ ] Update root package.json
[ ] Add npm workspaces
[ ] Ensure root package-lock.json
[ ] Add root scripts
```

## Step 2 — TypeScript

```text
[ ] Create/update tsconfig.base.json
[ ] Create root tsconfig.json
[ ] Configure project references
```

## Step 3 — Contracts

```text
[ ] Create ai-contracts
[ ] Move LLM contracts
[ ] Move tool contracts
[ ] Move audit contracts
[ ] Add AI/approval/error contracts where needed
[ ] Update API imports
```

## Step 4 — Guardrails

```text
[ ] Extract PII logic
[ ] Extract prompt safety logic
[ ] Create NestJS adapters
[ ] Update imports
```

## Step 5 — Policy

```text
[ ] Extract policy types
[ ] Extract policy engine
[ ] Extract permissions
[ ] Keep HTTP/auth integration in API
```

## Step 6 — Tools SDK

```text
[ ] Extract timeout
[ ] Extract retry
[ ] Extract idempotency
[ ] Extract schema validation
[ ] Keep actual CloudOps tools in API
```

## Step 7 — Audit

```text
[ ] Extract AuditStore
[ ] Extract event normalization
[ ] Extract audit event definitions
[ ] Keep NestJS wiring in API
```

## Step 8 — Testkit

```text
[ ] Extract reusable fixtures
[ ] Extract mocks
[ ] Extract common scenarios
```

## Step 9 — CI

```text
[ ] Update GitHub Actions
[ ] Run npm ci from root
[ ] Typecheck workspaces
[ ] Build workspaces
[ ] Run tests
```

## Step 10 — Docker

```text
[ ] Update Docker build context
[ ] Update Dockerfile
[ ] Build API image
[ ] Verify workspace packages are included
```

## Step 11 — ECS

```text
[ ] Push image to ECR
[ ] Deploy ECS
[ ] Verify task starts
[ ] Verify /health
[ ] Verify /ai/chat
[ ] Verify application logs
```

## Step 12 — Freeze Boundaries

```text
[ ] Document dependency rules
[ ] Add CODEOWNERS later
[ ] Add architecture documentation
[ ] Prevent packages from importing apps/api
```

---

# 27. Git Ignore

Ensure generated workspace output is ignored:

```gitignore
node_modules/
dist/
coverage/
*.tsbuildinfo
```

Do not commit generated package builds.

---

# 28. Monorepo Documentation

Create:

```text
docs/architecture/monorepo.md
```

Document:

```text
apps/api
    Runtime application

packages/ai-contracts
    Shared contracts

packages/ai-guardrails
    Pure safety logic

packages/ai-policy
    Policy and authorization decisions

packages/ai-audit
    Audit abstractions and adapters

packages/ai-tools-sdk
    Generic tool execution primitives

packages/ai-testkit
    Shared test infrastructure

infra/
    Terraform/AWS

ops/
    Operational documentation

knowledge/
    AI knowledge sources
```

---

# 29. Optional CODEOWNERS

After the migration stabilizes:

```text
/apps/api/
/packages/ai-contracts/
/packages/ai-guardrails/
/packages/ai-policy/
/packages/ai-audit/
/packages/ai-tools-sdk/
/packages/ai-testkit/
/infra/
/ops/
```

Use CODEOWNERS to establish ownership boundaries.

---

# 30. Migration Definition of Done

The migration is complete when:

### Workspace

- [ ] npm workspaces work from root
- [ ] Root `package-lock.json` is valid
- [ ] All packages install correctly
- [ ] TypeScript project references work

### Packages

- [ ] `ai-contracts` extracted
- [ ] `ai-guardrails` extracted
- [ ] `ai-policy` extracted
- [ ] `ai-audit` extracted
- [ ] `ai-tools-sdk` extracted
- [ ] `ai-testkit` extracted

### Architecture

- [ ] No package imports `apps/api`
- [ ] Contracts contain no NestJS runtime dependencies
- [ ] Pure logic is framework agnostic
- [ ] Application-specific tools remain in API
- [ ] Dependency direction is documented

### Application

- [ ] API builds
- [ ] API typechecks
- [ ] `/ai/chat` still works
- [ ] Tool calling still works
- [ ] RBAC still works
- [ ] Approval workflow still works
- [ ] Audit logging still works

### CI/CD

- [ ] GitHub Actions work from root
- [ ] `npm ci` succeeds
- [ ] Build succeeds
- [ ] Typecheck succeeds
- [ ] Security workflows succeed

### Docker / ECS

- [ ] Docker builds from repository root
- [ ] Workspace packages are included
- [ ] Image pushes to ECR
- [ ] ECS deployment succeeds
- [ ] `/health` works through ALB
- [ ] `/ai/chat` works through ALB
- [ ] Logs appear in CloudWatch

---

# 31. Impact on Feature Roadmap

The monorepo migration is a **cross-cutting architecture change**, not a new AI feature.

Do not renumber the existing roadmap.

Current roadmap remains:

```text
PR-1  AI Foundation                 ✅
PR-2  AWS / Terraform               ✅
PR-3  CI/CD + Platform/Ops          ✅
PR-4  Controlled AI Actions         🚧
```

Current feature:

```text
Feature 28 — Audit Logging
```

Next:

```text
Feature 29 — PR-4 Final Hardening
```

Then:

```text
PR-5
Feature 30 — AI Audit Persistence
```

The monorepo migration should be completed before continuing with new feature development so the remaining features are built on the final package boundaries.

---

# 32. Final Architecture

```text
                         ┌─────────────────────┐
                         │    ai-contracts     │
                         │ Types / Interfaces  │
                         └──────────┬──────────┘
                                    │
               ┌────────────────────┼────────────────────┐
               ↓                    ↓                    ↓
      ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
      │ ai-guardrails  │   │   ai-policy    │   │   ai-audit     │
      │ Pure Safety    │   │ Pure Decisions │   │ Audit Storage  │
      └────────┬───────┘   └────────┬───────┘   └────────┬───────┘
               │                    │                    │
               └────────────────────┼────────────────────┘
                                    ↓
                           ┌─────────────────┐
                           │ ai-tools-sdk    │
                           │ timeout/retry/  │
                           │ idempotency     │
                           └────────┬────────┘
                                    ↓
                           ┌─────────────────┐
                           │   ai-testkit    │
                           │ mocks/fixtures  │
                           └────────┬────────┘
                                    ↓
                           ┌─────────────────┐
                           │    apps/api     │
                           │ NestJS Runtime  │
                           └────────┬────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ↓                   ↓                   ↓
             Groq/LLM           AWS/ECS             HTTP/API
                │                   │
                └───────────────────┼───────────────────┐
                                    ↓                   ↓
                                   ECR                ALB
                                    ↓                   ↓
                                  ECS/Fargate       Users
```

---

# 33. Key Rule

The monorepo should provide **reuse without coupling**.

The final dependency principle is:

```text
Reusable packages
       ↓
Application
       ↓
Infrastructure
```

Not:

```text
Infrastructure
       ↓
Application
       ↓
Reusable packages
       ↓
Application again
```

The LLM remains untrusted, the application remains the security boundary, and package extraction must not change the existing AI behavior.
