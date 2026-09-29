# CloudOps AI Platform

## AI-Native Single-Repo Implementation Roadmap

> **Architecture:** Single repository · NestJS · AWS · Terraform · ECS/Fargate · GitHub Actions · No Kubernetes

---

# 1. Target Architecture

```text
cloudops-ai-platform/

├── apps/
│   └── api/
│       └── src/
│           ├── ai/
│           │   ├── ai.controller.ts
│           │   ├── ai.service.ts
│           │   ├── provider/
│           │   ├── tools/
│           │   ├── guardrails/
│           │   └── observability/
│           │
│           └── ...
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
└── .github/
    └── workflows/
        ├── ci.yml
        ├── terraform-plan.yml
        ├── terraform-apply.yml
        └── security.yml
```

---

# 2. AI-Native Production Capabilities

The platform should eventually support:

* Natural-language requests
* AI provider abstraction
* Tool calling
* Tool-level RBAC
* Human approval for risky operations
* Prompt-injection protection
* PII/secrets redaction
* Correlation IDs
* Structured audit logging
* AI metrics
* Provider fallback
* Model routing
* RAG / knowledge retrieval
* AI evaluation
* Cost/token tracking
* Operational automation

---

# 3. Core Contracts

## API Contract

AI responses should support:

* Final response
* Context/citations where applicable
* Tools/actions performed
* Safety metadata
* Correlation ID

## Tool Contract

Every tool should define:

```text
Tool
├── name
├── description
├── input schema
├── permission scope
├── timeout
├── retry policy
├── idempotency behavior
└── approval requirement
```

## Security Contract

Define:

* Which roles can execute each tool
* Which tools require approval
* Which inputs are allowed
* What must be redacted
* What must never be exposed to the model/user

---

# 4. Overall PR Roadmap

| PR       | Area                                | Status     |
| -------- | ----------------------------------- | ---------- |
| **PR-1** | AI Foundation / Safe Vertical Slice | ✅ Complete |
| **PR-2** | AWS Infrastructure / Terraform      | ✅ Complete |
| **PR-3** | CI/CD + Platform/Ops                | ✅ Complete |
| **PR-4** | Controlled AI Actions               | 🚧 Current |
| **PR-5** | Production Readiness                | ⏳          |
| **PR-6** | Advanced AI / Knowledge             | ⏳          |
| **PR-7** | Deployment + Operations             | ⏳          |
| **PR-8** | Advanced AI Platform                | ⏳          |
| **PR-9** | High Availability / Multi-Region    | ⏳          |

---

# 5. PR-1 — AI Foundation

## Goal

Deliver the first safe AI vertical slice.

### Features

### Feature 1 — NestJS AI Module

* AI module
* Controller
* Service structure

### Feature 2 — `POST /ai/chat`

* AI request DTO
* Response DTO
* Request validation

### Feature 3 — Provider Abstraction

* `LlmProvider`
* Provider-independent AI service

### Feature 4 — Groq Provider

* Groq integration
* Provider configuration
* Normalized responses

### Feature 5 — AI Tool Contract

* Tool interface
* Tool metadata

### Feature 6 — Tool Registry

* Tool registration
* Tool lookup
* Tool discovery

### Feature 7 — `getServiceHealth`

* Read-only tool
* Stable machine-friendly response

### Feature 8 — AI Tool Calling

* Detect tool calls
* Execute tools
* Return tool results to model

### Feature 9 — Tool Validation

* Validate tool arguments
* Reject invalid inputs

### Feature 10 — Basic Authorization

* Tool-level authorization
* Unauthorized tool rejection

### Feature 11 — Correlation IDs

* Request correlation
* Tool-call correlation
* Response correlation

### Feature 12 — AI Metrics

Track:

* Request latency
* Tool success/failure
* Provider failures
* Fallback where applicable

### Feature 13 — AI Logging

* Structured logs
* Request ID
* Tool events
* Outcome

### Feature 14 — PR-1 Hardening

* Build
* Typecheck
* Smoke testing
* `/ai/chat` validation

