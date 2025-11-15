# Agents Guide (Multi-Project, SDD-Aligned)

> Scope: This file is the generic backend project AGENTS.md.

## 0. Purpose

This document standardizes how AI agents (Cursor, Codex, Gemini, etc.) operate across projects using Spec-Driven Development (SDD). It defines inputs, outputs, gates, and prohibitions to ensure safe, test-first, and repeatable automation.

### Development Modes

This guide supports two development modes:

**Rapid Development Mode (Current)**

-   Single branch (`main`) for fast iteration
-   Skip PR/review process
-   Suitable for: MVP development, prototyping, early-stage projects

**Production-Ready Mode (Future)**

-   Multi-branch workflow (dev/test/prod)
-   PR review and approval process
-   Staged rollout procedures
-   Suitable for: Production applications, team collaboration, regulated environments

**Note**: Tasks related to PR creation or branch promotion are optional and should be skipped during Rapid Development Mode.

## 1. Ground Rules (Non-Negotiable)

-   Test-First: Write tests before implementation (Red → Green → Refactor).
-   No Secrets: Never read/print real credentials or PII. Use placeholders.
-   No Destructive Ops: Avoid DROP/TRUNCATE/DELETE/ALTER; never rewrite shared history.
-   Small, Reversible Changes: Prefer small edits and clear diffs.
-   Contract-First: Define/validate APIs and schemas before code.
-   Single Work Item Focus: Complete one feature slice end-to-end before starting another.

## 2. Directory Convention

```
docs/
├── 1.suggestion/             # Daily inputs, free-form
│   └── YYYY-MM-DD-NN/
├── 2.specs/                  # Authoritative specs by feature
│   ├── _shared/              # Cross-feature contracts/models/guides
│   └── 001-feature-slug/
│       ├── spec.md
│       ├── plan.md
│       ├── research.md
│       ├── data-model.md
│       ├── quickstart.md
│       ├── contracts/
│       │   ├── api.yaml
│       │   ├── endpoints.md
│       │   └── schemas.json
│       └── tasks.md
└── 3.release/
    └── RELEASE-YYYY-MM-DD.md
```

## 3. Workflow (Agent Operating Procedure)

### 3.1 Intake (from docs/1.suggestion)

-   Scan latest `docs/1.suggestion/*` for new requests and references.
-   If `index.md` exists in a suggestion folder, treat it as primary summary; otherwise, generate `ingest.md` with:
    -   Summary (≤10 lines)
    -   Open questions
    -   Links to attached files
-   Detect duplicates/overlaps with existing features in `docs/2.specs/*`.

#### Suggestion Intake Rules (MANDATORY)

**Priority Order for Processing**

1. If `index.md` exists → Use as primary summary (≤500 chars)
2. If `ingest.md` exists → Use as secondary reference
3. Scan all files in folder → Generate `ingest.md` if missing
4. Filter sensitive content before summary generation

**Content Classification**

-   Feature Request: New functionality → Generate feature slug
-   Bug Report: Existing issue → Reference affected feature slug
-   Infrastructure: Env/config changes → Check shared vs feature scope
-   Documentation: Doc updates → Update appropriate spec files

**Duplicate Detection**

-   Compare against `docs/2.specs/*` features
-   If overlap >70% → Merge into existing feature or note dependency
-   If new scope → Create new feature slug

**Fallback Behavior**

-   Folder empty → Skip with warning
-   All files filtered → Generate minimal summary: "No actionable content found"

**index.md mini-template**

```markdown
# Suggestion Index

Title: [short title]
Summary: [≤500 chars]
Open Questions:

-   [question 1]
    Links:
-   [relative/path/or/url]
```

**ingest.md template (MANDATORY)**

