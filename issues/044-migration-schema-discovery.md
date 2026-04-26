# 044 — Migration: schema, source discovery, and batching

**Workstream:** W9
**Tag:** AFK
**Blocked by:** none
**User stories:** US-5, US-7

## Behaviour

The migration pipeline starts by discovering all markdown files in the user's existing work-domain Obsidian vault and registering them in batches for processing. Each source file gets a `migration_records` row tracking its processing state. An Alembic migration adds the `migration_records` table (schema section 3). Files are processed in small batches (configurable, default 20) to allow monitoring and early stopping.

## Acceptance criteria

- [ ] An Alembic migration adds `migration_records` (schema section 3); applies cleanly.
- [ ] `POST /v1/migration/scan` scans a configured `[migration] source_vault_path` directory, discovers all `.md` files, and creates `migration_records` rows with `confidence_tier = 'high_auto_accepted'` as placeholder (updated during processing).
- [ ] Already-scanned files (same `original_path`) are not re-created (idempotent scan).
- [ ] `GET /v1/migration/status` returns: total discovered, processed, pending, failed counts.
- [ ] Batch size is configurable (`[migration] batch_size = 20`).
- [ ] Unit tests: scan a fixture directory with 5 `.md` files; assert 5 migration_records rows created; re-scan asserts still 5 rows.

## Notes

Schema section 3: `migration_records` (lines ~396–413 in `loom-schema-v1.sql`). Key columns: `original_path`, `archived_path`, `canonical_event_id`, `canonical_artifact_id`, `confidence_score`, `confidence_tier`, `llm_used`, `migrated_at`, `reviewed_at`, `review_decision`.

The `archived_path` convention: `archive/work/originals/{relative_path_from_source_vault}`.

`canonical_event_id IS NOT NULL OR canonical_artifact_id IS NOT NULL` CHECK constraint — one of the two must be set after processing (not at scan time).

Migration source vault path: `~/Documents/Loom-Legacy/` (or user-configured). This is separate from the active vault at `~/Documents/Loom/`.

HITL note: the actual running of migration on real vault data is user-initiated (via the API or UI), not an automatic cron in v1. The cron (#049) is for batch processing after the user triggers a scan.