**Status: ✅ Complete**

---

# 6. PR-2 — AWS Infrastructure / Terraform

## Goal

Deploy the AI platform infrastructure on AWS without Kubernetes.

### Features

* Terraform foundation
* Environment structure
* VPC/networking
* ECR
* Secrets Manager
* IAM
* CloudWatch Logs
* ECS Fargate
* ALB
* Target Group
* ECS Service
* Health checks
* CloudWatch alarms
* Terraform outputs
* Deployment validation

### CI Infrastructure

* Terraform validation
* Terraform plan
* Terraform apply workflow

### AWS Validation

* `/health` through ALB
* ECS task health
* Secrets configuration
* IAM permissions
* CloudWatch logs
* Alarm configuration

**Status: ✅ Complete**

---

# 7. PR-3 — CI/CD + Platform/Ops

## Goal

Establish operational and deployment standards.

### Features 15–22

### Feature 15 — CI Build Pipeline

* Install dependencies
* Build
* Typecheck

### Feature 16 — Test Pipeline

* Test workflow
* CI test execution

### Feature 17 — Security CI

* Dependency scanning
* Secrets scanning
* Security checks

### Feature 18 — Terraform Security

* IaC scanning
* Terraform validation
* Policy checks

### Feature 19 — Terraform Plan CI

* Automated plan
* Pull-request visibility

### Feature 20 — Ops Structure

```text
ops/
├── runbooks/
├── slo/
└── incident-templates/
```

### Feature 21 — SLO / SLI

Define:

* `/ai/chat` availability
* Latency
* Error rate
* Tool success rate

### Feature 22 — Operational Runbooks

Document:

* ECS deployment failure
* AI provider outage
* Tool-call failure
* ECS unhealthy task
* ALB 5xx
* Rollback procedure

**Status: ✅ Complete**

---

# 8. PR-4 — Controlled AI Actions

## Goal

Move from read-only AI operations to **controlled operational actions**.

The central rule:

```text
User
  ↓
AI
  ↓
Tool Request
  ↓
Security / RBAC
  ↓
Policy
  ↓
Approval?
  ├── NO  → Execute
  │
  └── YES → Human Approval
                 ↓
              Execute
```

The LLM never decides whether it is authorized to perform an action.

---

## Feature 23 — Tool Security Contract

Define the common security contract for every tool.

```text
Tool
├── name
├── description
├── input schema
├── permission scope
├── timeout
├── retry policy
├── idempotency
└── approval requirement
```

Apply the contract to:

* `getServiceHealth`
* `createIncident`
* `triggerDeploy`

**Status: ✅ Complete**

---

## Feature 24 — RBAC + Policy Gate

Implement:

```text
User
 ↓
Tool requested
 ↓
RBAC
 ↓
Policy evaluation
 ↓
ALLOW / DENY / REQUIRE_APPROVAL
```

Rules:

* Viewer → read-only tools
* Operator → operational tools according to policy
* Admin → privileged operations according to policy
* Destructive actions → approval

**Important:** permissions come from authenticated application context, not from the LLM.

**Status: ✅ Complete**

---

# Feature 25 — Controlled AI Tools

Implement the two missing operational tools.

## 25A — `createIncident`

Purpose:

* Create an operational incident
* Validate incident input
* Apply authorization
* Generate correlation/request ID
* Record audit event
* Return stable incident information

Example:

```text
AI
 ↓
createIncident
 ↓
RBAC
 ↓
Policy
 ↓
Execute
 ↓
Incident created
```

No infrastructure mutation.

---

## 25B — `triggerDeploy`

Purpose:

* Request a deployment
* Validate service
* Validate environment
* Validate version
* Enforce deployment allow-list
* Require human approval

Flow:

```text
AI
 ↓
triggerDeploy
 ↓
Validation
 ↓
RBAC
 ↓
Policy
 ↓
REQUIRE_APPROVAL
 ↓
PENDING_APPROVAL
```

`triggerDeploy` must **not** directly deploy merely because the model requested it.

