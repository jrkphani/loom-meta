# 070 — SQLite backup cron and 30-snapshot retention

**Workstream:** W13
**Tag:** AFK
**Blocked by:** none
**User stories:** US-35

## Behaviour

At 03:00 daily, Loom Core runs `VACUUM INTO` to create a snapshot of the SQLite database. Snapshots are stored at `~/Library/Application Support/Loom/backups/loom_{YYYY-MM-DD}.sqlite`. The retention policy keeps the last 30 snapshots; older ones are deleted. The cron records the run in `processor_runs`.

## Acceptance criteria

- [ ] APScheduler registers `sqlite_backup` at daily 03:00 (CronTrigger).
- [ ] Each run executes `VACUUM INTO '{backup_path}'` via `aiosqlite` on the current database connection.
- [ ] The backup path uses `YYYY-MM-DD` format with today's date.
- [ ] After writing, the job lists all `loom_*.sqlite` files in the backup directory and deletes all but the 30 most recent (sorted by filename, which sorts chronologically due to ISO date prefix).
- [ ] A `processor_runs` row is written with `pipeline = 'sqlite_backup'`, `items_processed = 1`.
- [ ] `GET /v1/health` reports the most recent backup time (queried from `processor_runs`).
- [ ] Integration test: run the job twice with different dates (mocked clock); verify 2 backup files created and old ones removed when count > 30.

## Notes

`VACUUM INTO` is the correct SQLite mechanism for hot backup (no need to stop the DB). It is available in SQLite 3.27+ (W1 requires SQLite 3.38+).

The backup directory is separate from the vault (`~/Documents/Loom/`) so it is NOT iCloud-synced. This is intentional — backups should be local-only, covered by Time Machine.

Cron schedule from PRD §6.4: `sqlite_backup` at 03:00 daily.