```markdown
# Suggestion Ingest

Date: YYYY-MM-DD
Folder: docs/1.suggestion/YYYY-MM-DD-NN
Author/Requester: [name or team]

## Summary (≤500 chars)

[핵심 요약 한 단락]

## Context & Sources

-   Files: [list key files with relative paths]
-   Links: [urls or internal refs]

## Problem Statement

[무엇이 문제인가]

## Goals & Non-Goals

-   Goals: [...]
-   Non-Goals: [...]

## Proposed Scope (candidate feature)

-   In-Scope: [...]
-   Out-of-Scope: [...]

## Evidence & References

-   Signals/Observations: [...]
-   Data/Benchmarks (optional): [...]

## Acceptance Criteria Seeds

1. Given [...], When [...], Then [...]

## Risks & Constraints

-   Risks: [...]
-   Constraints (budget/legal/perf): [...]

## Open Questions

-   Q1: [...]
-   Q2: [...]

## Attachments

-   [file or link]

## Redactions

-   Secrets/PII/endpoints → [REDACTED]
```

Creation Rules:

-   Create `ingest.md` when `index.md` is absent in a suggestion folder.
-   Keep Summary ≤500 chars; list only relevant files/links.
-   Redact secrets/PII/real endpoints as `[REDACTED]`.
-   Save alongside the source files under `docs/1.suggestion/YYYY-MM-DD-NN/`.

### 3.2 Feature Proposal

-   Generate next feature slug: `NNN-kebab-case`.
-   Create proposal outline (no code) mapping suggestion → acceptance criteria.
-   Ask for confirmation if ambiguity is high; else proceed to spec draft.

### 3.3 Spec Generation (docs/2.specs/NNN-slug/spec.md)

-   Sections (MANDATORY): User Scenarios, Acceptance (Given-When-Then), Edge Cases, FR/NFR, Key Entities, Error Handling, Review Checklist.
-   Use `[NEEDS CLARIFICATION: ...]` for unknowns; do not guess.
-   Gate: No implementation details (tech stacks) inside spec.md.

Spec authoring template (inline reference):

````markdown
# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]` **Created**: [DATE] **Status**: Draft
**Input**: "[one-line problem statement]"

## User Scenarios & Testing

### Primary User Story

[plain language journey]

### Acceptance Scenarios

1. Given [state], When [action], Then [result]
2. Given [state], When [action], Then [result]

### Edge Cases

-   [boundary/error]

## Requirements

### Functional Requirements

-   FR-001: [testable requirement]
-   FR-002: [testable requirement]

### Non-Functional Requirements

-   NFR-001 (Performance): [target]
-   NFR-002 (Security): [policy]

## Key Entities

```typescript
interface Entity {
    id: string;
}
```
````

## Error Handling

-   `ERROR_CODE`: [condition]

## Review & Acceptance Checklist

-   [ ] Testable, measurable ACs
-   [ ] No implementation details
-   [ ] All ambiguities marked

````

### 3.4 Plan (plan.md)
- Decide architecture with rationale; fill Technical Context.
- Constitution Check gates: Simplicity, Anti-Abstraction, Integration-First, Testing.
- Project Structure and Phase outputs defined.
- Gate: If gates fail without justification, do not proceed.

Plan authoring template (inline reference):
```markdown
# Implementation Plan: [FEATURE]
**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [path]

## Summary
## Technical Context (Language/Deps/Storage/Testing/Platform/Perf/Constraints/Scale)
## Constitution Check (Simplicity/Architecture/Testing/Observability/Versioning)
## Project Structure (docs/src/tests layout)
## Phase 0: Outline & Research (unknowns list)
## Phase 1: Design & Contracts (artifacts to produce)
## Phase 2: Task Planning Approach (how to derive tasks)
## Complexity Tracking (if any)
## Progress Tracking (checklist)
````

### 3.5 Research (research.md)

-   For each unknown/decision: Decision, Rationale, Alternatives, Trade-offs, Benchmarks/Cost, Risks/Mitigations.
-   Gate: All `[NEEDS CLARIFICATION]` resolved or escalated with options.

Research authoring template:

```markdown
# Research Results: [FEATURE]

## [Topic]

