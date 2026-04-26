# 022 — Triage staleness monitoring: per-engagement queue metrics

**Workstream:** W4
**Tag:** AFK
**Blocked by:** #020
**User stories:** US-16, US-33

## Behaviour

Phani can query the health of each engagement's triage queue. The staleness endpoint returns a summary per active engagement: item count by type, last triage date, degraded status. This data feeds both `loom doctor` diagnostics and the triage UI's per-engagement status chips. It gives Phani a quick scan without fetching the full queue.

## Acceptance criteria

- [ ] `GET /v1/triage/staleness` returns a list, one entry per active engagement (where `ended_at IS NULL`), each with: `engagement_id`, `engagement_name`, `pending_item_count`, `pending_by_type` (dict of item_type → count), `last_resolved_at`, `weeks_since_last_triage`, `degraded`.
- [ ] Engagements with zero pending items still appear in the response (so the UI can show "all clear").
- [ ] Response is computed in a single query (no N+1 per engagement).
- [ ] `GET /v1/triage/staleness?engagement_id=:id` returns the single-engagement view.
- [ ] Service test: create two engagements, add triage items to one, verify counts are correct per engagement.

## Notes

This is a read-only analytics endpoint. It does not modify any state.

The single-query approach uses a GROUP BY on `triage_items.related_entity_id` joined through `atom_attachments` → `hypotheses` → `engagements`, or directly where `related_entity_type = 'hypothesis'`. Design the query carefully to avoid N+1 per engagement; use SQLAlchemy `select` with `group_by`.

`loom doctor` (#070 in W13) will call this endpoint to surface pending triage counts.
