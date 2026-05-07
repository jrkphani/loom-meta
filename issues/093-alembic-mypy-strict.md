# 093 — Alembic mypy strict cleanup

**Workstream:** Maintenance
**Tag:** Code Quality

## Context

Running `uv run mypy --strict alembic` currently fails with pre-existing issues in the W1 migration and `env.py`.
There are two distinct problems:
1. `TextClause` provided to `op.create_index` where `str` is expected in `alembic/versions/2026_04_26_bf4d89061130_w1_universal_core_and_operational_.py`.
2. `import-untyped` errors in `alembic/env.py` due to missing `py.typed` marker in `loom_core` modules.

## Acceptance Criteria

- [ ] Fix the `list-item` type errors in the W1 migration (potentially by casting to `Any` or `str` to appease the type checker, or using `# type: ignore[list-item]`).
- [ ] Add `py.typed` marker to the `loom_core` package (or apply `# type: ignore[import-untyped]` in `env.py` if adding `py.typed` has downstream impacts requiring a larger task).
- [ ] `uv run mypy --strict alembic` passes without any errors.

## Closure note

Landed via Claude Code, 2026-05-06. Bundled with #094 in a single hygiene pass.

- W1 migration `list-item` errors fixed via `# type: ignore[list-item]` on the columns-list line of three `op.create_index` calls (`alembic/versions/2026_04_26_bf4d89061130_w1_universal_core_and_operational_.py` lines 377/381 — `idx_atoms_dismissed` and `idx_atoms_type` — and line 691 — `idx_attach_hypothesis`). Chose `# type: ignore` over `cast(str, ...)` because the runtime type IS `TextClause` for expression-based index columns; the ignore is honest about the stub-vs-runtime gap.
- Note: line 377's `idx_atoms_dismissed` was reflowed from a single-line list literal to a multi-line one so the `# type: ignore[list-item]` comment lands on the correct physical line.
- `env.py:18,19` `import-untyped` errors resolved by #094's `py.typed` marker (no edit needed in this file).
- `uv run mypy --strict alembic`: 5 → 0 errors.
- All eight gates green: ruff check, ruff format --check, mypy --strict src/ tests/, mypy --strict alembic, mypy --strict tests/, pytest (248 passed, 1 skipped), pytest -m visibility (12), alembic check.
