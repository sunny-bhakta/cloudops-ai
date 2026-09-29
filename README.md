# CloudOps AI Platform

Monorepo for the CloudOps AI platform with application, infrastructure, and operational assets.

## Workspace layout

- `apps/` — deployable applications (currently `apps/api`)
- `packages/` — shared AI contracts and libraries
- `infra/` — Terraform modules and environments
- `ops/` — runbooks, SLOs, incident templates
- `knowledge/` — optional knowledge documents

## Quick start

1. Install dependencies:
   - from repo root: `npm install`
2. Run API in dev mode:
   - `npm run -w api start:dev`
3. Run API tests:
   - `npm run -w api test`

## Notes

- This repo uses npm workspaces (`apps/*`, `packages/*`).
- For older npm versions, local package links use `file:` dependencies (not `workspace:*`).

Workspace	Responsibility
ai-contracts	Shared TypeScript types/interfaces
ai-tools-sdk	Tool definitions, LangChain tool wrappers, tool schemas
ai-guardrails	Safety/validation logic
ai-policy	Policy decisions/rules
ai-audit	Audit events/logging contracts or utilities
apps/api	NestJS HTTP/API application and orchestration