-   Decision:
-   Rationale:
-   Alternatives:
-   Trade-offs:
-   Benchmarks/Cost:
-   Risks & Mitigations:
-   References:
```

### 3.6 Design Outputs

-   data-model.md: Only feature-scoped entities; cross-feature → `_shared/`.
-   contracts/: OpenAPI (api.yaml), endpoints.md, schemas.json.
-   quickstart.md: 3–5 critical validation scenarios with PASS/FAIL criteria and troubleshooting.

Data-model authoring template:

````markdown
# Data Model: [FEATURE]

## Core Entities

```typescript
interface Entity {
    id: string;
}
```
````

## Relationships

## Validation Rules

## Indexes & Query Patterns

## Migration Strategy (initial/load cadence)

## Caching Strategy (keys/TTL)

## Backup & Recovery

````

OpenAPI authoring tips:
- Prefer precise types (enum/format/pattern/min/max)
- Separate error schema; reuse via components.responses
- One path per endpoint; include examples

Quickstart authoring template:
```markdown
# Quick Start: [FEATURE]
## Prereqs
## Scenarios (PASS/FAIL) with steps and success criteria
## Performance Targets
## Troubleshooting
## Result Log (table)
````

### 3.7 Tasks (tasks.md)

-   TDD-first ordering: Contract → Integration → E2E/UI → Unit → Impl.
-   Mark [P] for parallel tasks that touch different files.
-   Include Dependencies, Parallel Examples, Validation Checklist.

MANDATORY task granularity policy:

-   Decompose into smallest verifiable units. Avoid “big-bang” tasks.
-   API: at least 1 task per endpoint per concern: contract test, implementation, error cases.
-   Model: 1 task per entity; validations separate if complex.
-   Service: 1 task per business capability.
-   UI: 1 task per component/page; state or accessibility as separate tasks if nontrivial.

Definition of Done (per task):

-   A passing test exists and covers the task scope.
-   Lints pass; no type errors; docs updated if behavior visible.
-   Task status updated in tasks.md (completed tasks marked with [x]).

Tasks authoring template:

```markdown
# Tasks: [FEATURE]

## Phase 3.1: Setup

-   [ ] T001 Init project structure

## Phase 3.2: Tests First (TDD)

-   [ ] T010 [P] Contract test GET /v1/resource in tests/contract/test_get_resource.py

## Phase 3.3: Core Implementation

-   [ ] T020 Implement GET /v1/resource endpoint

## Phase 3.4: Integration

-   [ ] T030 Configure CORS/logging/cache

## Phase 3.5: Polish

-   [ ] T040 Unit tests for validators

## Dependencies

## Parallel Examples

## Validation Checklist
```

### 3.8 Execution & Validation

-   Implement minimal code to make tests pass; keep diffs small.
-   Update docs as sources-of-truth when behavior changes.

### 3.9 Report Management

-   When a task or feature is completed, AI agents may generate reports (예: 테스트 리포트, 분석 리포트).
-   All such reports must be saved in the `docs/reports/` directory.
-   **Report Language (MANDATORY)**: All reports must be written in Korean (한국어).
    -   Exception: Code snippets, command outputs, and technical logs may remain in English for accuracy.
    -   Technical terms may use English in parentheses for clarity.
-   Report naming convention: Always prefix with timestamp in `YYMMDDTT` format followed by descriptive name (e.g., `25110203-VPN-SERVER-TEST-REPORT.md`).
    -   `YY`: 2-digit year
    -   `MM`: 2-digit month
    -   `DD`: 2-digit day
    -   `TT`: 2-digit time (00-23 for hour, or sequential number if multiple reports in same day)
-   Keep reports organized by type or feature if the volume grows (e.g., `docs/reports/testing/`).

## 4. Scope Rules

-   Feature docs (`spec.md`, `data-model.md`, `contracts/`) contain only feature-scoped content.
-   Shared concepts live in `docs/2.specs/_shared/` and are referenced (never copied).
-   When a feature introduces/changes a shared concept:
    -   Update `_shared/` first (PR 1)
    -   Update feature docs to reference new shared artifacts (PR 2)
    -   Note impact in plan.md (Complexity/Impact)

#### Change Classification & Update Flow (MANDATORY)

Decision Tree (shared vs feature)

