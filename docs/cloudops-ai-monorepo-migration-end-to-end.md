# CloudOps AI Platform — End-to-End Nx-Free Monorepo Migration

> Copy/paste implementation guide for migrating the existing CloudOps AI Platform to an npm-workspaces monorepo without Nx. This guide establishes package boundaries while preserving the existing NestJS API, Groq integration, controlled tool execution, approvals, audit flow, Terraform, and ECS deployment.
>
> **Important:** Merge the examples into your existing files. Keep your working Groq response normalization, NestJS dependencies, API scripts, and feature implementations. Do not replace working project-specific code with placeholders.

## 1. Target structure

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
├── packages/
│   ├── ai-contracts/
│   ├── ai-guardrails/
│   ├── ai-policy/
│   ├── ai-audit/
│   ├── ai-tools-sdk/
│   └── ai-testkit/
├── infra/terraform/
│   ├── modules/
│   └── envs/
│       ├── dev/
│       ├── stage/
│       └── prod/
├── ops/
├── knowledge/
├── docs/architecture/
├── .github/workflows/
├── package.json
├── package-lock.json
├── tsconfig.base.json
├── tsconfig.json
└── .gitignore
```

## 2. Package responsibilities

| Package | Owns | Must not own |
|---|---|---|
| `ai-contracts` | Shared interfaces, types, provider/tool/audit/approval contracts | NestJS, HTTP, business logic |
| `ai-guardrails` | Pure prompt-safety and PII-redaction logic | Controllers, request authentication |
| `ai-policy` | Pure RBAC and policy decisions | NestJS guards, session/token parsing |
| `ai-audit` | Audit event contracts and storage abstraction/adapters | HTTP controllers, application wiring |
| `ai-tools-sdk` | Generic tool execution, timeout, retry, idempotency | CloudOps business-specific tools |
| `ai-testkit` | Reusable mocks, fixtures, test scenarios | Production runtime dependencies |
| `apps/api` | NestJS composition, Groq provider, business tools, HTTP/auth, AWS integration | Shared package implementation |

Dependency direction:

```text
apps/api ───────────────► packages/*
packages/* ────────────X► apps/api
ai-contracts ──────────X► runtime packages
```

Packages may depend on `ai-contracts`. `ai-testkit` may depend on the shared packages it needs for tests. Avoid circular dependencies.

## 3. Root workspace setup

### `package.json`

Merge the following fields into the root `package.json`. Preserve any existing root dependencies and scripts your repository still needs.

```json
{
  "name": "cloudops-ai-platform",
  "private": true,
  "version": "1.0.0",
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
    "lint:api": "npm run lint --workspace=@cloudops/api",
    "check": "npm run typecheck && npm run lint && npm run build"
  }
}
```

### `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "skipLibCheck": true
  }
}
```

### Root `tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "./packages/ai-contracts" },
    { "path": "./packages/ai-guardrails" },
    { "path": "./packages/ai-policy" },
    { "path": "./packages/ai-audit" },
    { "path": "./packages/ai-tools-sdk" },
    { "path": "./packages/ai-testkit" },
    { "path": "./apps/api" }
  ]
}
```

### `.gitignore`

```gitignore
node_modules/
dist/
coverage/
*.tsbuildinfo

.env
.env.*
!.env.example

.DS_Store
.idea/
.vscode/
*.log

.terraform/
terraform.tfstate
terraform.tfstate.*
*.tfplan
```

## 4. Shared package template

Each package uses ESM and TypeScript project references. Internal package versions below are all `1.0.0`; keep them aligned unless you deliberately introduce versioning.

A package `tsconfig.json` should generally use:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["*.ts"]
}
```

The package-specific `references` list is shown below. For a package importing another workspace package, add both its dependency in `package.json` and its project reference in `tsconfig.json`.

## 5. `packages/ai-contracts`

### Files

```text
packages/ai-contracts/
├── package.json
├── tsconfig.json
├── index.ts
├── llm-provider.ts
├── tools.types.ts
├── audit.types.ts
├── ai.types.ts
├── approval.types.ts
└── error.types.ts
```

### `package.json`

```json
{
  "name": "@cloudops/ai-contracts",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./llm-provider": "./dist/llm-provider.js",
    "./tools": "./dist/tools.types.js",
    "./audit": "./dist/audit.types.js",
    "./ai": "./dist/ai.types.js",
    "./approval": "./dist/approval.types.js",
    "./errors": "./dist/error.types.js"
  },
  "scripts": {
    "build": "tsc -b",
    "typecheck": "tsc -b --pretty false",
    "test": "echo \"ai-contracts: no tests configured\""
  }
}
```

### `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["*.ts"]
}
```

### `llm-provider.ts`

```ts
export type LlmRole = 'system' | 'user' | 'assistant' | 'tool';

export interface LlmMessage {
  role: LlmRole;
  content: string;
  tool_call_id?: string;
}

export interface LlmTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface LlmToolCall {
  id: string;
  name: string;
  arguments: string | Record<string, unknown>;
}

export interface LlmResponse {
  content: string;
  tool_calls?: LlmToolCall[];
}

export interface LlmProvider {
  chat(
    messages: LlmMessage[],
    tools?: LlmTool[],
  ): Promise<LlmResponse>;
}
```

### `tools.types.ts`

```ts
export interface AiTool {
  name: string;
  description: string;
  execute(input: unknown): Promise<unknown>;
}
```

### `audit.types.ts`

```ts
export type AuditDecision = 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL';
export type AuditStatus = 'STARTED' | 'SUCCESS' | 'FAILED' | 'TIMEOUT';

export type AuditAction =
  | 'TOOL_REQUESTED'
  | 'TOOL_ALLOWED'
  | 'TOOL_DENIED'
  | 'APPROVAL_REQUIRED'
  | 'APPROVAL_GRANTED'
  | 'APPROVAL_REJECTED'
  | 'TOOL_EXECUTION_STARTED'
  | 'TOOL_EXECUTION_SUCCESS'
  | 'TOOL_EXECUTION_FAILED'
  | 'TOOL_EXECUTION_TIMEOUT';

export interface AiAuditEvent {
  auditId: string;
  correlationId: string;
  requestId?: string;
  toolName?: string;
  action: AuditAction;
  actor?: string;
  role?: string;
  decision?: AuditDecision;
  approvalId?: string;
  service?: string;
  version?: string;
  environment?: string;
  status?: AuditStatus;
  error?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
```

### `ai.types.ts`

```ts
export interface AiChatRequest {
  message: string;
  correlationId?: string;
}

export interface AiChatResponse {
  correlationId: string;
  content: string;
}
```

### `approval.types.ts`

```ts
export type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED';

export interface ApprovalRequest {
  approvalId: string;
  requestId: string;
  service: string;
  version: string;
  environment: 'dev' | 'stage' | 'prod';
  requestedBy: string;
  status: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}
```

### `error.types.ts`

```ts
export type AiErrorCode =
  | 'AI_PROVIDER_ERROR'
  | 'AI_TOOL_NOT_FOUND'
  | 'AI_TOOL_DENIED'
  | 'AI_APPROVAL_REQUIRED'
  | 'AI_TOOL_TIMEOUT'
  | 'AI_TOOL_EXECUTION_FAILED'
  | 'AI_INVALID_TOOL_ARGUMENTS'
  | 'AI_RATE_LIMITED';
```

### `index.ts`

```ts
export * from './llm-provider.js';
export * from './tools.types.js';
export * from './audit.types.js';
export * from './ai.types.js';
export * from './approval.types.js';
export * from './error.types.js';
```

## 6. `packages/ai-guardrails`

### `package.json`

```json
{
  "name": "@cloudops/ai-guardrails",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "dependencies": {
    "@cloudops/ai-contracts": "1.0.0"
  },
  "scripts": {
    "build": "tsc -b",
    "typecheck": "tsc -b --pretty false",
    "test": "echo \"ai-guardrails: no tests configured\""
  }
}
```

### `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "."
  },
  "references": [{ "path": "../ai-contracts" }],
  "include": ["*.ts"]
}
```

### `pii-redaction.ts`

```ts
export function redactPii(value: string): string {
  return value
    .replace(
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      '[REDACTED_EMAIL]',
    )
    .replace(/\b\d{10,16}\b/g, '[REDACTED_NUMBER]');
}
```

### `prompt-safety.ts`

```ts
export interface PromptSafetyResult {
  safe: boolean;
  reason?: string;
}

const blockedPatterns = [
  /ignore\s+previous\s+instructions/i,
  /reveal\s+system\s+prompt/i,
  /show\s+hidden\s+instructions/i,
];

export function validatePromptSafety(
  prompt: string,
): PromptSafetyResult {
  for (const pattern of blockedPatterns) {
    if (pattern.test(prompt)) {
      return {
        safe: false,
        reason: 'Potential prompt injection detected',
      };
    }
  }

  return { safe: true };
}
```

### `index.ts`

```ts
export * from './pii-redaction.js';
export * from './prompt-safety.js';
```

## 7. `packages/ai-policy`

### `package.json`

```json
{
  "name": "@cloudops/ai-policy",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "dependencies": {
    "@cloudops/ai-contracts": "1.0.0"
  },
  "scripts": {
    "build": "tsc -b",
    "typecheck": "tsc -b --pretty false",
    "test": "echo \"ai-policy: no tests configured\""
  }
}
```

### `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "."
  },
  "references": [{ "path": "../ai-contracts" }],
  "include": ["*.ts"]
}
```

### `policy.types.ts`

```ts
export type AiRole = 'viewer' | 'operator' | 'admin';
export type PolicyDecision = 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL';

export interface PolicyInput {
  role: AiRole;
  toolName: string;
}
```

### `authz.ts`

```ts
import type { AiRole } from './policy.types.js';

const permissions: Record<AiRole, string[]> = {
  viewer: ['getServiceHealth'],
  operator: ['getServiceHealth', 'createIncident', 'triggerDeploy'],
  admin: ['getServiceHealth', 'createIncident', 'triggerDeploy'],
};

export function canExecuteTool(
  role: AiRole,
  toolName: string,
): boolean {
  return permissions[role]?.includes(toolName) ?? false;
}
```

### `policy-engine.ts`

```ts
import { canExecuteTool } from './authz.js';
import type {
  PolicyDecision,
  PolicyInput,
} from './policy.types.js';

const approvalRequiredTools = new Set(['triggerDeploy']);

export function evaluatePolicy(
  input: PolicyInput,
): PolicyDecision {
  if (!canExecuteTool(input.role, input.toolName)) {
    return 'DENY';
  }

  if (approvalRequiredTools.has(input.toolName)) {
    return 'REQUIRE_APPROVAL';
  }

  return 'ALLOW';
}
```

### `index.ts`

```ts
export * from './policy.types.js';
export * from './authz.js';
export * from './policy-engine.js';
```

> The role-to-tool matrix above is an example. Preserve your existing Feature 24 authorization matrix and approval policy exactly; do not widen permissions simply to match this sample.

## 8. `packages/ai-audit`

### `package.json`

```json
{
  "name": "@cloudops/ai-audit",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "dependencies": {
    "@cloudops/ai-contracts": "1.0.0"
  },
  "scripts": {
    "build": "tsc -b",
    "typecheck": "tsc -b --pretty false",
    "test": "echo \"ai-audit: no tests configured\""
  }
}
```

### `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "."
  },
  "references": [{ "path": "../ai-contracts" }],
  "include": ["*.ts"]
}
```

### `audit-store.ts`

```ts
import type { AiAuditEvent } from '@cloudops/ai-contracts';

export interface AuditStore {
  append(event: AiAuditEvent): Promise<void>;
  list(correlationId?: string): Promise<AiAuditEvent[]>;
}

export class InMemoryAuditStore implements AuditStore {
  private readonly events: AiAuditEvent[] = [];

  async append(event: AiAuditEvent): Promise<void> {
    this.events.push(event);
  }

  async list(correlationId?: string): Promise<AiAuditEvent[]> {
    if (!correlationId) {
      return [...this.events];
    }

    return this.events.filter(
      (event) => event.correlationId === correlationId,
    );
  }
}
```

### `index.ts`

```ts
export * from './audit-store.js';
```

## 9. `packages/ai-tools-sdk`

### `package.json`

```json
{
  "name": "@cloudops/ai-tools-sdk",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "dependencies": {
    "@cloudops/ai-contracts": "1.0.0"
  },
  "scripts": {
    "build": "tsc -b",
    "typecheck": "tsc -b --pretty false",
    "test": "echo \"ai-tools-sdk: no tests configured\""
  }
}
```

### `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "."
  },
  "references": [{ "path": "../ai-contracts" }],
  "include": ["*.ts"]
}
```

### `retry.ts`

```ts
export interface RetryOptions {
  retries: number;
  delayMs: number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= options.retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === options.retries) {
        throw error;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, options.delayMs),
      );
    }
  }

  throw lastError;
}
```

### `timeout.ts`

```ts
export async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
```

### `idempotency.ts`

```ts
export interface IdempotencyStore {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
}

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly values = new Map<string, unknown>();

  get<T>(key: string): T | undefined {
    return this.values.get(key) as T | undefined;
  }

  set<T>(key: string, value: T): void {
    this.values.set(key, value);
  }
}
```

### `tool-executor.ts`

```ts
import type { AiTool } from '@cloudops/ai-contracts';
import { withRetry } from './retry.js';
import { withTimeout } from './timeout.js';
import type { IdempotencyStore } from './idempotency.js';

export interface ToolExecutionOptions {
  timeoutMs: number;
  retries: number;
  retryDelayMs: number;
}

export class ToolExecutor {
  constructor(
    private readonly idempotencyStore: IdempotencyStore,
  ) {}

  async execute(
    tool: AiTool,
    input: unknown,
    idempotencyKey: string,
    options: ToolExecutionOptions,
  ): Promise<unknown> {
    const cached = this.idempotencyStore.get<unknown>(idempotencyKey);
    if (cached !== undefined) return cached;

    const result = await withRetry(
      () => withTimeout(tool.execute(input), options.timeoutMs),
      {
        retries: options.retries,
        delayMs: options.retryDelayMs,
      },
    );

    this.idempotencyStore.set(idempotencyKey, result);
    return result;
  }
}
```

### `index.ts`

```ts
export * from './retry.js';
export * from './timeout.js';
export * from './idempotency.js';
export * from './tool-executor.js';
```

> This is a minimal in-memory SDK example. For production, retain your existing Feature 27 implementation if it already handles concurrent duplicate keys, cache expiry, retry safety, cancellation, and durable idempotency. Retrying non-idempotent side effects can duplicate actions.

## 10. `packages/ai-testkit`

### `package.json`

```json
{
  "name": "@cloudops/ai-testkit",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "dependencies": {
    "@cloudops/ai-contracts": "1.0.0",
    "@cloudops/ai-policy": "1.0.0"
  },
  "scripts": {
    "build": "tsc -b",
    "typecheck": "tsc -b --pretty false",
    "test": "echo \"ai-testkit: no tests configured\""
  }
}
```

### `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "."
  },
  "references": [
    { "path": "../ai-contracts" },
    { "path": "../ai-policy" }
  ],
  "include": ["*.ts"]
}
```

### `fixtures.ts`

```ts
import type { LlmResponse } from '@cloudops/ai-contracts';

export function toolCallResponse(
  toolName: string,
  argumentsValue: Record<string, unknown>,
): LlmResponse {
  return {
    content: '',
    tool_calls: [
      {
        id: 'test-tool-call',
        name: toolName,
        arguments: JSON.stringify(argumentsValue),
      },
    ],
  };
}

export function textResponse(content: string): LlmResponse {
  return { content };
}
```

### `mocks.ts`

```ts
import type {
  LlmMessage,
  LlmProvider,
  LlmResponse,
  LlmTool,
} from '@cloudops/ai-contracts';

export class MockLlmProvider implements LlmProvider {
  private index = 0;

  constructor(private readonly responses: LlmResponse[]) {}

  async chat(
    _messages: LlmMessage[],
    _tools?: LlmTool[],
  ): Promise<LlmResponse> {
    const response = this.responses[this.index++];

    if (!response) {
      throw new Error('MockLlmProvider has no remaining response');
    }

    return response;
  }
}
```

### `index.ts`

```ts
export * from './fixtures.js';
export * from './mocks.js';
```

## 11. API workspace configuration

### `apps/api/package.json`

Merge internal dependencies into your existing API package. Preserve the exact versions of your current NestJS, Groq, validation, config, database, and other dependencies.

```json
{
  "name": "@cloudops/api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nest build",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "lint": "eslint \"src/**/*.ts\""
  },
  "dependencies": {
    "@cloudops/ai-audit": "1.0.0",
    "@cloudops/ai-contracts": "1.0.0",
    "@cloudops/ai-guardrails": "1.0.0",
    "@cloudops/ai-policy": "1.0.0",
    "@cloudops/ai-tools-sdk": "1.0.0"
  },
  "devDependencies": {
    "@cloudops/ai-testkit": "1.0.0"
  }
}
```

### `apps/api/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  },
  "references": [
    { "path": "../../packages/ai-contracts" },
    { "path": "../../packages/ai-guardrails" },
    { "path": "../../packages/ai-policy" },
    { "path": "../../packages/ai-audit" },
    { "path": "../../packages/ai-tools-sdk" }
  ],
  "include": ["src/**/*.ts"]
}
```

> Keep your existing Nest CLI configuration and any `tsconfig.build.json` exclusions. Confirm the actual compiler options used by your Nest build before replacing an established config.

## 12. Import migration

Replace imports that reach into extracted package source with workspace imports.

```ts
// Before
import type { AiTool } from '../tools/tools.types.js';