**Status: ✅ Complete**

---

# Feature 26 — Human Approval Workflow

Implement:

```text
triggerDeploy
      ↓
Approval Request
      ↓
PENDING_APPROVAL
      ↓
Human
 ┌────┴────┐
 ↓         ↓
APPROVE   REJECT
 ↓
Execute
```

Endpoints:

```text
GET  /ai/approvals/:approvalId

POST /ai/approvals/:approvalId/approve

POST /ai/approvals/:approvalId/reject
```

Record:

* Approval ID
* Request ID
* Actor
* Tool
* Environment
* Decision
* Timestamp

**Status: ✅ Complete**

---

# Feature 27 — Idempotency + Timeout + Retry

Protect controlled actions against:

* Duplicate requests
* Network failures
* Provider retries
* Tool timeout
* Partial failures

Flow:

```text
Request
 ↓
Idempotency check
 ↓
Policy
 ↓
Execute
 ↓
Timeout protection
 ↓
Controlled retry
 ↓
Result
```

Deployment requests must not accidentally execute twice because of duplicate AI/tool calls.

**Status: ✅ Complete**

---

# Feature 28 — Audit Logging

Record every important security/action event.

### Audit Events

```text
TOOL_REQUESTED
TOOL_ALLOWED
TOOL_DENIED

APPROVAL_REQUIRED
APPROVAL_GRANTED
APPROVAL_REJECTED

TOOL_EXECUTION_STARTED
TOOL_EXECUTION_SUCCESS
TOOL_EXECUTION_FAILED
TOOL_EXECUTION_TIMEOUT
```

### Audit Fields

```text
auditId
correlationId
requestId
toolName
action
actor
role
decision
approvalId
environment
status
timestamp
error
```

### Never log

```text
GROQ_API_KEY
AWS credentials
passwords
tokens
secrets
sensitive PII
```

Use the existing PII-redaction mechanism before writing audit/log data.

**Status: 🚧 Current**

---

# Feature 29 — PR-4 Final Hardening

Validate the complete controlled-action flow.

### Scenario 1 — Normal Tool

```text
AI
 ↓
getServiceHealth
 ↓
ALLOW
 ↓
Execute
 ↓
Success
```

### Scenario 2 — Unauthorized Tool

```text
AI
 ↓
Tool
 ↓
RBAC
 ↓
DENY
```

### Scenario 3 — Deployment

```text
AI
 ↓
triggerDeploy
 ↓
Policy
 ↓
REQUIRE_APPROVAL
 ↓
PENDING_APPROVAL
```

### Scenario 4 — Approval

```text
Human Approval
 ↓
Approved
 ↓
Execute
 ↓
Audit
```

### Scenario 5 — Duplicate Request

```text
Duplicate request
 ↓
Idempotency check
 ↓
Existing request returned
```

### Scenario 6 — Timeout

```text
Tool
 ↓
Timeout
 ↓
Controlled retry
 ↓
Failure / recovery
 ↓
Audit
```

### Scenario 7 — Audit

Verify:

```text
correlationId
requestId
tool
actor
decision
result
timestamp
```

**Target:**

```text
PR-4
 ├── Security
 ├── RBAC
 ├── Policy
 ├── Approval
 ├── Idempotency
 ├── Timeout
 ├── Retry
 └── Audit
```

---

# 9. PR-5 — Production Readiness

## Goal

Make the AI application operationally production-ready.

### Feature 30 — AI Audit Persistence

Move audit events from temporary/in-memory storage to durable storage.

Track:

* Audit history
* Approval history
* Tool execution history
* Request correlation

---

### Feature 31 — AI Request / Tool Metrics

Track:

* Request count
* Request latency
* Tool usage
* Tool success/failure
* Approval requests
* Denied requests
* Provider errors

---

### Feature 32 — Structured Logging

Standardize JSON logs.

Every relevant event should include:

```text
timestamp
level
service
correlationId
requestId
toolName
actor
environment
status
error
```

---