1. Reusable across multiple features? YES → 2 / NO → place in feature docs
2. Baseline/standard (infra policy, CI template, security)? YES → `_shared/` / NO → 3
3. Experimental/feature-specific? YES → feature first, consider promotion later / NO → `_shared/`

Update Flow Examples

-   Infrastructure
    -   Shared: New cloud policy → `_shared/infra/environments.md`
    -   Feature: Custom VPC for a service → `[###-feature-slug]/plan.md`
-   CI/CD
    -   Shared: Standard pipeline template → `_shared/ci-cd/pipelines.md`
    -   Feature: Feature runtime config → `[###-feature-slug]/plan.md`
-   Schemas
    -   Shared: Common error response format → `_shared/schemas/errors.json`
    -   Feature: Feature API contract → `[###-feature-slug]/contracts/api.yaml`

Promotion/Demotion

-   Experiment → Standard: Move from feature to `_shared/`, update references
-   Standard → Deprecated: Move to `_shared/deprecated/`, note migration path
-   Version Tracking: Use semantic versioning in `_shared/` artifacts

PR/Release Process

1. Update `_shared/` → PR 1
2. Update affected features → PR 2
3. Update `docs/3.release/RELEASE-YYYY-MM-DD.md` with impacts

## 5. Quality Gates & Checklists

### 5.1 Spec Gate

-   [ ] All acceptance criteria are testable and measurable
-   [ ] No implementation details in spec.md
-   [ ] All ambiguities marked with `[NEEDS CLARIFICATION]`

### 5.2 Plan Gate

-   [ ] Constitution Check passes or deviations justified
-   [ ] Clear project structure decision
-   [ ] Performance/Security targets stated

### 5.3 Design Gate

-   [ ] OpenAPI and JSON Schemas validate
-   [ ] quickstart.md has ≥3 PASS/FAIL scenarios
-   [ ] data-model.md aligned with contracts

### 5.4 Tasks Gate

-   [ ] Tests precede implementation tasks
-   [ ] [P] tasks are truly independent (no same-file edits)
-   [ ] Dependencies documented
-   [ ] Task granularity respected (endpoint ≥ 1 task; no large “mega” tasks)
-   [ ] Each task has explicit DoD with passing tests

### 5.5 Release Gate

-   [ ] Release notes created/updated
-   [ ] Backward compatibility noted or migration plan included
-   [ ] Links to CI/test results attached

## 6. Security & Safety Rules

-   Never include secrets, tokens, or real endpoints in docs.
-   Respect license terms for libraries/APIs; record in research.md if relevant.
-   Log PII-safe only; default to redaction.
    \*\*\* End Patch

## 7. Agent Behavior in Cursor

-   Always show minimal diffs and reference changed paths.
-   Prefer running read-only actions before edits; confirm gates.
-   Use non-interactive commands with safe flags; avoid long-running foreground jobs.
-   When blocked, produce options (A/B/C) with trade-offs and ask for a choice.

## 8. Glossary

-   Feature Slug: `NNN-kebab-case` (sequential; 3 digits)
-   Contracts: OpenAPI/JSON schemas defining IO
-   Gates: Required checks to proceed to next phase

## 9. Templates (Pointers)

-   Do not depend on external template directories. The authoritative templates are embedded above in this file.
-   Adapt wording to project domain but keep the section names and gates intact.

## 10. Language and Communication Guidelines

### 11.1 Response Language

-   **Primary Language**: Korean (한국어)
-   **Code Comments**: English for technical clarity
-   **Documentation**: Korean for user-facing content, English for technical specifications

### 11.2 Communication Style

-   Use natural, conversational Korean
-   Maintain professional but friendly tone
-   Explain technical concepts in accessible Korean terms
-   Use Korean technical terminology when appropriate

### 11.3 Code and Technical Content

-   Variable names and function names: English
-   Comments within code: Korean for better team understanding
-   API documentation: English for international compatibility
-   User interface text: Korean
-   Error messages: Korean for end users, English for developers

### 11.4 Agent Responses

