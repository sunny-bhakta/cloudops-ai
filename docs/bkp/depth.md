Yes — you can use Node.js 24 if your Docker image is already based on Node 24. Keeping the CI major version aligned with the Docker runtime is sensible.

But the npm ci error is not caused by Node 22 vs 24.

The actual problem is:

Missing: typescript@5.9.3 from lock file

That means apps/api/package.json references TypeScript 5.9.3, but apps/api/package-lock.json was generated before that dependency was added/changed.

1. Update your CI Node version

Yes, change this:

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '24'
    cache: npm
    cache-dependency-path: apps/api/package-lock.json

That is fine.

2. Fix the lock file locally

Go to:

cd apps/api

Run:

npm install

This will synchronize:

apps/api/package.json
apps/api/package-lock.json

Then verify:

npm ci

It should now work.

3. Commit the updated lock file

From repository root:

git add apps/api/package.json apps/api/package-lock.json
git commit -m "chore: sync npm lock file"
git push
4. Keep Feature 16 workflow like this
name: Application CI

on:
  pull_request:
    branches:
      - main

  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  application-ci:
    name: Application CI
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: apps/api

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # ---------------------------------------------------------
      # Setup Node.js (match Docker major)
      # ---------------------------------------------------------
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: npm
          cache-dependency-path: apps/api/package-lock.json

      # ---------------------------------------------------------
      # Install dependencies
      # ---------------------------------------------------------
      - name: Install dependencies
        run: npm ci

      # ---------------------------------------------------------
      # Lint
      # ---------------------------------------------------------
      - name: Lint
        run: npm run lint

      # ---------------------------------------------------------
      # Typecheck
      # ---------------------------------------------------------
      - name: Typecheck
        run: npx tsc --noEmit

      # ---------------------------------------------------------
      # Build
      # ---------------------------------------------------------
      - name: Build
        run: npm run build
One important point

Don't "fix" this in GitHub Actions by changing:

npm ci

to:

npm install

Keep npm ci in CI. The purpose of CI is to install exactly what is recorded in the lock file. The correct fix is to synchronize the lock file in the repository.

So the immediate sequence is:

Node 24 in CI       ✅
        ↓
npm install locally
        ↓
package-lock.json updated
        ↓
npm ci locally       ✅
        ↓
commit lock file
        ↓
push
        ↓
GitHub Actions       ✅

After that, if another CI error appears, send me the error and we'll fix Feature 16 before moving to Feature 17.

Move to 17, 18

Yes. We'll move directly to Feature 17 — Terraform CI and then Feature 18 — Security CI.

The blueprint's PR-3 explicitly calls for CI workflows plus SAST, dependency scanning, secrets scanning, and Terraform/IaC security checks.

Feature 17 — Terraform CI
Goal

Every PR that changes Terraform should automatically run:

terraform fmt
       ↓
terraform init
       ↓
terraform validate
       ↓
terraform plan

It will not run terraform apply.

17.1 Create
.github/workflows/terraform-plan.yml

Use:

name: Terraform CI

on:
  pull_request:
    paths:
      - "infra/terraform/**"
      - ".github/workflows/terraform-plan.yml"

  push:
    branches:
      - main
    paths:
      - "infra/terraform/**"

permissions:
  contents: read

jobs:
  terraform:
    name: Terraform Validate and Plan
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: infra/terraform/envs/dev

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.16.3"

      - name: Terraform Format Check
        working-directory: infra/terraform
        run: terraform fmt -check -recursive

      - name: Terraform Init
        run: terraform init -input=false

      - name: Terraform Validate
        run: terraform validate

      - name: Terraform Plan
        run: terraform plan -input=false -no-color
17.2 Why plan instead of apply?

Because a PR should tell us:

"If this gets merged, what will Terraform change?"

It should not automatically change AWS.

Your deployment remains controlled separately.

Important issue: Terraform backend/state

If your current Terraform uses a local state file:

terraform.tfstate

GitHub Actions won't have your local state.

In that case, the terraform plan step may not be useful yet.

So first check:

infra/terraform/envs/dev

for:

backend.tf

