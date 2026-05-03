# 089 — Operations log: append-only JSONL with replay-on-startup

**Workstream:** W13 (Phase D — v0.8 alignment)
**Tag:** AFK
**Blocked by:** #076
**User stories:** US-33, US-37; refactor plan §8.1 (blueprint §11.9)

## Behaviour

An append-only operations log lands at `loom_core/observability/operations_log.py`. Every mutating operation (event create, atom extract, attachment, dismissal, retraction, brief render, state change) writes a JSONL entry: `started` when the op begins, `completed` when it succeeds, `failed` when it terminally fails. The log file rotates daily (`ops-YYYY-MM-DD.jsonl` under `~/Library/Application Support/Loom/logs/`). On daemon startup, a replay pass reads the most recent log file and finds entries where status is still `started` more than 5 minutes ago — those are operations that crashed mid-flight. The scheduler picks them up for replay (using the operation's stored `inputs` to reconstruct context, idempotent via #090's Idempotency-Key cache).

## Acceptance criteria

- [ ] `loom_core/observability/operations_log.py` defines `append(*, op_type, op_id, inputs?, details?, status)` and `find_incomplete(*, since)`.
- [ ] Every JSONL entry has: `op_id` (ULID), `op_type` (str), `timestamp` (ISO 8601 UTC), `service` (always `loom-core` for now), `inputs_hash` (SHA-256 of serialised inputs, NULL if no inputs), `status` (`started` | `completed` | `failed`), `details` (JSON object).
- [ ] Log files written to `~/Library/Application Support/Loom/logs/ops-YYYY-MM-DD.jsonl` (configurable; default reflects launchd plist working directory). Parent directory created if absent.
- [ ] Daily rotation at midnight UTC (file name reflects the day of the entry, not the day of the rotation).
- [ ] `find_incomplete(since)` reads log files since the given timestamp and returns entries where the latest status for an op_id is `started` (no later `completed` or `failed` entry) and the `started` timestamp is older than 5 minutes.
- [ ] Daemon startup hook calls `find_incomplete(since=now() - 1h)` and surfaces results in `loom doctor` output and to the scheduler for replay.
- [ ] At least the following operations write entries: `event.create`, `atom.extract`, `atom.attach`, `atom.dismiss`, `atom.retract`, `brief.render`, `state.change`, `state_inference.run`, `inbox_sweep.run`.
- [ ] Tests: append + find_incomplete happy path; rotation across day boundary; corrupt JSONL line is logged-and-skipped (not fatal).
- [ ] `loom doctor` includes a section summarising operations log state: today's entry count, today's failure count, count of incomplete ops > 5 minutes old.

## Notes

Reference implementation in refactor plan §8.1 — copy-paste-adapt.

**Why JSONL files rather than a SQLite table**: ops log writes are high-frequency and SQLite is the sole writer to the database; piling ops log into the DB contention path is bad. JSONL on the filesystem is fast (single fsync per line if needed), atomically rotatable, easy to grep, and compatible with any log aggregator down the road.

**Why per-day file rotation**: aligns with `loom doctor` and the daily rhythm. Easier to reason about "today's failures" with a single file.

**Replay on startup**: launchd auto-restarts loom-core on crash. Without replay, in-flight ops become silent failures — an inbox-sweep that crashed mid-extraction loses the atoms it would have produced. Replay reads the started-but-not-completed entries and re-runs them, idempotent via #090.

**5-minute threshold**: ops that finish in <5 minutes typically don't need replay — they probably completed. Ops still marked `started` after 5 minutes are very likely casualties of a crash. Adjustable per op_type if needed.

**Replay safety**: the replay path goes through the same API surface as the original op, with the original Idempotency-Key (stored as `op_id`). If the op actually completed before the crash but the `completed` entry didn't make it to disk, the cache hit returns the same result and the duplicate marker is silently skipped.

**Log retention**: 90 days, then archived (compressed) for a year. Hooked into existing log rotation policy. No PII in ops log beyond what's already in domain entities — inputs are hashed, not stored verbatim.

**This is the substrate for #090 (idempotency) and #091 (audit jobs).** Both depend on the ops log being present and structured.