-   Always respond in Korean unless specifically requested otherwise
-   Provide clear explanations in Korean for technical concepts
-   Use Korean for status updates, confirmations, and user interactions
-   Maintain consistency in Korean terminology across all responses

## 12. Brownfield Mode (Partially Implemented Projects)

Use this mode when inheriting an existing/abandoned codebase with partially implemented APIs/features.

### 12.1 Baseline Intake (MANDATORY)

-   Endpoint Inventory: Discover implemented endpoints (router scan, logs, or traffic sampling). Record method, path, params.
-   Schema Inventory: Introspect DB schemas/migrations; export read-only snapshots.
-   Dependency Inventory: Lockfiles and runtime deps; note versions/pin drift.
-   Contract Reverse-Extraction: Generate a live OpenAPI stub from running service or sample requests.
-   Coverage Baseline: Measure current test coverage; store as starting point.

### 12.2 Contract Drift Guard

-   Diff live contracts vs `contracts/api.yaml`; produce a “contract drift report”.
-   If drift exists: create ADR with options (update code vs update contract); block behavior-changing edits until resolved/approved.
-   Add a CI check to fail on new drift beyond approved ADR.

### 12.3 Regression Safety Net

-   Create a regression pack:
    -   Contract tests per live endpoint (happy path + key error cases)
    -   Integration/E2E smoke for primary user journeys
    -   Golden artifacts (API response snapshots/schema snapshots) where stable
-   All fixes must add/extend these tests first (RED → GREEN → REFACTOR).

### 12.4 Data & Migration Safety

-   Default read-only posture; destructive ops forbidden by policy.
-   Migration Gate (all required): Verified backup, dry-run in staging, documented rollback plan, change window noted.
-   Environment allowlist for write operations; never run in production by default agents.

### 12.5 Feature Flags

-   Any behavior change behind a flag; default OFF.
-   Plan staged rollout (internal → canary → cohort → 100%).
-   Document flag ownership, expiration/sunset plan.

### 12.6 Task Granularity (Brownfield-Specific)

-   Bugs: Reproduce → Write failing test → Fix minimal surface → Add regression.
-   Endpoints: At least one task per endpoint per concern (contract, impl, error handling).
-   Avoid “mega” tasks; prefer smallest verifiable slices with clear DoD.

### 12.7 Documentation Sync

-   If code is ahead of docs, create a “delta spec” in the feature folder summarizing observed behavior vs intended.
-   Decide promotion to `_shared/` for reusable pieces; otherwise keep feature-scoped and reference.

### 12.8 CI/CD Progressive Gating

-   Level 0 (observe): Lint/test run, no block; publish reports.
-   Level 1 (warn): Block on critical issues only (failing tests, broken schemas).
-   Level 2 (enforce): Full gates (lint, tests, coverage min, schema/contract validation, secret scan).
-   Increase level per module/service as stability improves.

### 12.9 Observability & Quality Baseline

-   Structured logging (JSON) with correlation IDs; error taxonomy; minimal request metrics.
-   Define initial SLOs and error budgets; track in CI dashboards.

### 12.10 Security & Compliance

-   Enable SAST/Dependency/Secret scans; produce SBOM.
-   Record licenses and constraints in `research.md` if relevant.

### 12.11 Environment Map

-   Document environment mapping, endpoints, and access policies (no secrets in repo; use placeholders).
-   Record feature flags per environment and default values.
-   For rapid development: single environment (main server) is sufficient.

### 12.12 Brownfield Checklist

-   [ ] Endpoint/DB/Dependency inventories created
-   [ ] Live vs contract drift analyzed; ADR recorded/approved
-   [ ] Regression pack (contract/integration/snapshots) in place
-   [ ] Feature flags defined for behavior changes
-   [ ] Migration safeguards (backup/dry-run/rollback) prepared
-   [ ] CI gating level set (0/1/2) and next step defined
-   [ ] Observability baseline enabled (logging/metrics)
-   [ ] Security scans enabled; SBOM generated
-   [ ] Environment map documented; secrets out of repo

### 12.13 Policy Alignment (Brownfield)

