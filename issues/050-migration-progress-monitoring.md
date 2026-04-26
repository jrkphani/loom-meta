# 050 — Migration: progress monitoring API

**Workstream:** W9
**Tag:** AFK
**Blocked by:** #048
**User stories:** US-6, US-33

## Behaviour

Phani can check the migration status at any time via the API or `loom doctor`. The monitoring endpoint shows total files discovered, processed (by tier), pending review, accepted, rejected, and any failures. This is the operational visibility surface for the migration — it tells Phani how much of the existing vault has been ingested.

## Acceptance criteria

- [ ] `GET /v1/migration/status` returns: `{total: N, pending: N, processing: N, high_auto_accepted: N, low_queued: N, reviewed_accepted: N, reviewed_rejected: N, reviewed_rerun: N, failed: N, last_batch_at: ISO8601}`.
- [ ] `GET /v1/migration/records` returns a paginated list of `migration_records` with `?confidence_tier=`, `?reviewed=`, `?page=`, `?per_page=` filters.
- [ ] `GET /v1/migration/records/:id` returns a single migration record with full details.
- [ ] `last_batch_at` is derived from the most recent `processor_runs` row where `pipeline = 'migration_batch'`.
- [ ] `loom doctor` (#070) calls `GET /v1/migration/status` and displays pending review count.
- [ ] Service test: create records across all states; assert counts are correct in the status response.

## Notes

The migration status is informational only; this endpoint never modifies state.

The `GET /v1/migration/records` endpoint supports pagination (per_page default 20, max 100) to avoid returning thousands of rows.

`failed` count is derived from `migration_records` rows where `migrated_at IS NULL AND reviewed_at IS NULL AND created_at < NOW() - 24h` (records that were not processed in the last batch despite being scanned >24h ago). This is a heuristic.