// After
import type { AiTool } from '@cloudops/ai-contracts';
```

```ts
// Before
import type { LlmProvider } from './provider/llm.provider.js';

// After
import type { LlmProvider } from '@cloudops/ai-contracts';
```

```ts
// Before
import type { PolicyDecision } from './guardrails/policy.types.js';

// After
import type { PolicyDecision } from '@cloudops/ai-policy';
```

Use `import type` for type-only dependencies. Do not import package source through paths such as `../../../../packages/...`.

## 13. Keep business tools in the API

Keep the actual CloudOps tool implementations in the API:

```text
apps/api/src/ai/tools/implementations/
├── get-service-health.tool.ts
├── create-incident.tool.ts
└── trigger-deploy.tool.ts
```

These tools depend on application services and business rules. The SDK should contain generic execution mechanics, not these business actions.

## 14. Tool registry

Example `apps/api/src/ai/tools/tool-registry.ts`:

```ts
import { Injectable } from '@nestjs/common';
import type { AiTool } from '@cloudops/ai-contracts';
import { GetServiceHealthTool } from './implementations/get-service-health.tool.js';
import { TriggerDeployTool } from './implementations/trigger-deploy.tool.js';

@Injectable()
export class ToolRegistry {
  private readonly tools = new Map<string, AiTool>();

