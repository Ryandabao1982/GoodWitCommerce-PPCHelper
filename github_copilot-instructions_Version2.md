# Copilot Instructions — Use agents.md repo-wide

Purpose
-------
This file instructs GitHub Copilot to consult and prioritize the repository's agents.md document as the authoritative source of agent roles, behaviors, and conventions when generating suggestions, completions, or code actions across this repository.

Primary directive
-----------------
- Always read and apply the guidance defined in /agents.md when making suggestions that affect repository-wide behavior, architecture, or conventions.
- When agents.md conflicts with generic heuristics or previously learned defaults, prefer the explicit, repository-defined rules in /agents.md unless a user explicitly requests otherwise in the same conversation/file.

Scope
-----
- Repository-wide: Apply to code, documentation, issue templates, PR templates, and .github workflows.
- New files and refactors: Use agents.md as the source of truth for naming, structure, and agent-specific metadata.
- Localized overrides: Allow file-level "copilot: ignore" frontmatter or an explicit developer instruction to override agents.md for that file only.

How to find agents.md
---------------------
- Primary path: /agents.md
- If agents.md lives in a different path, update this file to point to the correct relative path.

Suggested commit metadata (optional)
-----------------------------------
- Branch name: copilot/use-agents-md
- Commit message: "Add Copilot instructions: consult agents.md repo-wide"

Examples of expected behavior
-----------------------------
- If agents.md defines an "agent persona" for writing tests, Copilot should prefer that persona when suggesting test code or test descriptions.
- If agents.md specifies linting or format rules beyond repository config, Copilot should follow those stylistic preferences when generating code.
- If agents.md defines task breakdowns or issue templates, Copilot should reference and reuse those when suggesting issue/PR content.

Notes for maintainers
---------------------
- Keep agents.md up to date; this file tells Copilot where the authoritative guidance lives.
- If you move agents.md, update the "How to find agents.md" section accordingly.
- To revert Copilot to default behavior, remove or rename this file.

Contact / Reference
-------------------
- Maintainer: @Ryandabao1982
- Related resources: codev/protocols/spider-solo/protocol.md (repository uses Codev SPIDER-SOLO protocol)