-   When brownfield projects deviate from this guide's policies, initiate and deliver a dedicated feature to bring the project into compliance.
-   Include spec/plan/tasks under `docs/2.specs/`, capture ADR for trade-offs, and use staged rollout with a rollback plan.

## 14. Human-in-the-Loop (HITL) Policy

-   Goal: Minimize unnecessary prompts and request human input only when it reduces risk or is strictly required

### 14.1 Principles

-   Minimal intervention: If the choice is clear and risk is low, the agent proceeds autonomously
-   Explicit approval: Risky changes require approval before execution
-   Auditability: Log who/what/when/why for decisions and interventions

### 14.2 When human intervention is required

-   Security/Access: login, 2FA, granting roles/permissions, provisioning secrets/tokens
-   External platforms: third-party integration config, billing/charges, org-level policy changes
-   Data/Schema: migrations, schema changes, bulk data writes/updates
-   Production impact: rollback operations, real user traffic, payments, writes against production data
-   Legal/Compliance: personal data flows, regulated changes, license changes
-   Product decisions: major UX changes; ambiguous or conflicting requirements

### 14.3 When human intervention is NOT required

-   Local/sandbox/mock-only, fully reversible work
-   Docs/tests only (comments, test additions/updates, snapshots)
-   Non-destructive refactors with identical behavior; lint/format fixes
-   Scaffolding/boilerplate/templates and examples

### 14.4 Decision levels (gates)

-   A0 Autonomous: low risk, reversible → proceed; record change log
-   A1 Assisted: low ambiguity with a preferred option → choose and record rationale
-   A2 Approval-required: security/data/production impact → run the approval checklist first
-   A3 Human-only: secret issuance, accounts/billing, regulatory decisions → agent provides guide/checklist only

### 14.5 Approval checklist (A2+)

-   Change summary (what/why/where)
-   Risks (security/data/cost/reversibility)
-   Environment and rollback plan
-   Verification evidence (tests/mocks/dry-run)
-   Operations plan (monitoring/flags/status updates)

### 14.6 Minimize questions

-   Decide when best practices are clear; record rationale
-   Batch input requests: values/permissions/accounts/deadlines in one message
-   Offer defaults plus 1–2 alternatives with concise trade-offs

### 14.7 Blockers & escalation

-   State blocking reason (missing inputs/permissions/policy/ambiguity)
-   Offer workarounds (mock/local), alternatives, or a staged plan
-   On timeout, report status and propose the best next step

### 14.8 Audit/logging

-   Record level (A0–A3), approver, rationale, timestamp
-   Reproduction info: environment, commands, artifact links
-   Security: never store secrets; use placeholders

### 14.9 Request template (human → agent)

-   Goal and success criteria
-   Environment/scope (DEV/STG/PRD, impacted areas)
-   Risk tolerance (conservative/standard/aggressive)
-   Required inputs (keys/roles/accounts/URLs) and delivery method
-   Deadline/priority
-   Approver/contact

## 15. Feature Size Management (SDD-Aligned)

-   Goal: Prevent oversized features; keep slices releasable, test-first, low-risk

### 15.1 Split Triggers

-   tasks.md length > 300 lines or > 30 tasks
-   Lead time estimate > 5 business days for a single feature
-   3+ boundaries touched simultaneously (Contract/Integration/UI/Data)
-   Requires 2+ teams to work in parallel

### 15.2 Slicing Rules

-   Vertical thin slices delivering user-visible value end-to-end (Contract → Integration → UI)
-   Each slice has its own Acceptance Criteria, tests, and can be released independently
-   Prioritize high-risk or uncertain parts first

### 15.3 Tasks Structure Options

-   Split into new features (e.g., 021 → 022/023) when triggers fire
-   Or, keep feature id and split `tasks.md` into `tasks/` folder with indexed files:
    -   `tasks/t01-contract.md`, `tasks/t02-integration.md`, `tasks/t03-ui.md`, ...
-   Keep a short TOC in `021/tasks.md` linking to subfiles

### 15.4 Sample Split Guide (021 → 022/023)

