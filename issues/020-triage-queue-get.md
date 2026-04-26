# 020 — Triage queue: GET endpoint with priority sorting

**Workstream:** W4
**Tag:** AFK
**Blocked by:** #019
**User stories:** US-13, US-14

## Behaviour

Phani opens the Loom UI on Friday and the triage queue loads: a ranked list of items awaiting review. The GET endpoint returns unresolved triage items sorted by priority, grouped optionally by type. Each item includes enough context for Phani to make a triage decision without clicking through: the summary, the entity type and ID, the priority score, and the surfaced-at time. Items resolved in a previous session are excluded from the default view.

## Acceptance criteria

- [ ] `GET /v1/triage` returns unresolved triage items (`resolved_at IS NULL`) ordered by `priority_score DESC, surfaced_at ASC`.
- [ ] Supports `?item_type=low_confidence_atom` and `?item_type=state_change_proposal` filters.
- [ ] Supports `?engagement_id=:id` filter (joins through the entity to find atoms attached to hypotheses of that engagement).
- [ ] Each item in the response includes: `id`, `item_type`, `related_entity_type`, `related_entity_id`, `context_summary`, `priority_score`, `surfaced_at`.
- [ ] `GET /v1/triage/items/:id` returns a single triage item by ID; 404 if not found or already resolved.
- [ ] `POST /v1/triage/items/:id/resolve` with `{resolution}` (one of `confirmed`, `overridden`, `dismissed`, `deferred`) sets `resolved_at = now()` and `resolution`; returns 200.
- [ ] Service tests: populate items, GET with filters, resolve an item, verify it no longer appears in default GET.

## Notes

`resolution` values from schema: `confirmed`, `overridden`, `dismissed`, `deferred`. All are valid; the semantic meaning depends on the consuming UI.

The `?engagement_id` filter requires a join: `triage_items` → `atom_attachments` or `hypotheses` → `engagements`. For `state_change_proposal` items, `related_entity_type = hypothesis` so the join is direct. For `low_confidence_atom`, join via `atom_attachments`.

Route: `GET /v1/triage`, `GET /v1/triage/items/:id`, `POST /v1/triage/items/:id/resolve`.
