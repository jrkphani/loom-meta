# 089 — Operations log: append-only JSONL + replay-on-startup

**Workstream:** W18
**Tag:** AFK
**Blocked by:** #003
**User stories:** none (foundational hardening)

## Behaviour

Per blueprint §11.9, an append-only JSONL operations log captures every meaningful operation: the start, completion, and failure of cron jobs, retractions, schema migrations, brief generations, and inference runs. On daemon startup, the scheduler reads the log for incomplete operations (status='started' with no matching 'completed' or 'failed') and decides whether to replay them. The log is the substrate for forensic debugging, audit trail, and the §11.9 replay-on-restart guarantee.

## Acceptance criteria

- [ ] `loom_core/observability/operations_log.py` exposes `append(op_type, op_id, inputs=None, details=None, status='started')` async function.
- [ ] Log file path: `~/Library/Application Support/Loom/logs/operations/ops-YYYY-MM-DD.jsonl` (configurable; daily rotation by date).
- [ ] Each entry contains: `op_id`, `op_type`, `timestamp` (ISO 8601 UTC), `service` (always `loom-core`), `inputs_hash` (SHA-256 of canonicalised inputs), `status`, `details` (free-form dict).
- [ ] `append()` is fail-soft: if the log file cannot be written, the operation continues but a warning is emitted via `structlog`.
- [ ] `find_incomplete(since)` returns ops with status='started' that have no matching 'completed' or 'failed' entry within the time window.
- [ ] On daemon startup, `loom_core/main.py` lifespan handler calls `find_incomplete(since=now-1h)` and logs each incomplete op for human review (auto-replay is opt-in per op_type — out of scope for this issue).
- [ ] Cron jobs (`inbox_sweep`, `state_inference`, `brief_engagement`, `brief_arena`, `kg_reconcile`, `sqlite_backup`, `external_ref_verify`, `leverage_inference`) wrap each run in append('started') / append('completed' or 'failed').
- [ ] Atom retraction (#084) appends `op_type='retraction'` with affected entity counts in details.
- [ ] Schema migrations (Alembic) are wrapped: append('started') before, append('completed') after, append('failed') on exception.
- [ ] Operations log shape validation test: every JSONL line conforms to a JSON Schema (the schema lives in `loom_core/observability/operations_log_schema.json`).
- [ ] CI gate addition: schema validation runs as part of `pytest -m operations_log`.
- [ ] Unit tests: append round-trip; find_incomplete logic; fail-soft on unwritable log dir.
- [ ] All four CI gates pass plus the new operations-log shape gate.

## Notes

Per blueprint §11.9, this log is **the** audit trail. Every op that mutates state outside a single API request boundary (cron, retraction, migration, brief generation) writes to it.

`inputs_hash` is the substrate for idempotency (#090): two operations with the same `inputs_hash` and `op_type` are the same operation. The hash is over canonicalised JSON of inputs (sorted keys).

Replay-on-startup is intentionally **opt-in per op_type** in v1. Auto-replaying an arbitrary op is dangerous — it might re-send an email or re-write a file. The first version logs incomplete ops for human review; opt-in auto-replay can land in v2 once we have evidence about which op_types are safe.

Daily rotation by date keeps individual log files manageable. Retention is forever for v1 (the volume is small — KB per day); a retention policy lands when the volume justifies it.

Refactor plan reference: §8.1 of `loom-meta/docs/v08-alignment-refactor-plan.md`. Blueprint reference: §11.9.

Lives in `loom-core/src/loom_core/observability/operations_log.py`. Tests in `loom-core/tests/observability/test_operations_log.py`.