If you're currently using local state, don't change it yet just for this feature. We can make Terraform CI validate/format first and add remote state later when you're ready.

For now, the workflow above is appropriate if your CI runner can access the configured backend/state.

Feature 18 — Security CI

Now create:

.github/workflows/security.yml

We'll keep this practical rather than adding a large security platform.

It will run:

Secret scanning
       +
npm dependency audit
       +
Terraform IaC scanning
18.1 Security workflow
name: Security CI

on:
  pull_request:
    branches:
      - main

  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  dependency-scan:
    name: Dependency Security Scan
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: apps/api

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "24"
          cache: npm
          cache-dependency-path: apps/api/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: npm audit
        run: npm audit --audit-level=high


  secret-scan:
    name: Secret Scan
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}


  terraform-security:
    name: Terraform Security Scan
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run Checkov
        uses: bridgecrewio/checkov-action@v12
        with:
          directory: infra/terraform
          framework: terraform
          soft_fail: false
What each job does
Dependency scan
npm audit --audit-level=high

Checks your NestJS dependencies for known high/critical vulnerabilities.

Secret scan

Gitleaks searches the repository for things such as:

AWS access keys
API keys
tokens
private keys
password-like secrets

This is especially important because your application uses:

GROQ_API_KEY

and that key must stay in Secrets Manager rather than Git.

Terraform security

Checkov examines your Terraform configuration for common IaC security problems.

This is directly aligned with the blueprint's IaC security requirement.

One thing about Checkov

Because your infrastructure is deliberately designed for a learning/dev environment and you skipped NAT/private networking for cost reasons, Checkov may report findings that are intentional for this project.

Don't blindly change infrastructure to make every scanner warning disappear.

We'll classify findings as:

FAIL — genuine security problem

or:

ACCEPTED — intentional dev architecture

and document intentional exceptions where appropriate.

Feature 17 + 18 structure

You'll now have:

.github/
└── workflows/
    ├── ci.yml
    ├── terraform-plan.yml
    ├── security.yml
    └── build-push-ecr.yml

With responsibilities:

Workflow	Purpose
ci.yml	Node/NestJS lint, typecheck, build
terraform-plan.yml	Terraform fmt/validate/plan
security.yml	Secrets + dependencies + IaC
build-push-ecr.yml	Build Docker + push ECR

This gives you the PR-3 CI/security foundation described in the blueprint.

Recommended order now

Don't add more infrastructure.

Run them in this order:

Feature 16
   ↓
Application CI       ✅

Feature 17
   ↓
Terraform CI          ← now

Feature 18
   ↓
Security CI           ← immediately after

PR-3
   ↓
Runbooks
   ↓
SLO/SLI
   ↓
Incident template

Start Feature 17 first: create terraform-plan.yml, push it, and paste the GitHub Actions result. If Terraform CI fails because of the current state/backend arrangement, we'll fix that specifically before moving to Feature 18.

  infra/

      terraform/

         modules/

         envs/

            dev/

            stage/

            prod/ i have above structure\

Yes — that structure is fine and actually matches a clean multi-environment Terraform layout:

infra/
└── terraform/
    ├── modules/
    │   ├── vpc/
    │   ├── ecr/
    │   ├── iam/
    │   ├── secrets/
    │   ├── cloudwatch/
    │   ├── ecs/
    │   ├── alb/
    │   └── ...
    │
    └── envs/
        ├── dev/
        │   ├── main.tf
        │   ├── variables.tf
        │   ├── outputs.tf
        │   ├── providers.tf
        │   ├── terraform.tfvars
        │   └── terraform.tfstate
        │
        ├── stage/
        │   └── ...
        │
        └── prod/
            └── ...
For Feature 17

Because your Terraform environment is under:

infra/terraform/envs/dev/

the workflow I gave you is using the correct working directory:

defaults:
  run:
    working-directory: infra/terraform/envs/dev

So these commands run against dev:

terraform init
terraform validate
terraform plan

And this formatting command runs against the entire Terraform tree:

- name: Terraform Format Check
  working-directory: infra/terraform
  run: terraform fmt -check -recursive

That means it checks:

