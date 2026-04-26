# 069 — loom doctor: full diagnostics

**Workstream:** W13
**Tag:** AFK
**Blocked by:** none
**User stories:** US-33

## Behaviour

`loom doctor` (CLI, already scaffolded in W1) is extended to show real diagnostics: all three daemon health endpoints, last cron run time per pipeline (from `processor_runs`), disk free under `~/Documents/Loom`, pending triage item count, pending migration review count, and SQLite WAL size. The output is formatted for terminal readability with green/yellow/red status indicators.

## Acceptance criteria

- [ ] `loom doctor` calls `GET /v1/health` and displays: status, version, uptime, db_size_bytes.
- [ ] Calls `GET http://127.0.0.1:9101/v1/health` (Apple AI sidecar) and displays: status (or "not reachable").
- [ ] Queries `processor_runs` (via `GET /v1/health` or a dedicated endpoint) and displays last run time per pipeline: inbox_sweep, state_inference, brief_engagement, brief_arena, kg_render, migration_batch, sqlite_backup.
- [ ] Displays disk free under `~/Documents/Loom/` (using `shutil.disk_usage`).
- [ ] Calls `GET /v1/triage/staleness` and displays total pending triage items, number of degraded engagements.
- [ ] Calls `GET /v1/migration/status` and displays pending review count.
- [ ] Output uses ANSI colour: green for healthy, yellow for degraded, red for error/unreachable.
- [ ] `loom doctor --json` outputs machine-readable JSON (for scripting or CI checks).

## Notes

The CLI already has a skeleton from W1. Extend it in `loom-core/src/loom_core/cli.py` using `typer`.

The Apple AI sidecar health check should have a short timeout (1 second) — if it's not running, display "not reachable" without hanging.

`loom doctor` is the primary diagnostic surface for operational issues (PRD §5.9, US-33). Keep the output concise: all key metrics in < 30 terminal lines.
