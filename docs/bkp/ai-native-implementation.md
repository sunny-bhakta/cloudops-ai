# AI-Native Single-Repo Implementation Blueprint (Without Kubernetes)

This guide gives you a practical, senior-level path to implement AI-native features in a **single repository**.

It is optimized for your stack direction:
- AWS
- Terraform
- ECS/Fargate (no K8s required)
- NestJS services
- GitHub Actions CI/CD

---

## 1) Target Architecture (High Level)

Use **one repository with clear internal boundaries**:

1. **Application Layer**
    - Business APIs (NestJS)
    - AI orchestration endpoint(s)
    - Tool-calling layer and safety checks

2. **Infrastructure Layer**
    - Terraform modules and environments
    - IAM, networking, ECS services, Secrets Manager
    - Monitoring, alarms, dashboards

3. **Platform/Ops Layer**
    - Shared CI workflows/templates
    - Runbooks, incident playbooks, SLO definitions
    - Security/compliance checks and policies

4. **Knowledge Layer (Optional)**
    - Curated docs/runbooks for RAG ingestion
    - Versioned source-of-truth documents

This gives you repo simplicity while keeping strong separation of concerns.

---

## 2) What “AI-Native” Means in Production

Your app should support these capabilities:
- Natural language requests from users/operators
- Tool calling for safe actions (read status, trigger workflow, create ticket)
- Grounded responses using internal context (RAG where needed)
- Observability (latency, error rate, token/cost, tool-call success)
- Guardrails (auth, RBAC, validation, approvals for risky operations)

---

## 3) Single-Repo Contract (Very Important)

Define and freeze these contracts early:

### A) API Contract
- Input DTO for AI request
- Output DTO with:
   - final response
   - citations/context sources
   - tool actions performed
   - confidence/safety metadata

### B) Tool Contract
Each tool must declare:
- `name`
- `description`
- JSON schema for input
- permission scope
- timeout + retry policy
- idempotency behavior

### C) Security Contract
- Which roles can call which tools
- Which tools need human approval
- What must be masked in logs

### D) Repo Structure Contract
- Clear ownership per top-level folder
- No cross-layer coupling without interfaces
- CI checks enforce boundaries (e.g., app cannot directly mutate terraform state)

---

## 4) Single-Repo Implementation Plan

## A. Repository Layout

```text
cloudops-ai-platform/
   apps/
      api/
         src/
            ai/
               ai.controller.ts
               ai.service.ts
               provider/
                  llm.provider.ts
                  bedrock.provider.ts (or openai/anthropic)
               tools/
                  tool-registry.ts
                  tools.types.ts
                  implementations/
                     get-service-health.tool.ts
                     create-incident.tool.ts
                     trigger-deploy.tool.ts
               guardrails/
                  authz.guard.ts
                  prompt-safety.service.ts
                  pii-redaction.service.ts
               observability/
                  ai.metrics.ts
                  ai.logger.ts

   infra/
      terraform/
         modules/
         envs/
            dev/
            stage/
            prod/

   ops/
      runbooks/
      slo/
      incident-templates/

   knowledge/ (optional)
      docs/
      runbooks/

   .github/
      workflows/
         ci.yml
         terraform-plan.yml
         terraform-apply.yml
         security.yml
```

---

## B. Application Checklist (NestJS)

### Deliverables
- [ ] `POST /ai/chat` endpoint
- [ ] Provider abstraction (swap model providers without business code change)
- [ ] Tool registry with schema validation
- [ ] RBAC per tool
- [ ] Correlation ID across request -> tool call -> final response
- [ ] Structured logging for audit

### Minimum test coverage
- [ ] Happy path: AI returns answer without tool
- [ ] Tool path: AI requests tool and tool executes
- [ ] Denied tool path: unauthorized action blocked
- [ ] Timeout/fallback path

---

## C. Infrastructure Checklist (Terraform + AWS)