### Feature 33 — Error Handling & Recovery

Standardize:

* Provider errors
* Tool errors
* Validation errors
* Authorization errors
* Approval errors
* Timeout errors
* Retry exhaustion

Return stable API errors.

---

### Feature 34 — AI Rate Limiting

Protect `/ai/chat` against excessive requests.

Consider:

* Per-user limits
* Per-tenant limits
* Burst protection
* Tool-specific limits

---

### Feature 35 — Prompt / Tool Security

Harden against:

* Prompt injection
* Unsafe tool arguments
* Tool impersonation
* Privilege escalation
* Secret extraction

Principle:

```text
LLM output = untrusted input
```

---

### Feature 36 — AI Evaluation

Create repeatable evaluation scenarios.

Examples:

* Normal question
* Tool call
* Unauthorized tool
* Malicious prompt
* Approval-required action
* Provider failure
* Timeout
* Invalid tool arguments

---

### Feature 37 — Production Configuration

Separate:

```text
dev
stage
prod
```

Configuration should cover:

* AI provider
* Model
* Rate limits
* Tool policies
* Timeout
* Retry
* Feature flags

---

### Feature 38 — API Documentation

Document:

```text
POST /ai/chat

GET  /ai/approvals/:approvalId

POST /ai/approvals/:approvalId/approve

POST /ai/approvals/:approvalId/reject
```

Also document:

* Tool contracts
* Error responses
* Authentication
* Approval flow

---

### Feature 39 — PR-5 Final Hardening

Final checks:

* Security
* Performance
* Configuration
* Logging
* Metrics
* Error handling
* Rate limits
* Documentation
* Deployment validation

---

# 10. PR-6 — Advanced AI / Knowledge

## Goal

Introduce more capable AI workflows while preserving the security baseline.

---

## Feature 40 — Conversation Memory

Support:

* Conversation history
* Context management
* Request/session correlation
* Context limits

---

## Feature 41 — RAG / Knowledge Retrieval

Introduce the knowledge layer.

```text
Documents
 ↓
Chunking
 ↓
Embeddings
 ↓
Vector Store
 ↓
Retriever
 ↓
AI Context
 ↓
Grounded Response
```

Potential knowledge sources:

* Runbooks
* Architecture docs
* Operational procedures
* Internal documentation

---

## Feature 42 — Multi-Step Agent Workflow

Support controlled sequences:

```text
Question
 ↓
Tool 1
 ↓
Tool 2
 ↓
Analysis
 ↓
Final response
```

Every step remains subject to tool policy.

---

## Feature 43 — Agent Planning

Allow the AI to construct a plan before executing multiple actions.

```text
Request
 ↓
Plan
 ↓
Validate
 ↓
Execute approved steps
 ↓
Result
```

---

## Feature 44 — Tool Result Validation

Never blindly trust tool output.

Validate:

* Schema
* Expected fields
* Status
* Size
* Sensitive information

---

## Feature 45 — AI Cost / Token Tracking

Track:

* Input tokens
* Output tokens
* Total tokens
* Estimated cost
* Cost per request
* Cost per tool workflow
* Cost per model

---

## Feature 46 — AI Evaluation Dashboard

Display:

* Evaluation results
* Tool success rate
* Latency
* Failure rate
* Grounding signals
* Cost
* Provider fallback

---

## Feature 47 — Advanced Agent Guardrails

Add stronger controls around:

* Agent loops
* Tool chaining
* Maximum steps
* Risk scoring
* Sensitive operations
* Context boundaries

---

## Feature 48 — PR-6 Final Hardening

Validate:

* Memory
* RAG
* Agent workflows
* Planning
* Tool validation
* Cost tracking
* Guardrails
* Evaluation

---

# 11. PR-7 — Platform / DevOps

## Goal

Automate deployment and operational lifecycle.

---

## Feature 49 — CI/CD Deployment Automation

Automate:

```text
Commit
 ↓
Build
 ↓
Security
 ↓
Test
 ↓
Image
 ↓
Deploy
```

