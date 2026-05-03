# 089 — Operations log: JSONL append + replay-on-startup

**Workstream:** W18
**Tag:** AFK
**Blocked by:** —
**User stories:** US-33 (loom doctor visibility), US-34 (auto-restart resilience)

## Behaviour

An append-only operations log records every significant operation across loom-core: cron run starts and completions, retractions, brief generations, migrations, mutations through idempotent API endpoints. The log lives as JSONL files under `/var/log/personal-os/loom-core/ops-YYYY-MM-DD.jsonl`. On daemon startup, an `ops_replay` routine scans for ops with status `started` but no `completed`/`failed` and offers them to the scheduler for replay (or marks them as `failed_orphaned` after a timeout window).

The log serves three purposes per blueprint §11.9: replay on restart (the "no work lost on crash" promise); audit trail (forensic debugging when a brief looks wrong); and the substrate for the quarterly routing-matrix audit (#091).

## Acceptance criteria

- [ ] `loom_core/observability/operations_log.py` is created with `append(op_type, op_id, inputs, details, status)` and `find_incomplete(since)` as public functions.
- [ ] `append` writes one JSON line per call to `/var/log/personal-os/loom-core/ops-{YYYY-MM-DD}.jsonl` (date in UTC). Directory is created if missing.
- [ ] Each line conforms to schema: `{op_id, op_type, timestamp, service, inputs_hash, status, completion_timestamp?, details}`. `inputs_hash` is sha256 over canonical-JSON of `inputs`.
- [ ] Status values: `started`, `completed`, `failed`. The same `op_id` is appended once with `started`, then again with `completed` or `failed` and a populated `completion_timestamp`.
- [ ] `find_incomplete(since)` scans JSONL files and returns ops with `started` but no matching `completed`/`failed` — used for replay.
- [ ] On daemon startup (`main.py` lifespan), an `ops_replay()` coroutine runs: finds incomplete ops within the last 24h, dispatches each to its handler (per `op_type`), logs the replay outcome.
- [ ] Cron jobs (inbox sweep, state inference, brief generation, leverage inference, kg reconcile) all call `append` at start and at completion/failure.
- [ ] Retraction service (#084) calls `append` per retraction.
- [ ] An ops-log shape gate runs in CI: a synthetic test produces a small JSONL file and validates every line against a Pydantic schema; malformed lines fail the build.
- [ ] Unit tests cover: append produces correct schema; `find_incomplete` correctly identifies orphaned `started` ops; replay dispatch happens without crashing on unknown op_types.
- [ ] An integration test seeds an op as `started` only, then runs the lifespan startup, asserts replay attempted (or marked orphaned).
- [ ] All four CI gates pass.

## Notes

Reference: `loom-meta/docs/loom-refactor-v08-plan.md` §8.1.

JSONL was chosen over a SQLite ops table because: (a) ops are operational, not relational — no joins needed; (b) external forensics tools (jq, ripgrep, log-shipping if added later) work directly against JSONL; (c) backup is `cp` rather than a SQLite-specific dump; (d) the file is cheap to rotate (one file per day; standard log-rotation rules apply via #073).

Inputs hash, not full inputs: storing every payload to disk would bloat the log and risk leaking sensitive content. The hash answers "did the same op already complete with these inputs?" — sufficient for idempotency check (#090) and audit.

`/var/log/personal-os/loom-core/` requires the loom-core launchd plist to grant write permission; the directory creation in `append` is best-effort and falls back to `~/Library/Logs/personal-os/loom-core/` if `/var/log` is not writable. This fallback is tested.

After this lands, Phase D's idempotency middleware (#090) and the quarterly audit (#091) have their substrate.