### Modules/environments to ensure
- [ ] VPC + private subnets
- [ ] ECS Fargate service + autoscaling
- [ ] IAM roles (task role, execution role, least privilege)
- [ ] Secrets Manager for model/API keys
- [ ] CloudWatch logs, metrics, alarms
- [ ] Optional queue (SQS) for async long-running tool tasks
- [ ] Optional vector data store (OpenSearch Serverless / pgvector / managed DB)

### Guardrails in Terraform
- [ ] Enforce tags for cost allocation
- [ ] CloudWatch alarm for 5xx and latency
- [ ] Alarm for AI cost/token spikes (custom metric)
- [ ] No public exposure unless explicitly required

---

## D. Platform/Ops Checklist

### CI/CD standards
- [ ] Reusable workflows for lint/test/build
- [ ] Security checks: SAST + dependency + secrets scan
- [ ] IaC scan (Terraform security policy)
- [ ] Deployment promotion gates (dev -> stage -> prod)

### Operations standards
- [ ] SLO/SLI docs for AI endpoint
- [ ] Runbook: model outage fallback
- [ ] Runbook: tool-call failure and rollback
- [ ] Incident template with postmortem format

---

## 5) Suggested Tool Set (Start Small)

Implement only 3 tools first:

1. `getServiceHealth`
    - Read-only, no approval
2. `createIncident`
    - Writes to incident system, no destructive infra change
3. `triggerDeploy`
    - Requires approval + strict allow-list

Then expand tool set after stability is proven.

---

## 6) Security and Safety Baseline

Must-have controls before production:
- [ ] Input validation on every tool schema
- [ ] Prompt injection defense (instruction boundary + allow-listed actions)
- [ ] PII detection/redaction in logs
- [ ] Secrets never returned to model/user
- [ ] Per-user and per-tenant rate limits
- [ ] Human approval workflow for destructive operations

---

## 7) Observability and Quality Gates

Track these metrics from day 1:
- Request latency (p50/p95/p99)
- Tool call success/failure rate
- Hallucination/grounding failure signals
- Token usage and cost per request
- Fallback rate (primary model -> backup model)

Release gate for production:
- [ ] Build: pass
- [ ] Lint/Typecheck: pass
- [ ] Unit/integration tests: pass
- [ ] Smoke test `/ai/chat`: pass

---

## 8) 30-60-90 Day Execution Plan

## Days 1-30 (Foundation)
- Build AI endpoint + provider abstraction
- Add 1 read-only tool
- Add logs, metrics, and basic authz
- Establish folder ownership and CI boundaries in one repo

## Days 31-60 (Controlled Actions)
- Add 2nd and 3rd tools
- Add approval workflow for risky tools
- Add RAG for internal docs/runbooks
- Harden Terraform promotion path (dev -> stage)

## Days 61-90 (Production Maturity)
- SLO enforcement and incident drills
- Cost optimization (caching/routing/fallback)
- Repo-wide standards adoption (CODEOWNERS, policy checks)

---

## 9) Definition of Done (Single Repo)

### App Layer DoD
- [ ] AI endpoint stable under expected load
- [ ] Tool calling works with audit logs
- [ ] Unauthorized tool calls blocked
- [ ] Tests cover happy + failure paths

### Infra Layer DoD
- [ ] Repeatable terraform apply across envs
- [ ] Secrets, IAM, alarms correctly configured
- [ ] ECS rollback strategy validated

### Ops Layer DoD
- [ ] CI workflows enforce standards across folders
- [ ] Runbooks and SLO docs published
- [ ] Incident simulation completed once

---

## 10) First PR Sequence You Can Open (Single Repo)

1. **PR-1**: add `/apps/api` AI module + provider abstraction + `getServiceHealth` tool
2. **PR-2**: add `/infra/terraform` secrets + IAM least privilege + CloudWatch alarms
3. **PR-3**: add `/ops` runbooks + SLO docs + security CI workflows
4. **PR-4**: add approval-required `triggerDeploy` tool and policy gates