---

## Feature 50 — ECS Deployment Automation

Automate:

* ECS task definition
* Service update
* Deployment monitoring
* Health validation

---

## Feature 51 — Terraform Stage/Prod Promotion

Establish:

```text
dev
 ↓
stage
 ↓
prod
```

with explicit promotion gates.

---

## Feature 52 — Deployment Rollback

Define and validate:

```text
Bad deployment
 ↓
Detection
 ↓
Rollback
 ↓
Previous version
 ↓
Health verification
```

---

## Feature 53 — Secrets Rotation

Implement:

* Secret rotation strategy
* Application reload strategy
* Rotation verification

---

## Feature 54 — Backup / Recovery

Define recovery for:

* Audit data
* Configuration
* Application state
* Knowledge data where applicable

---

## Feature 55 — Production Observability

Centralize:

* Application metrics
* ECS metrics
* ALB metrics
* AI metrics
* Tool metrics
* Error metrics
* Cost signals
* Alerts
* Dashboards

---

## Feature 56 — PR-7 Final Hardening

Validate:

* CI/CD
* Deployment automation
* Promotion
* Rollback
* Secrets
* Recovery
* Observability

---

# 12. PR-8 — Advanced AI Platform

## Goal

Optimize the AI platform for cost, quality, reliability, and controlled experimentation.

---

## Feature 57 — Model Router

Route requests based on configurable criteria.

```text
AI Request
    ↓
Model Router
    ├── Simple → cheaper model
    ├── Complex → stronger model
    └── Provider unavailable → fallback
```

Focus:

* Provider abstraction
* Routing rules
* Model selection
* Configurable thresholds
* Fallback integration

---

## Feature 58 — Provider Fallback

Implement:

```text
Primary Provider
       ↓
    Failure?
       ↓
Backup Provider
       ↓
Normalized Response
```

Handle:

* Timeout
* Provider errors
* Retry limits
* Fallback metrics
* Correlation ID preservation

---

## Feature 59 — Prompt / Version Registry

Introduce versioned prompts.

Examples:

```text
incident-analysis:v1
incident-analysis:v2
deployment-assistant:v1
```

Track:

* Prompt
* Version
* Created date
* Status
* Model compatibility

---

## Feature 60 — Prompt Experimentation

Support controlled experiments.

```text
Request
 ↓
Experiment
 ├── Prompt v1
 └── Prompt v2
```

Capture:

* Response quality
* Latency
* Cost
* Tool success
* Evaluation results

---

## Feature 61 — Offline Evaluation / Golden Dataset

Create repeatable evaluation scenarios.

Each scenario contains:

```text
Question
Expected behavior
Expected tool
Expected safety decision
Expected response characteristics
```

Include:

* Normal request
* Tool call
* Unauthorized tool
* Prompt injection
* Approval-required operation
* Provider failure
* Timeout
* Invalid arguments
* RAG response

---

## Feature 62 — AI Quality Dashboard

Combine:

* Latency
* Tool success
* Tool failure
* Fallback rate
* Token usage
* Cost
* Approval requests
* Denied requests
* Evaluation results

---

## Feature 63 — Advanced Incident Automation

Build controlled operational workflows.

```text
AI
 ↓
Detect issue
 ↓
getServiceHealth
 ↓
createIncident
 ↓
Approval if required
 ↓
triggerDeploy / recovery action
 ↓
Verify
 ↓
Audit
```

Destructive actions remain behind policy and approval.

---

## Feature 64 — PR-8 Final Hardening

Validate:

* Model routing
* Provider fallback
* Prompt versions
* Experiments
* Evaluation
* Tool security
* Rate limits
* Cost controls
* Auditability
* Failure recovery

---

# 13. PR-9 — High Availability / Multi-Region

## Goal

Add multi-region resilience only if the platform's operational requirements justify the additional complexity.

---

## Feature 65 — Multi-Region Architecture

```text
                Global Entry
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
      Region A               Region B
          │                     │
       ECS/API               ECS/API
          │                     │
       AI Stack              AI Stack
```

