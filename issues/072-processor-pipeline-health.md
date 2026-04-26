# 072 — Processor pipeline health endpoint

**Workstream:** W13
**Tag:** AFK
**Blocked by:** none
**User stories:** US-33, US-34

## Behaviour

The `/v1/health` endpoint is extended to return per-pipeline last-run status: when each cron job last ran, whether it succeeded, and how many items it processed. This gives `loom doctor` and external monitoring tools a complete operational picture without querying `processor_runs` directly. The health endpoint becomes the single operational status surface.

## Acceptance criteria

- [ ] `GET /v1/health` response includes a `pipelines` dict with one entry per pipeline name: `{last_ran_at, success, items_processed, items_failed}`.
- [ ] Pipelines covered: `inbox_sweep`, `state_inference`, `brief_engagement`, `brief_arena`, `kg_render`, `migration_batch`, `sqlite_backup`.
- [ ] If a pipeline has never run, its entry shows `null` for all fields.
- [ ] A pipeline that failed its last run shows `success: false` and the `error_message` from `processor_runs`.
- [ ] The query is efficient: one `SELECT pipeline, MAX(started_at) ... GROUP BY pipeline` query, not N queries.
- [ ] Existing health endpoint tests updated to include the `pipelines` field.

## Notes

The `processor_runs` table (W1 migration) stores one row per run. The health endpoint aggregates the latest per pipeline using a GROUP BY query.

`db_size_bytes` was already marked as `None` in the existing health response (per the existing test: "db_size_bytes is None until W1 wires the database"). This issue should also wire `db_size_bytes` to return the actual SQLite file size in bytes.

Route update: `loom-core/src/loom_core/api/health.py`. Service: `…/services/health.py`.