  constructor(
    private readonly getServiceHealthTool: GetServiceHealthTool,
    private readonly triggerDeployTool: TriggerDeployTool,
  ) {
    this.register(this.getServiceHealthTool);
    this.register(this.triggerDeployTool);
  }

  register(tool: AiTool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): AiTool | undefined {
    return this.tools.get(name);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  list(): string[] {
    return Array.from(this.tools.keys());
  }
}
```

If `CreateIncidentTool` already exists, inject and register it too. Keep tool names identical to the names used in your existing Groq tool schemas and policy matrix.

## 15. Policy adapter and tool execution

Pure policy logic can live in `packages/ai-policy`. Keep authentication and NestJS integration in `apps/api`.

Example adapter `apps/api/src/ai/guardrails/policy.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { evaluatePolicy } from '@cloudops/ai-policy';
import type { AiRole, PolicyInput } from '@cloudops/ai-policy';

@Injectable()
export class PolicyService {
  evaluate(input: PolicyInput) {
    return evaluatePolicy(input);
  }
}
```

Example executor `apps/api/src/ai/tools/tool-executor.service.ts`:

```ts
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  InMemoryIdempotencyStore,
  ToolExecutor,
} from '@cloudops/ai-tools-sdk';
import { evaluatePolicy } from '@cloudops/ai-policy';
import type { AiRole } from '@cloudops/ai-policy';
import { ToolRegistry } from './tool-registry.js';

