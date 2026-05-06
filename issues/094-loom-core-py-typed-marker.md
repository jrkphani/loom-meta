# #094 — Add py.typed marker to loom-core

**Tag:** AFK
**Phase:** Hygiene
**Depends on:** none
**Estimated effort:** 1 line

## Summary

Add `loom-core/src/loom_core/py.typed` (empty file) so `mypy --strict` treats `loom_core` as a typed package when imported from outside its own source tree (tests/, loom-mcp, future cross-package consumers).

## Background

Surfaced at #010 closure: `uv run mypy --strict tests/` (run alone, without `src/` in the same invocation) raises 88 import-untyped errors for every test file that imports `loom_core.*`. Root cause is the missing `py.typed` marker. `loom-mcp` already has the marker (`loom-mcp/src/loom_mcp/py.typed`); `loom-core` doesn't.

The errors don't appear under `mypy --strict src/ tests/` (joint invocation), which is why they were masked at #012 closure. Adding the marker resolves the issue regardless of invocation.

## Acceptance criteria

- `loom-core/src/loom_core/py.typed` exists (empty file).
- `uv run mypy --strict tests/` (run without `src/` in the same invocation) passes with zero errors.
- `uv run mypy --strict src/ tests/` (joint invocation) continues to pass with zero errors.
- No other files modified.

## Notes

Companion to #093 (alembic mypy --strict cleanup). Both are sub-1-line hygiene PRs that keep the type-check gate well-defined under any invocation form.