This sequence minimizes risk and gives visible progress quickly.

---

## 11) Common Failure Modes (Avoid These)

- Mixing app logic and terraform logic in the same paths
- Too many tools at once before guardrails
- No clear permission model
- Missing timeout/retry/idempotency rules
- Weak observability (cannot explain failures)
- Treating LLM output as trusted without validation

---

## 12) Nice-to-Have Enhancements (After Baseline)

- Model router (cheap model for simple tasks, premium for complex)
- Prompt/version registry with A/B experiments
- Offline evaluation suite with golden datasets
- Multi-region failover for critical AI operations

---

## Quick Start Decision

If you want the fastest path, start with:
- One repository with `apps`, `infra`, and `ops` folders
- One read-only tool
- One risky tool with approval

Then scale capabilities inside the same repo using strict boundaries and CI policy checks.

That gives you real AI-native capability with production safety, without Kubernetes.

---

## 13) PR-1 Execution Checklist (File-by-File, Start Here)

Goal of PR-1: deliver one safe vertical slice in `apps/api`:
- `POST /ai/chat`
- provider abstraction
- one read-only tool: `getServiceHealth`

### A. Create/Update in `apps/api/src/ai`

- [ ] `ai.controller.ts`
   - Add `POST /ai/chat`
   - Validate request DTO
   - Pass correlation ID to service

- [ ] `ai.service.ts`
   - Call provider abstraction first
   - Support tool-call execution path
   - Return normalized response payload

- [ ] `provider/llm.provider.ts`
   - Define provider interface (generate + optional tool intent)

- [ ] `provider/bedrock.provider.ts` (or your selected provider)
   - Implement `llm.provider.ts`
   - Add timeout and basic retry policy

### B. Tooling contract and first tool

- [ ] `tools/tools.types.ts`
   - Define tool input/output types
   - Include timeout/retry/idempotency metadata

- [ ] `tools/tool-registry.ts`
   - Register tools and input schema
   - Enforce schema validation before execution

- [ ] `tools/implementations/get-service-health.tool.ts`
   - Implement read-only health check
   - Return stable machine-friendly payload

### C. Guardrails and observability (minimum)

- [ ] `guardrails/authz.guard.ts`
   - Enforce RBAC per tool name

- [ ] `guardrails/prompt-safety.service.ts`
   - Add instruction boundary + allow-listed actions only

- [ ] `guardrails/pii-redaction.service.ts`
   - Redact sensitive fields before logging

- [ ] `observability/ai.logger.ts`
   - Structured logs: request ID, user/tenant, tool events, outcome

- [ ] `observability/ai.metrics.ts`
   - Latency, tool success/failure, fallback counter

### D. Minimum test set before merging PR-1

- [ ] Happy path: answer without tool
- [ ] Tool path: tool executes successfully
- [ ] Denied tool path: unauthorized tool blocked
- [ ] Timeout/fallback path: provider/tool timeout handled

### E. PR-1 merge criteria

- [ ] Build passes
- [ ] Lint/typecheck pass
- [ ] Tests pass
- [ ] `/ai/chat` smoke test passes
- [ ] Audit log includes correlation ID end-to-end


Based on the blueprint and where we are now, I’d structure the **remaining work** like this. 

### Current status

* ✅ PR-1 AI slice implemented
* ✅ PR-2 Terraform infrastructure implemented
* ✅ ECR + GitHub Actions image build/push
* ✅ Secrets Manager
* ✅ IAM
* ✅ ECS Fargate
* ✅ ALB + Target Group
* ✅ CloudWatch Logs
* ✅ CloudWatch alarms
* ✅ Terraform apply successful
* ✅ `/health` through ALB working
* 🔄 **PR-2 hardening/verification is the immediate next step**

### Next topics

**1. PR-2 — Application smoke test**

* Test `POST /ai/chat`
* Verify ECS can access `GROQ_API_KEY`
* Verify actual AI response
* Check application logs
* Make sure secrets aren't logged