@Injectable()
export class ToolExecutorService {
  private readonly executor = new ToolExecutor(
    new InMemoryIdempotencyStore(),
  );

  constructor(private readonly toolRegistry: ToolRegistry) {}

  async execute(
    toolName: string,
    input: unknown,
    role: AiRole,
    idempotencyKey: string,
  ): Promise<unknown> {
    const tool = this.toolRegistry.get(toolName);

    if (!tool) {
      throw new BadRequestException(`Unknown AI tool: ${toolName}`);
    }

    const decision = evaluatePolicy({ role, toolName });

    if (decision === 'DENY') {
      throw new BadRequestException(`Tool execution denied: ${toolName}`);
    }

    // For REQUIRE_APPROVAL, the business tool should only create a
    // pending approval request. It must not perform the deployment.
    if (decision === 'REQUIRE_APPROVAL') {
      return tool.execute(input);
    }

    return this.executor.execute(
      tool,
      input,
      idempotencyKey,
      {
        timeoutMs: 10_000,
        retries: 2,
        retryDelayMs: 500,
      },
    );
  }
}
```

If your existing Feature 27 `ToolExecutionService` already handles these concerns, retain it and refactor its generic internals into the SDK incrementally. In particular, retries must be safe for the specific tool; do not automatically retry a side effect unless idempotency is enforced.

**Role source:** In production, derive `role` from the authenticated request/user context. Never accept a role selected by the LLM or trust a user-provided role field.

## 16. Controlled deployment flow

`triggerDeploy` creates an approval request and returns a pending status. It does not deploy directly.

```text
AI tool call
    ↓
