# 047 — Migration: confidence threshold, auto-accept, and originals archive

**Workstream:** W9
**Tag:** AFK
**Blocked by:** #046
**User stories:** US-5, US-7

## Behaviour

After the canonical rewrite, each migration record is classified into one of two confidence tiers: high (auto-accepted into the vault immediately) or low (queued for Phani's review). High-confidence records have their atoms committed, their vault pages rendered, and their originals archived. Low-confidence records wait in the review queue (#048). Both tiers archive the original to `archive/work/originals/` regardless of confidence.

## Acceptance criteria

- [ ] Confidence ≥ configurable threshold (default 0.75) → `confidence_tier = high_auto_accepted`; atoms are committed (written to `atoms` table), original is archived, `migration_records.migrated_at` is set.
- [ ] Confidence < threshold → `confidence_tier = low_queued_for_review`; atoms are stored in a staging area (or committed with a `needs_review` flag), original is archived, `migration_records.migrated_at` is set.
- [ ] The original file is copied (not moved) to `archive/work/originals/{relative_path}` with the original filename unchanged.
- [ ] `migration_records.archived_path` is updated to the archive path.
- [ ] The confidence threshold is configurable in `config.toml` under `[migration] confidence_threshold = 0.75`.
- [ ] Integration test: process two files, one above threshold and one below; assert correct tier assignment and archive paths.

## Notes

"Auto-accepted" means the KG render dispatcher is called for those atoms' parent events and the vault pages are written. The user sees them in Obsidian immediately.

"Low-queued-for-review" means the atoms are written to the DB but not yet rendered to vault pages (or rendered with a `draft` frontmatter flag). The review endpoint (#048) confirms or rejects them.

The archive copy is permanent — even if the migration is later rejected, the original stays in `archive/originals/`. This is by design (US-7).