**2. PR-2 — Security verification**

* Verify Secrets Manager configuration
* Verify ECS execution/task IAM permissions
* Verify security-group flow
* Verify no unnecessary public access
* Verify sensitive data isn't exposed in logs

**3. PR-2 — CloudWatch verification**

* CPU alarm
* Memory alarm
* ALB/5xx and latency alarms, if configured
* Confirm alarm states and metric dimensions

**4. PR-2 — Terraform final verification**

* `terraform plan` → no changes
* Review outputs
* Confirm state is clean
* Document the deployed architecture

---

### Then PR-3 — Platform/Ops

**5. GitHub Actions CI hardening**

* Build/test workflow
* Terraform validation
* Terraform plan workflow
* Security checks
* Dependency scanning
* Secrets scanning
* Terraform/IaC security scanning

**6. `/ops` structure**

```text
ops/
├── runbooks/
├── slo/
└── incident-templates/
```

**7. SLO/SLI**

* `/ai/chat` latency
* Availability
* Error rate
* AI/tool-call success rate
* Basic operational targets

**8. Runbooks**

* ECS deployment failure
* AI/Groq outage
* Tool-call failure
* ECS task unhealthy
* ALB 5xx
* Rollback procedure

---

### PR-4 — Controlled AI Actions

**9. `createIncident` tool**

* Tool contract
* Validation
* Authorization
* Audit logging

**10. `triggerDeploy` tool**

* Strict allow-list
* RBAC
* Human approval
* Idempotency
* Timeout/retry
* Audit trail

**11. AI safety/guardrails**

* Prompt-injection defenses
* Tool permission enforcement
* PII redaction
* Never expose secrets
* Risky-operation approval

---

### After PR-4 — AI platform maturity

**12. RAG**

* Knowledge/document ingestion
* Embeddings
* Vector store
* Retrieval
* Grounded `/ai/chat` responses

**13. AI cost/quality**

* Token usage
* Cost per request
* Model fallback
* Caching
* Latency optimization

**14. Production maturity**

* Autoscaling
* Stage/prod environments
* Deployment promotion
* Rollback validation
* Incident drills

This follows the blueprint's progression from **PR-2 → PR-3 → PR-4 → RAG/production maturity**. 

**So the immediate next topic is #1: test `POST /ai/chat` through the ALB.**




## phase: PR-4 — Controlled AI Actions.

The blueprint defines PR-4 as adding an approval-required triggerDeploy tool and policy gates.

### PR-4 roadmap

We'll implement it in this order:

### Feature 23 — Tool Security Contract

Define the common contract for every AI tool:

```Tool
├── name
├── description
├── input schema
├── permission scope
├── timeout
├── retry policy
├── idempotency
└── approval requirement
```

This follows the blueprint's tool contract requirements.

Feature 24 — RBAC + Policy Gate

Create the policy layer that decides:

User
  ↓
Tool requested
  ↓
Permission check
  ↓
Approval required?
  ├── NO  → execute
  └── YES → approval

The important rule is: the LLM does not decide whether it has permission to execute a tool.

Feature 25 — triggerDeploy Tool

Add:

apps/api/src/ai/tools/implementations/
└── trigger-deploy.tool.ts

This will be a controlled action, not a direct unrestricted AWS operation.

The blueprint specifically says triggerDeploy requires approval and a strict allow-list.

Feature 26 — Human Approval Workflow

Implement:

AI
 ↓
triggerDeploy requested
 ↓
Policy validation
 ↓
Approval required
 ↓
PENDING_APPROVAL
 ↓
Human approves
 ↓
Execute deployment
 ↓
Audit result

No automatic deployment merely because the model requested it.

Feature 27 — Idempotency + Timeout + Retry

For deployment actions:

request
 ↓
idempotency check
 ↓
timeout
 ↓
controlled retry
 ↓
result

This is important because the blueprint explicitly requires timeout, retry and idempotency behavior in the tool contract.