infra/terraform/modules/
infra/terraform/envs/dev/
infra/terraform/envs/stage/
infra/terraform/envs/prod/
One important point

Since you currently have:

envs/
├── dev/
├── stage/
└── prod/

I recommend Feature 17 only validates/plans dev for now, because that is the environment you've actually deployed and verified.

Don't add stage or prod CI plans yet unless those environments are configured.

So your Feature 17 workflow can stay:

.github/
└── workflows/
    └── terraform-plan.yml

with:

defaults:
  run:
    working-directory: infra/terraform/envs/dev

Your structure does not require any change.

Next: run Feature 17's terraform-plan.yml. If GitHub Actions gives an error, paste the error here and we'll fix that before moving to Feature 18.


================PR3=======
Absolutely. Let’s start **PR-3** in the same step-by-step style.

# PR-3 — Production Readiness & Engineering Hardening

The goal of PR-3 is to move the platform from **“deployed and working”** toward **“operationally maintainable and secure.”**

### PR-3 topics

| Feature | Topic                | Goal                                    |
| ------- | -------------------- | --------------------------------------- |
| **16**  | Application CI       | Lint, type-check, build automatically   |
| **17**  | Terraform CI         | Format, validate and plan Terraform     |
| **18**  | Security CI          | Dependency, secret and IaC scanning     |
| **19**  | Operations Structure | Introduce `ops/` organization           |
| **20**  | SLO / SLI            | Define measurable reliability targets   |
| **21**  | Runbooks             | Document common production failures     |
| **22**  | PR-3 Final Hardening | Final cleanup, checks and documentation |

You've already completed **16, 17 and 18**, so we'll continue with:

# Feature 19 — Operations Structure

We will create this structure:

```text
ops/
├── runbooks/
├── slo/
└── incident-templates/
```

This keeps operational documentation separate from application code and Terraform.

---

## Step 1 — Create directories

From the project root:

```text
cloudops-ai-platform/
```

Create:

```text
ops/
├── runbooks/
│   └── README.md
├── slo/
│   └── README.md
└── incident-templates/
    └── README.md
```

### Feature 19 — Path 1

```text
ops/runbooks/README.md
```

Add:

```md
# Runbooks

Operational procedures for diagnosing and recovering the CloudOps AI Platform.

## Planned Runbooks

- ECS deployment failure
- ECS task failure
- ALB health check failure
- AI provider failure
- Secrets Manager failure
- High CPU or memory usage
- Application rollback
```

---

### Feature 19 — Path 2

```text
ops/slo/README.md
```

Add:

```md
# SLO / SLI

Service Level Indicators (SLIs) and Service Level Objectives (SLOs) for the CloudOps AI Platform.

## Planned SLIs

- API availability
- API latency
- AI request success rate
- AI request latency
- ECS service health

## Planned SLOs

SLO targets will be defined in Feature 20.
```

---

### Feature 19 — Path 3

```text
ops/incident-templates/README.md
```

Add:

```md
# Incident Templates

Templates for documenting production incidents.

## Planned Templates

- Incident report
- Root cause analysis
- Post-incident review
```

---

# Step 2 — Verify structure

Your project should now look like:

```text
cloudops-ai-platform/
│
├── apps/
│   └── api/
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
│   │   └── README.md
│   │
│   ├── slo/
│   │   └── README.md
│   │
│   └── incident-templates/
│       └── README.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── terraform-plan.yml
│       └── security.yml
│
└── ...
```

# Step 3 — Commit Feature 19

```bash
git add ops/
```

```bash
git commit -m "docs: add operations structure"
```

```bash
git push origin main
```

---

## What comes next

After this, we start:

### **Feature 20 — SLO / SLI**

We'll define actual targets such as:

```text
API Availability
    ↓
99.5%

AI Request Success Rate
    ↓
99%

API Latency
    ↓
p95 < 2 seconds

AI Latency
    ↓
p95 < 10 seconds
```

We'll put these into:

```text
ops/slo/ai-platform.md
```

and tie them back to the **ALB, ECS, CloudWatch and AI metrics** you already implemented.

**For now, implement Feature 19 exactly above. When you've created and pushed it, say `Feature 19 done` and we'll start Feature 20.**
