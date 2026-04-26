# 009 — inbox_sweep cron job wiring

**Workstream:** W3
**Tag:** AFK
**Blocked by:** #008
**User stories:** US-1, US-2, US-3

## Behaviour

The `inbox_sweep` pipeline runs every 5 minutes via APScheduler. It scans the configured `inbox/work/` directories for new files, passes each to the inbox sniffer, and records the run (success/failure, item count) in `processor_runs`. Failures are logged but do not crash the daemon; the next cycle retries. The `inbox_sweep` job is the entry point that makes capture automatic rather than manual.

## Acceptance criteria

- [ ] APScheduler is configured with an `IntervalTrigger(minutes=5)` for the `inbox_sweep` job at app startup.
- [ ] Each run writes a row to `processor_runs` with `pipeline = 'inbox_sweep'`, `started_at`, `completed_at`, `items_processed`, `items_failed`.
- [ ] An unprocessable file (e.g., zero-byte, unreadable) increments `items_failed` and is logged at WARNING level; the sweep continues to the next file.
- [ ] `GET /v1/health` reflects the last `inbox_sweep` run time (queried from `processor_runs`).
- [ ] A test using a temp `inbox/` directory confirms: two new files → two events created → `processor_runs` row has `items_processed=2`.
- [ ] Running the sweep twice on the same directory with no new files results in `items_processed=0`.

## Notes

APScheduler is already a dependency (`apscheduler>=3.10`). The scheduler is initialised in the FastAPI lifespan handler. Use `AsyncIOScheduler` with the asyncio event loop.

The job function: `async def inbox_sweep_job(db_factory, vault_path, config)`. Dependencies are passed at registration time (closures or dependency injection pattern).

Cron schedule from PRD §6.4: `inbox_sweep` every 5 minutes.

`processor_runs` table is in the W1 migration (section 5). The health endpoint (already implemented) needs to be updated to query `processor_runs` for the last run timestamp.