ToolExecutorService
    ↓
Policy decision
    ↓
REQUIRE_APPROVAL
    ↓
TriggerDeployTool creates approval request
    ↓
PENDING_APPROVAL response
    ↓
Human approves/rejects using approval endpoints
    ↓
Only approved request reaches deployment execution
```

Keep your existing approval endpoints and approval-state transitions. Do not introduce a separate `POST /ai/triggerDeploy` endpoint solely to invoke the tool if the existing `/ai/chat` tool-calling flow invokes it internally.

## 17. Groq provider boundary

Keep the provider-specific code in:

```text
apps/api/src/ai/provider/groq.provider.ts
```

It should implement the shared `LlmProvider` contract, but retain your existing working Groq SDK calls and tool-call normalization. The following shows the intended type boundary only; it is **not** a replacement implementation:

```ts
import type {
  LlmMessage,
  LlmProvider,
  LlmResponse,
  LlmTool,
} from '@cloudops/ai-contracts';

export class GroqProvider implements LlmProvider {
  async chat(
    messages: LlmMessage[],
    tools?: LlmTool[],
  ): Promise<LlmResponse> {
    // Keep your current working Groq implementation here.
    // Convert the native Groq response into the shared LlmResponse.
    throw new Error('Retain the existing Groq implementation');
  }
}
```

Do not move Groq SDK types into `ai-contracts`.

## 18. NestJS module wiring

Application dependency injection remains in `apps/api`. Example `AiModule` (merge with your current providers/imports):

```ts
import { Module } from '@nestjs/common';
import { ToolRegistry } from './ai/tools/tool-registry.js';
import { ToolExecutorService } from './ai/tools/tool-executor.service.js';
import { GetServiceHealthTool } from './ai/tools/implementations/get-service-health.tool.js';
import { TriggerDeployTool } from './ai/tools/implementations/trigger-deploy.tool.js';