Feature 28 — Audit Logging

Record:

correlationId
user
tool
action
approval status
timestamp
result
error

But never record:

GROQ_API_KEY
AWS credentials
tokens
passwords
other secrets

The security baseline explicitly requires PII redaction and that secrets never be returned to the model/user.

Feature 29 — PR-4 Testing / Hardening

We'll verify:

Normal request
     ↓
Tool executes                         ✅

Unauthorized request
     ↓
Tool blocked                          ✅

triggerDeploy
     ↓
Approval required                     ✅

Duplicate deployment request
     ↓
Idempotency protection                ✅

Tool timeout
     ↓
Controlled failure/retry              ✅

Audit event
     ↓
Correlation ID present                ✅

You previously chose not to spend time on unit tests, so we can initially use API/integration/smoke testing for these paths and add deeper tests later.

## PR-4 target structure
```
apps/api/src/ai/
├── tools/
│   ├── tool-registry.ts
│   ├── tools.types.ts
│   └── implementations/
│       ├── get-service-health.tool.ts
│       ├── create-incident.tool.ts
│       └── trigger-deploy.tool.ts
│
├── guardrails/
│   ├── authz.guard.ts
│   ├── policy.service.ts
│   └── approval.service.ts
│
└── observability/
    ├── ai.logger.ts
    └── ai.metrics.ts
```
Start now: Feature 23 — Tool Security Contract

This is the right first step because we shouldn't implement triggerDeploy before defining its permission, approval, timeout, retry and idempotency rules. The blueprint explicitly calls for those contracts before expanding the tool set.


| Feature | Topic                     | Main goal                                                 |
| ------- | ------------------------- | --------------------------------------------------------- |
| **30**  | AI Audit Persistence      | Store audit events durably instead of only in memory      |
| **31**  | AI Request/Tool Metrics   | Track latency, success/failure, tool usage, approvals     |
| **32**  | Structured Logging        | Consistent JSON logs + correlation IDs                    |
| **33**  | Error Handling & Recovery | Standardize AI/provider/tool errors                       |
| **34**  | AI Rate Limiting          | Protect the AI endpoint from excessive requests           |
| **35**  | Prompt/Tool Security      | Harden against prompt injection and unsafe tool arguments |
| **36**  | AI Evaluation             | Create repeatable evaluation scenarios for the AI         |
| **37**  | Production Configuration  | Separate dev/stage/prod AI configuration                  |
| **38**  | API Documentation         | Document AI endpoints, tools, approval workflow           |
| **39**  | PR-5 Final Hardening      | Final security, performance and deployment checks         |


Then PR-6 — Advanced AI
40 — Conversation Memory
41 — RAG / Knowledge Retrieval
42 — Multi-step Agent Workflow
43 — Agent Planning
44 — Tool Result Validation
45 — AI Cost / Token Tracking
46 — AI Evaluation Dashboard
47 — Advanced Agent Guardrails
48 — PR-6 Final Hardening

Then PR-7 — Platform / DevOps
49 — CI/CD Deployment Automation
50 — ECS Deployment Automation
51 — Terraform Stage/Prod Promotion
52 — Deployment Rollback
53 — Secrets Rotation
54 — Backup / Recovery
55 — Production Observability
56 — PR-7 Final Hardening


Feature 28  Audit Logging       ← current
Feature 29  PR-4 Hardening
          ↓
PR-5
Feature 30  Audit Persistence
Feature 31  Metrics
Feature 32  Structured Logging
Feature 33  Error Recovery
Feature 34  Rate Limiting
Feature 35  Prompt/Tool Security
Feature 36  AI Evaluation
Feature 37  Production Config
Feature 38  API Docs
Feature 39  PR-5 Hardening

After 55 — Production Observability and 56 — PR-7 Final Hardening, I would move to the advanced platform capabilities that the blueprint explicitly places after the baseline: model routing, prompt/version experimentation, offline evaluation, and multi-region failover.