---

## Feature 66 — Cross-Region Failover

Define:

* Failure detection
* Traffic switching
* Recovery
* Health verification
* Failback

---

## Feature 67 — Cross-Region Data Strategy

Determine handling for:

* Audit records
* Configuration
* Conversation state
* RAG/knowledge data
* Deployment state

---

## Feature 68 — Disaster Recovery Testing

Run controlled scenarios:

* Region unavailable
* AI provider unavailable
* Data unavailable
* Deployment failure

Document:

* Recovery steps
* Recovery time
* Recovery dependencies
* Lessons learned

---

## Feature 69 — PR-9 Final Hardening

Validate:

* Failover
* Recovery
* Data consistency
* Operational procedures
* Monitoring
* Disaster recovery documentation

---

# 14. Final Feature Map

```text
PR-1 — AI Foundation
  1  AI Module
  2  /ai/chat
  3  Provider Abstraction
  4  Groq Provider
  5  Tool Contract
  6  Tool Registry
  7  getServiceHealth
  8  Tool Calling
  9  Tool Validation
 10  Authorization
 11  Correlation IDs
 12  AI Metrics
 13  AI Logging
 14  PR-1 Hardening
        │
        ▼
PR-2 — AWS / Terraform
  Infrastructure + ECS + ALB + IAM + Secrets + CloudWatch
        │
        ▼
PR-3 — CI/CD + Platform/Ops
 15  CI Build
 16  Tests
 17  Security CI
 18  Terraform Security
 19  Terraform Plan CI
 20  Ops Structure
 21  SLO/SLI
 22  Runbooks
        │
        ▼
PR-4 — Controlled AI Actions
 23  Tool Security Contract
 24  RBAC + Policy Gate
 25  createIncident + triggerDeploy
 26  Human Approval
 27  Idempotency + Timeout + Retry
 28  Audit Logging
 29  PR-4 Hardening
        │
        ▼
PR-5 — Production Readiness
 30  Audit Persistence
 31  AI Metrics
 32  Structured Logging
 33  Error Recovery
 34  Rate Limiting
 35  Prompt/Tool Security
 36  AI Evaluation
 37  Production Configuration
 38  API Documentation
 39  PR-5 Hardening
        │
        ▼
PR-6 — Advanced AI / Knowledge
 40  Conversation Memory
 41  RAG / Knowledge Retrieval
 42  Multi-Step Agent Workflow
 43  Agent Planning
 44  Tool Result Validation
 45  Cost / Token Tracking
 46  Evaluation Dashboard
 47  Advanced Guardrails
 48  PR-6 Hardening
        │
        ▼
PR-7 — Platform / DevOps
 49  CI/CD Deployment Automation
 50  ECS Deployment Automation
 51  Stage/Prod Promotion
 52  Rollback
 53  Secrets Rotation
 54  Backup / Recovery
 55  Production Observability
 56  PR-7 Hardening
        │
        ▼
PR-8 — Advanced AI Platform
 57  Model Router
 58  Provider Fallback
 59  Prompt / Version Registry
 60  Prompt Experimentation
 61  Offline Evaluation
 62  AI Quality Dashboard
 63  Advanced Incident Automation
 64  PR-8 Hardening
        │
        ▼
PR-9 — High Availability
 65  Multi-Region Architecture
 66  Cross-Region Failover
 67  Cross-Region Data Strategy
 68  Disaster Recovery Testing
 69  PR-9 Hardening
```

---

# 15. Current Project Position

```text
PR-1  AI Foundation                 ✅
PR-2  AWS / Terraform               ✅
PR-3  CI/CD + Platform/Ops          ✅
PR-4  Controlled AI Actions         🚧
```

### Current Feature

```text
Feature 28 — Audit Logging
```

### Next

```text
Feature 29 — PR-4 Final Hardening
```

### After PR-4

```text
PR-5
 ↓
Feature 30 — AI Audit Persistence
```

### Long-term