@Module({
  providers: [
    ToolRegistry,
    ToolExecutorService,
    GetServiceHealthTool,
    TriggerDeployTool,
  ],
  exports: [ToolRegistry, ToolExecutorService],
})
export class AiModule {}
```

Add your existing incident tool, approval service, audit service, Groq provider, metrics, and other providers as appropriate. Ensure every injected class is provided by this module or an imported module.

## 19. Audit integration

Keep NestJS service wiring in `apps/api/src/ai/audit/`. Reusable event and store contracts live in `ai-contracts` and `ai-audit`.

Example adapter:

```ts
import { Injectable } from '@nestjs/common';
import { InMemoryAuditStore } from '@cloudops/ai-audit';
import type { AiAuditEvent } from '@cloudops/ai-contracts';

@Injectable()
export class AuditService {
  private readonly store = new InMemoryAuditStore();

  async record(event: AiAuditEvent): Promise<void> {
    await this.store.append(event);
  }

  async list(correlationId?: string): Promise<AiAuditEvent[]> {
    return this.store.list(correlationId);
  }
}
```

The in-memory adapter is suitable as a migration baseline, not durable production audit storage. Your later persistence feature can add a database-backed `AuditStore` adapter without changing callers.

## 20. npm install and lockfile

Run commands from the repository root:

```bash
npm install
```

The root `package-lock.json` is the lockfile source of truth. After changing workspace package manifests:

```bash
npm install
git add package.json package-lock.json apps packages
git commit -m "chore: establish npm workspaces monorepo"
```

Do not run `npm install` independently inside each package. Do not manually install private workspace packages from the public npm registry.

If CI reports that `npm ci` found `package.json` and `package-lock.json` out of sync, run `npm install` locally, inspect the lockfile diff, and commit the updated root lockfile.

## 21. Build and validation scripts

From the root:

```bash
npm run typecheck
npm run lint
npm run build
```

API-only commands:

```bash
npm run typecheck:api
npm run build:api
```

Use your existing API start command. If the API package defines `start:dev`, run:

```bash
npm run start:dev --workspace=@cloudops/api
```

A package script such as `echo "no tests configured"` is only a placeholder to make workspace orchestration explicit. It is not a test pass. Keep your current test framework and actual tests where configured; the user can continue deferring new unit tests, but typecheck/build and an API smoke test should still be run.

## 22. GitHub Actions

Example `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Typecheck
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test

      - name: Build
        run: npm run build
