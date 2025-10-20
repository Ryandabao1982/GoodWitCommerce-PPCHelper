# AI Vibe Coder Protocol v3.0: The Adaptive Framework

*A disciplined, traceable, and self-improving framework for resilient collaborative software development.*

---

## Table of Contents

1.  [Protocol Onboarding & Roles](#1-protocol-onboarding--roles)
2.  [The Prime Directive: Context & Pre-flight](#2-the-prime-directive-context--pre-flight)
3.  [The Dynamic Blueprint: PLAN.md](#3-the-dynamic-blueprint-planmd)
4.  [Atomic & Versioned Changes](#4-atomic--versioned-changes)
5.  [Proactive Quality Gates](#5-proactive-quality-gates)
6.  [Documentation as a Living Asset](#6-documentation-as-a-living-asset)
7.  [The Feedback Loop: Metrics & Adaptation](#7-the-feedback-loop-metrics--adaptation)
8.  [Contingency & Escalation Protocols](#8-contingency--escalation-protocols)
9.  [Formalized Collaboration & Review](#9-formalized-collaboration--review)
10. [Recommended Project Structure](#recommended-project-structure)
11. [Vibe Coder Philosophy](#vibe-coder-philosophy)

---

## 1. Protocol Onboarding & Roles

**Purpose**: Integrate new agents (human or AI) efficiently and clarify responsibilities.

-   **Onboarding Checklist**: Every new participant must complete:
    -   [ ] Read and acknowledge `PROTOCOL.md`.
    -   [ ] Review the current `PRO.md` and `PLAN.md`.
    -   [ ] Read the last 5 entries in `BUILD_LOG.md` to understand recent activity.
    -   [ ] Set up local tooling (Git, linter, test runner).
-   **Defined Roles**:
    -   **Lead**: Owns `PRO.md` and `PLAN.md`. Prioritizes backlog, resolves ambiguities, and approves major pivots.
    -   **Coder**: Executes tasks from `PLAN.md`. Follows the protocol for implementation, logging, and quality gates.
    -   **Reviewer**: Validates changes for correctness, style, and adherence to `PRO.md`. Can be human or AI. Reviews are logged in `BUILD_LOG.md`.

---

## 2. The Prime Directive: Context & Pre-flight

**Purpose**: Ground every action in intent and ensure readiness before execution.

-   **Declare Intent**: Before acting, state: "I will [Action] to achieve [Goal]."
-   **Reference Authority**: Link to `PRO.md`, user instruction, or `PLAN.md`.
-   **Pre-flight Checklist**: Before starting any implementation, run this check:
    -   [ ] **Requirement Clarity**: Is the task from `PLAN.md` unambiguous? If not, create an issue or flag the Lead.
    -   [ ] **Test Plan**: Do I know how to test this change (unit, integration, manual)?
    -   [ ] **Dependencies**: Are all required libraries or services available?
    -   [ ] **Risk Assessment**: Is this a high-risk change (e.g., database migration, auth logic)? If so, flag it for review.

**Example**:
> I will add the `delete_task` function to `task_manager.py` to implement `PLAN.md#TASK-12`.
>
> **Pre-flight Check**:
> - [x] Requirement is clear: delete by ID.
> - [x] Test plan: unit test for success/failure, CLI integration test.
> - [x] Dependencies: `json` module is standard.
> - [ ] Risk: Low. Does not affect core data structure.
>
> Proceeding with implementation.

---

## 3. The Dynamic Blueprint: PLAN.md

**Purpose**: Evolve the static plan into a real-time, state-aware task tracker.

-   **Task Format**: Each task in `PLAN.md` uses a structured format.
    ```markdown
    - **[ID]**: [TASK-12]
    - **Title**: Delete Task via CLI
    - **Status**: [In Progress | Done | Blocked]
    - **Assignee**: [@Agent-Coder]
    - **Requirement**: [PRO.md#2.2]
    - **Steps**:
        1. [x] Add `delete_task` function.
        2. [ ] Update CLI.
        3. [ ] Write tests.
    ```
-   **State Transitions**: The Coder updates the task status as they work. The Lead reviews and moves tasks to "Done" after successful review and merge.
-   **Blocking**: If a task is blocked, the assignee must add a "Blocker" note with a path to resolution (e.g., "Blocked: Waiting for API key from Lead.").

---

## 4. Atomic & Versioned Changes

**Purpose**: Keep changes focused, reversible, and safely integrated.

-   **Single Commit per Response**: Each response is one logical change.
-   **Feature Flags**: For large, disruptive features, wrap new code in a feature flag.
    ```python
    if config.FEATURE_ADVANCED_DELETION_ENABLED:
        # new, risky deletion logic
    else:
        # old, stable logic
    ```
-   **Commit Message Hygiene**: Enforce a strict format for traceability.
    ```
    [TASK-12] Add delete_task function
    
    Implements the core logic for removing a task by its unique ID.
    Ref: PRO.md#2.2
    ```

---

## 5. Proactive Quality Gates

**Purpose**: "Shift left" on quality by catching issues before they are committed.

-   **Local Pre-commit Hooks**: Every Coder must run a local quality check before committing.
    ```bash
    # Example pre-commit script
    flake8 src/
    black src/
    pytest tests/ --cov=src
    ```
-   **Dependency Scanning**: Before adding a new library, run a security scan (e.g., `safety check`) and log the result in the change log.
-   **Static Analysis**: Use tools like `mypy` (Python) or `TypeScript`'s compiler to catch type errors before runtime.

---

## 6. Documentation as a Living Asset

**Purpose**: Treat documentation with the same rigor as code.

-   **Docstring Coverage**: Aim for 100% docstring coverage on public APIs. Log coverage percentage in `BUILD_LOG.md`.
-   **Documentation Debt**: When creating a shortcut or temporary documentation, add an entry to a `Documentation Debt` section in `BUILD_LOG.md`.
    ```markdown
    ### Documentation Debt
    - **File**: `src/legacy_api.py`
    - **Issue**: Uses outdated docstring format.
    - **Ticket**: [DOC-04]
    ```
-   **Changelog-Driven Docs**: For user-facing changes, the first draft of the changelog entry (`CHANGELOG.md`) should be written *before* the code is finalized.

---

## 7. The Feedback Loop: Metrics & Adaptation

**Purpose**: Use data to measure effectiveness and improve the protocol itself.

-   **Core Metrics** (tracked in `METRICS.md`):
    | Metric | Target | Measurement |
    |---|---|---|
    | Cycle Time (Task → Done) | < 4 hours | `PLAN.md` timestamps |
    | Bug Rate (bugs per release) | < 2 | `BUILD_LOG.md` tags |
    | Test Coverage | > 90% | CI reports |
    | Docstring Coverage | 100% | CI reports |
-   **Adaptation Process**: In a bi-weekly "Protocol Sync," the Lead reviews `METRICS.md`.
    - If a metric is off-target, the team must propose a change to the protocol or workflow.
    - The protocol itself (`PROTOCOL.md`) is versioned (e.g., v3.1) and changed via a formal RFC (see Section 9).

---

## 8. Contingency & Escalation Protocols

**Purpose**: Provide clear procedures for handling unexpected events.

-   **Build Failure**: The Coder who broke the build is automatically assigned to fix it. If unresolved in 30 minutes, escalate to the Lead.
-   **Critical Production Bug**: Create a "hotfix" branch from `main`. The fix bypasses `PLAN.md` but requires a mandatory review from the Lead and a post-mortem in `BUILD_LOG.md`.
-   **Major Requirement Pivot**: The Lead declares a "Pivot." All "In Progress" tasks in `PLAN.md` are moved to a "Backlog" section. The Lead is responsible for creating a new, prioritized `PLAN.md`.

---

## 9. Formalized Collaboration & Review

**Purpose**: Ensure significant changes are discussed and agreed upon.

-   **Request for Comment (RFC)**: For any change that is not a direct implementation of a `PLAN.md` task (e.g., changing the tech stack, refactoring a core module), an RFC must be created.
    -   Create a file `rfcs/0001-new-database.md`.
    -   The RFC includes a "Problem," "Proposed Solution," and "Implementation Plan."
    -   It must be approved by the Lead before work begins.
-   **Review Mandate**:
    -   **Trivial Changes** (typos, simple bug fixes): Can be self-merged by the Coder after passing CI.
    -   **Non-trivial Changes** (new features, refactors): Require at least one Reviewer's approval. The Reviewer's comment is logged in `BUILD_LOG.md`.

---

## 10. Recommended Project Structure

```plaintext
project/
├── PRO.md              # Product Requirements Document
├── PLAN.md             # Dynamic Implementation Roadmap
├── PROTOCOL.md         # This document
├── BUILD_LOG.md        # Chronological record & Documentation Debt
├── CHANGELOG.md        # User-facing changelog
├── METRICS.md          # Project health metrics
├── src/                # Source code
├── tests/              # Test suites
├── docs/               # User and developer documentation
├── backups/            # Auto-generated backups
└── rfcs/               # Requests for Comment (e.g., 0001-new-database.md)
```

---

## 11. Vibe Coder Philosophy

"Code is a conversation with the future. Our framework ensures that conversation is clear, measured, resilient, and constantly improving. We don't just build software; we evolve the process of building it."
