# ISSUES

Local issue files from `issues/` are provided at start of context. Parse them to understand the open issues.

You will work on the AFK issues only, not the HITL ones. AFK issues are tagged `**Tag:** AFK` in the issue file's header.

You've also been passed a file containing the last few commits. Review these to understand what work has been done.

If all AFK tasks are complete, output `<promise>NO MORE TASKS</promise>`.

# REPO STRUCTURE

This script runs from `loom-meta`. Sibling repos exist at:

- `../loom-core/` — Python 3.13 FastAPI daemon. Sole writer to SQLite + Obsidian vault.
- `../loom-mcp/` — Python 3.13 MCP server. Thin wrapper over `loom-core`'s HTTP API.
- `../loom-apple-ai/` — Swift Vapor sidecar. **May not exist yet** (deferred to W12).
- `../loom-ui/` — SwiftUI app. **May not exist yet** (deferred to W11).

Most issues touch `loom-core` and `loom-mcp`. Issue files reference paths in those sibling repos using paths relative to the *workspace root* (e.g. `loom-core/src/loom_core/api/engagements.py`). When you `cd` into a sibling repo to work, paths in your tool calls are relative to that repo.

# CONSTITUTION

Before implementing, read the relevant section of the constitution:

- `docs/loom-system-design-v1.md` — architecture, pinned versions, daemon topology. **Authoritative for "how it's built."**
- `docs/loom-blueprint.md` — cross-projection invariants. The structural skeleton.
- `docs/loom-design.md` — principles. The "why."
- `docs/loom-schema-v1.sql` — the data model.
- `docs/loom-api-v1.md` — the HTTP API.
- `docs/projections/cro.md` — the work-domain projection (only v1 projection).

Where the constitution conflicts with intuition, the constitution wins. If the constitution conflicts with the issue, stop and flag it — don't paper over it.

# TASK SELECTION

Pick the next task. Prioritize in this order:

1. Critical bugfixes
2. Development infrastructure (tests, types, dev scripts)
3. Tracer bullets for new features

   Tracer bullets are small slices of functionality that go through all layers of the system, allowing you to test and validate your approach early. For Loom, a tracer bullet typically cuts: schema → service → API route → KG render → MCP tool → integration test.

4. Polish and quick wins
5. Refactors

# EXPLORATION

Explore the relevant repo(s) for the task before coding. Read the constitution sections that apply. Don't change files in the EXPLORE phase.

# IMPLEMENTATION

Use `/tdd` to complete the task. The TDD loop is **vertical** — one behavior at a time:

```
RED   → write ONE test for ONE behavior → it fails
GREEN → write minimal code to pass → it passes
REFACTOR → clean up, no new behavior
REPEAT
```

Do not write tests in bulk. Do not refactor while RED.

# FEEDBACK LOOPS

Before committing, run the gates relevant to **every repo touched by this task**.

For Python repos (`loom-core`, `loom-mcp`):

```bash
cd <repo>
uv run ruff check
uv run ruff format --check
uv run mypy --strict
uv run pytest
```

For Swift repos (`loom-apple-ai`, `loom-ui`):

```bash
cd <repo>
swift build
swift test
```

A task is not complete until all gates relevant to its repo pass with zero errors. If a gate cannot be run, state it explicitly rather than claiming the task is done.

# COMMIT

Each implementation repo has its own git history. Commit inside the repo where the changes were made. If the task touched multiple repos, make one commit per repo.

The commit message must include:

1. Key decisions made
2. Files changed
3. Blockers or notes for the next iteration
4. The issue number (e.g. `Closes loom-meta#042`)

# THE ISSUE

If the task is complete, move the issue file from `issues/` to `issues/done/`.

If the task is not complete, append a note to the issue file describing what was done and why it stopped. Do not move it.

# FINAL RULES

ONLY WORK ON A SINGLE TASK.