```

If your current workflows already handle security scanning, Terraform validation, or deployment, preserve those jobs and update their working directory/commands to use the repository root and root lockfile.

## 23. Docker and ECS

Because `apps/api` imports local workspace packages, Docker's build context must be the repository root:

```bash
docker build -f apps/api/Dockerfile .
```

Do not use `docker build apps/api` as the context; it excludes sibling packages.

Example Dockerfile skeleton at `apps/api/Dockerfile`:

```dockerfile
FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/ai-contracts/package.json ./packages/ai-contracts/package.json
COPY packages/ai-guardrails/package.json ./packages/ai-guardrails/package.json
COPY packages/ai-policy/package.json ./packages/ai-policy/package.json
COPY packages/ai-audit/package.json ./packages/ai-audit/package.json
COPY packages/ai-tools-sdk/package.json ./packages/ai-tools-sdk/package.json
COPY packages/ai-testkit/package.json ./packages/ai-testkit/package.json

RUN npm ci

COPY tsconfig.base.json tsconfig.json ./
COPY packages ./packages
COPY apps/api ./apps/api

RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
```

This is a baseline only. Adapt it to your actual NestJS output path, native dependencies, runtime assets, and production dependency strategy. Validate the image before deploying it.

ECS/Fargate and Terraform do not need to understand TypeScript workspace boundaries. The flow remains:

```text
GitHub Actions → npm ci/build → Docker image → ECR → ECS/Fargate → ALB
```

Keep Terraform under `infra/terraform/`. After deployment, validate the existing ALB health route:

```bash
curl http://<ALB-DNS>/health
```

Then exercise the existing AI chat and tool-calling paths, including authorization and approval behavior.

## 24. Migration sequence

1. Commit a clean baseline or create a migration branch.
2. Add root npm workspaces and scripts.
3. Add root TypeScript base config and project references.
4. Create `ai-contracts`; move types/interfaces and update imports.
5. Create `ai-guardrails`; extract only pure reusable logic.
6. Create `ai-policy`; extract pure policy/RBAC evaluation while retaining auth integration in API.
7. Create `ai-tools-sdk`; extract generic execution mechanics without moving business tools.
8. Create `ai-audit`; extract reusable event/store abstractions.
9. Create `ai-testkit`; move reusable fixtures/mocks if useful.
10. Update API package dependencies, TypeScript references, and imports.
11. Update NestJS module wiring.
12. Run root install, typecheck, lint, and build; resolve errors package by package.
13. Update CI to use root `npm ci` and root scripts.
14. Update Docker to use repository-root build context.
15. Build and validate the image, then deploy through the existing ECR/ECS workflow.
16. Smoke-test `/health`, AI chat, tool execution, RBAC, approval, and audit.
17. Document package ownership in `docs/architecture/monorepo.md`.
18. Once stable, freeze boundaries and continue the existing feature roadmap.

## 25. Troubleshooting

### `npm ci` lockfile error

Run `npm install` from the root and commit the regenerated `package-lock.json`.

### Workspace package cannot be resolved

Check all of the following:
- The package folder is under `packages/`.
- Its `package.json` has the correct `name`, such as `@cloudops/ai-contracts`.
- The root `workspaces` list includes `packages/*`.
- The consuming workspace declares the package dependency.
- Run `npm install` at the root.
- The package has been built if the `exports` target points to `dist`.

### TypeScript project-reference error

Check:
- Each referenced project has a `tsconfig.json`.
- Referenced packages set `composite: true`.
- Paths in `references` are correct.
- Package build order follows dependencies.
- Avoid importing source files from sibling package folders directly.

### NestJS provider resolution error

Ensure each injected provider is declared in a module's `providers`, or exported from an imported module. Pure TypeScript packages do not automatically become NestJS providers.

### Docker cannot find a workspace package

Build from the repository root with:

```bash
docker build -f apps/api/Dockerfile .
```

Also ensure the Dockerfile copies the root manifests and every workspace package needed by the API.

### Existing Groq tool-call types break

Keep the working provider normalization. Update its input/output types to the shared contract in a small change; do not rewrite the Groq tool-call loop as part of package extraction.

## 26. Definition of done

- [ ] Nx is not required.
- [ ] npm workspaces resolve all app/package dependencies.
- [ ] Root lockfile is synchronized.
- [ ] Each package has its own manifest and TypeScript config.
- [ ] Project references and dependency direction are correct.
- [ ] `ai-contracts` has no NestJS dependency.
- [ ] Business-specific tools remain in `apps/api`.
- [ ] API imports use workspace package names.
- [ ] Existing Groq tool calling still works.
- [ ] Existing RBAC and policy decisions are unchanged.
- [ ] `triggerDeploy` still requires human approval and cannot deploy directly.
- [ ] Audit events are still emitted.
- [ ] Root typecheck, lint, and build succeed.
- [ ] CI uses root install/build commands.
- [ ] Docker builds with repository-root context.
- [ ] ECR/ECS deployment succeeds.
- [ ] ALB `/health` succeeds.
- [ ] AI chat and controlled tool flow pass smoke validation.

## 27. Roadmap impact

This monorepo migration is a cross-cutting architecture refactor; it does not renumber the existing features. Once migration is stable, continue with the current sequence:

- Feature 28 — Audit Logging
- Feature 29 — PR-4 Final Hardening
- PR-5 — Production Readiness

The central outcome is a clear boundary: the API owns orchestration and business behavior, while packages own reusable contracts and mechanics.
