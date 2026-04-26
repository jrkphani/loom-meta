# 048 — Migration: review queue endpoints

**Workstream:** W9
**Tag:** AFK
**Blocked by:** #047
**User stories:** US-6

## Behaviour

Low-confidence migration outputs appear in a review queue. Phani can review each one side-by-side (original text vs. extracted atoms), then accept (commit to vault), reject (discard atoms, keep original archived), or edit (provide corrected content). Decisions feed forward as training signals. The review UI in W11 (#062) uses these endpoints.

## Acceptance criteria

- [ ] `GET /v1/migration/queue` returns `migration_records` where `confidence_tier = low_queued_for_review` and `reviewed_at IS NULL`, ordered by `confidence_score ASC` (lowest confidence first).
- [ ] Each response item includes: `original_path`, `archived_path`, `confidence_score`, `confidence_tier`, `llm_used`, and a preview of the extracted atoms.
- [ ] `GET /v1/migration/records/:id/preview` returns the original file content (read from `archived_path`) alongside the extracted atoms.
- [ ] `POST /v1/migration/records/:id/review` with `{decision: accepted | rejected | rerun_pending, review_notes?}` sets `reviewed_at`, `review_decision`, `review_notes` on `migration_records`.
- [ ] `decision = accepted` triggers vault render (KG dispatcher) for the migration record's atoms.
- [ ] `decision = rejected` leaves atoms in DB but marks the migration_record; atoms are soft-dismissed.
- [ ] `decision = rerun_pending` re-queues the record for Claude rewrite with the review_notes as additional context.
- [ ] Service tests: accept, reject, rerun; verify state transitions.

## Notes

`review_decision` values from schema: `accepted`, `rerun_pending`, `rejected`.

The `review_notes` field captures the user's feedback on the LLM's output — this is the training signal for future prompt tuning. Never discard it.

Route: `GET /v1/migration/queue`, `GET /v1/migration/records/:id/preview`, `POST /v1/migration/records/:id/review`.
