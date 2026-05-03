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