1. Create `022-<slice-a>` and `023-<slice-b>` features under `docs/2.specs/`
2. Move associated ACs and tasks from `021/tasks.md` into each new feature’s `tasks.md`
3. Update cross-references (plan/spec/quickstart) to reflect scope changes
4. Add regression and contract tests per new feature; keep releases small
5. Deprecate or minimize `021/tasks.md` to a TOC with links to 022/023

### 15.5 Governance

-   CI check: warn if tasks.md exceeds triggers
-   Review gate: require split plan when triggers are hit
-   Release notes: record split rationale and impact

## 16. 1인 운영자 기본설정 (Solo Operator Defaults)

This section records project-specific defaults based on the current owner's context: solo operator, basic app/web experience, limited networking/security expertise, and AI-agent–led development. When conflicts arise, this section overrides generic guidance while preserving safety gates.

### 16.1 Development Mode Defaults

-   Default to Rapid Development Mode at all times (single branch `main`, skip PRs) unless explicitly escalated.

### 16.2 Decision Levels & Mandatory Approvals (Conservative by Default)

-   Default risk posture: conservative.
-   Require explicit owner approval (A2) before any of the following:
    -   Security/auth/crypto changes; VPN/firewall/routing/DNS modifications
    -   Infrastructure provisioning or cost-incurring actions (cloud resources, quotas)
    -   Database schema/migration or bulk data changes
    -   Production-impacting behavior changes (availability, user data path)
    -   Payments/billing/monetization integration or pricing changes
-   Provide at approval time (in Korean):
    -   1. Short summary, 2) Recommended option, 3) Alternatives (A/B/C) with pros/cons,
    -   4. Risks/cost estimate, 5) Rollback plan, 6) Test strategy & environment rationale.

### 16.3 Environment Choice Policy (Local-First)

-   Prefer local, mocks, emulators by default; avoid cloud provisioning without prior approval.
-   If cloud usage is required, propose an ephemeral/sandbox plan with teardown steps and cost cap.
-   Record a one-line rationale for chosen environment in status updates.

### 16.4 Testing & Safety Nets

-   Tests-first remains mandatory: contract/integration tests precede implementation for externally observable behaviors.
-   Security-sensitive or behavior-changing features must be behind feature flags (default OFF) with a clear sunset plan.
-   Use dry-runs where possible; include verifiable rollback steps. Destructive DB operations remain prohibited.

### 16.5 Communication & Explainability (Owner-Friendly)

-   All user-facing explanations and approvals in Korean; keep code/spec in English as needed.
-   Every risky proposal must include: "짧은 요약", "권장안", "대안", "위험/비용", "테스트/롤백", "다음 행동".
-   Include a one-paragraph non-expert explanation when networking/security concepts affect a decision.

### 16.6 Cost Guardrails

-   Default to free-tier or local alternatives; estimate monthly and per-run costs for any cloud plan.
-   Set an explicit cost cap; do not exceed without approval.

### 16.7 Secrets & Credentials Handling

-   Never request real secrets in chat; use placeholders and provide a secure setup guide.
-   Maintain `.env.example` and ignore real `.env` files; never add secrets to the repository.

### 16.8 Task Management & Planning (Sequential-Thinking Alignment)

-   For new features, outline 4–6 sequential steps with risks, alternatives, dependencies, and test plans before implementation.
-   Proceed autonomously for low-risk, reversible work; pause at the approval gates in 16.2.

### 16.9 Infra & Data Defaults

-   Prefer local SQLite/Firestore emulators for development; avoid live data paths.
-   Any schema evolution requires tests, backup/restore notes, and explicit approval.

### 16.10 Status Update Cadence

-   Provide brief status updates at kickoff, before/after tool batches, and upon completion, focusing on: what changed, why, next action, and risks if any.

### 16.11 Reports

-   When generating reports, save them under `docs/reports/` in Korean, following the timestamped naming convention in §3.9.

### 16.12 Precedence

-   If this section conflicts with earlier generic guidance, apply this section first and cite the deviation in the status update.