```text
PR-5 Production Readiness
        ↓
PR-6 Advanced AI / Knowledge
        ↓
PR-7 Platform / DevOps
        ↓
PR-8 Advanced AI Platform
        ↓
PR-9 High Availability
```

---

# 16. Important Architecture Rule

Throughout all PRs, preserve this boundary:

```text
                ┌─────────────────┐
                │       User      │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐
                │       AI        │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐
                │   Tool Request  │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐
                │ Schema Validate │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐
                │      RBAC       │
                └────────┬────────┘
                         ↓
                ┌─────────────────┐
                │     Policy      │
                └────────┬────────┘
                         ↓
              ┌──────────┴──────────┐
              ↓                     ↓
           ALLOW             REQUIRE_APPROVAL
              ↓                     ↓
           Execute              Human
                                    ↓
                              Approve / Reject
                                    ↓
                                  Execute
                                    ↓
                              Audit + Metrics
```

**The LLM is never the security boundary.**

It can request an action, but the application decides whether that action is valid, authorized, approved, and executable.

---

# 17. PR-10+ Backlog — Additional AI Features (Beyond Current Roadmap)

These features extend the platform after PR-9 and are organized by practical delivery priority.

## Now (High Impact, Low/Medium Risk)

### 70 — Approval-to-Execution Bridge

After approval, execute real deployment through a controlled adapter (ECS API or GitHub Actions workflow dispatch).

### 71 — Explainable Policy Decisions

For every allow/deny/approval decision, return and log a structured reason (matched rule, role, tool, environment).

### 72 — Dry-Run / Sandbox Mode

Allow AI requests to simulate tool execution safely without side effects to validate policy/tool behavior.

### 73 — Incident Timeline Generator

Auto-build incident timelines from alarms, deploy events, and logs for fast RCA and postmortems.

## Next (Scale & Reliability)

### 74 — Change Risk Scoring

Compute deployment risk from blast radius, service criticality, recent failures, and change window.

### 75 — Canary Analysis Assistant

Evaluate rollout health (latency/error/resource metrics) and recommend continue, pause, or rollback.

### 76 — FinOps / Cost Anomaly Assistant

Detect cost spikes by service/environment and suggest targeted remediation actions.

### 77 — Approval Routing & Escalation

Dynamic approver routing with SLA timers, escalation chains, and fallback approvers.

## Later (Platform Expansion)

### 78 — Auto-Remediation with Guardrails

For known incident classes, run approved remediation playbooks automatically with strict constraints.

### 79 — Terraform Drift & Config Anomaly Detection

Identify infra drift and suspicious runtime/config deltas against declared baselines.

### 80 — Tool Plugin SDK

Provide a standard plugin scaffold so teams can add tools with schema, policy, audit, timeout, and retry pre-wired.

### 81 — Multi-Tenant AI Governance

Isolate policies, quotas, model routing, and audit streams per tenant for enterprise usage.

---

# 18. Scope & Evolution (Single Application → Organization Level)

## Current Scope (This Repository)

This implementation is intentionally scoped to a **single application boundary**:

- AI orchestration and API live in the same codebase (`apps/api`)
- Tool contracts, RBAC, policy, approval, and audit are implemented for this app
- Deployment and operations automation are aligned to this application stack

This keeps delivery fast, cost-controlled, and easier to harden before expansion.

## Not Yet Organization-Level (By Design)

The current model is not yet a centralized organizational control plane for many services/teams.
Examples not yet implemented:

- Cross-application/fleet-wide tool federation
- Centralized org policy service
- Shared approval service across teams
- Multi-tenant governance and isolation across many products

## Evolution Path (No Rewrite Required)

The platform can evolve incrementally while preserving current work:

1. Extract shared AI contracts into reusable modules
2. Introduce service adapters for multiple applications
3. Externalize approval + audit persistence into shared services
4. Add tenant/team context to authorization and policy
5. Introduce a central orchestration/control plane for org-wide actions

This approach keeps the current single-app architecture useful now, while creating a clean path to organization-level scale later.