PR-8 — Advanced AI Platform
Feature 57 — Model Router

Route requests between models/providers based on configurable criteria.

AI Request
   ↓
Model Router
   ├── Simple → cheaper model
   ├── Complex → stronger model
   └── Provider unavailable → fallback

Focus:

provider abstraction
routing rules
model selection
fallback
configurable thresholds
Feature 58 — Provider Fallback

Make provider failure recoverable:

Primary Provider
      ↓
   failure?
      ↓
Backup Provider
      ↓
Normalized Response

Focus:

timeout
provider errors
retry limits
fallback metrics
correlation ID preservation

This directly extends the blueprint's requirement to track fallback rate.

Feature 59 — Prompt / Version Registry

Introduce versioned prompts:

incident-analysis:v1
incident-analysis:v2
deployment-assistant:v1

Track:

prompt
version
createdAt
status
model compatibility

This prepares the application for controlled prompt changes.

Feature 60 — Prompt Experimentation

Support controlled comparison of prompt versions.

Request
   ↓
Experiment
   ├── Prompt v1
   └── Prompt v2

Capture evaluation metrics without changing the production contract.

The blueprint specifically identifies a prompt/version registry with A/B experiments as a post-baseline enhancement.

Feature 61 — Offline Evaluation / Golden Dataset

Create a repeatable evaluation suite.

Example:

Question
Expected behavior
Expected tool
Expected safety decision
Expected response characteristics

Test scenarios such as:

normal AI question
tool call
unauthorized tool
malicious prompt
approval-required action
provider failure
timeout
bad tool arguments
grounded/RAG response

The blueprint calls for happy-path, denied-tool, and timeout/fallback coverage and later recommends offline evaluation.

Feature 62 — AI Quality Dashboard

Combine:

Latency
Tool success
Tool failure
Fallback rate
Token usage
Cost
Approval requests
Denied requests
Evaluation score/results

into an operational view.

Feature 63 — Advanced Incident Automation

Extend the controlled tools:

AI
 ↓
Detect issue
 ↓
getServiceHealth
 ↓
createIncident
 ↓
Human approval if required
 ↓
triggerDeploy / recovery action

Keep destructive actions behind the approval/policy layer.

The original blueprint's suggested initial tool set includes getServiceHealth, createIncident, and approval-controlled triggerDeploy.

Feature 64 — PR-8 Final Hardening

Final checks for:

model routing
provider fallback
prompt versions
evaluation
tool security
rate limits
cost controls
auditability
failure recovery
production configuration
After PR-8

Then I'd move to PR-9 — High Availability / Multi-Region, if the project actually needs that level of operational complexity.

Feature 65 — Multi-Region Architecture
                 Global Entry
                      │
             ┌────────┴────────┐
             ▼                 ▼
          Region A           Region B
             │                 │
          ECS/API            ECS/API
             │                 │
          AI stack           AI stack
Feature 66 — Cross-Region Failover

Define what happens when the primary region becomes unavailable.

Feature 67 — Cross-Region Data Strategy

Determine how to handle:

audit records
configuration
conversation state
knowledge/RAG data
deployment state
Feature 68 — Disaster Recovery Testing

Run controlled failure scenarios and document recovery procedures.

Feature 69 — PR-9 Final Hardening

Validate the complete recovery strategy.

The blueprint identifies multi-region failover for critical AI operations as a nice-to-have after the baseline, rather than a prerequisite for the initial platform.

Your complete high-level path
PR-1  AI Foundation                         ✅
PR-2  Terraform + AWS                      ✅
PR-3  CI/CD + Platform/Ops                 ✅
PR-4  Controlled AI Actions                🚧
PR-5  Production Readiness                 ⏳
PR-6  Advanced AI / Knowledge              ⏳
PR-7  Deployment + Operations              ⏳
PR-8  Advanced AI Platform                 ⏳
PR-9  High Availability / Multi-Region     ⏳