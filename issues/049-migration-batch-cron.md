# 049 — Migration: batch processing cron

**Workstream:** W9
**Tag:** AFK
**Blocked by:** #047
**User stories:** US-5

## Behaviour

The `migration_batch` pipeline processes pending migration records in batches on a cron schedule. Phani triggers the initial scan (#044) and then the cron takes over, running classify+prepass → canonical_rewrite → confidence_archive for each batch autonomously. High-confidence items flow straight to vault; low-confidence items queue for Friday review. The batch cron runs daily (or on-demand) until all pending records are processed.

## Acceptance criteria

- [ ] APScheduler registers `migration_batch` as a daily job (or configurable interval; default every 4 hours while migration is active).
- [ ] Each run processes up to `batch_size` (default 20) pending records through all three pipeline stages.
- [ ] A `processor_runs` row is written with `pipeline = 'migration_batch'`, start/end times, and item counts.
- [ ] The cron respects a `[migration] enabled = true/false` config flag; when false, the job is registered but skips immediately with a log message.
- [ ] Failures on individual records are logged and skipped; the batch continues.
- [ ] When all records are processed (no more `reviewed_at IS NULL AND confidence_tier = low_queued_for_review` and no more pending), the cron logs "Migration complete" and self-disables (`enabled = false`).
- [ ] Integration test: pre-load 3 migration_records, run the cron, verify all are processed and `migrated_at` is set.

## Notes

The migration batch cron is intended to run autonomously for days or weeks, not as a one-time operation. It is designed to be restartable — if Loom Core restarts mid-migration, the next run picks up where it left off.

Cron schedule from PRD §6.4: `migration_batch` is not explicitly scheduled (it's event-driven); implement as a low-frequency interval trigger (every 4 hours, configurable).
