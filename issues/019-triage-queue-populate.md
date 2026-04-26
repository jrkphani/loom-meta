# 019 — Triage queue: populate triage items via cron

**Workstream:** W4
**Tag:** AFK
**Blocked by:** #018
**User stories:** US-13, US-16

## Behaviour

A cron job (runs as part of the `inbox_sweep` post-processing) populates the `triage_items` table with three types of items: (1) low-confidence atoms from the extractor, (2) ambiguous-routing items from the sniffer, and (3) state-change proposals from the inference pipeline (W5). Each item carries a `priority_score` and a `context_summary` for display. Items are not duplicated — if a triage item already exists for an entity, it is not created again.

## Acceptance criteria

- [ ] After `inbox_sweep` runs and the extractor flags an atom with `confidence_sort_key < 0.5`, a `triage_items` row is created with `item_type = low_confidence_atom` and `related_entity_id = atom_id`.
- [ ] After the sniffer routes a file with confidence < threshold, a `triage_items` row is created with `item_type = ambiguous_routing` and `related_entity_id = event_id`.
- [ ] Creating a triage item for an entity that already has an unresolved item for the same `item_type` is a no-op (idempotent).
- [ ] `priority_score` for low-confidence atoms is derived from `confidence_sort_key` (lower key → higher priority: `1.0 - confidence_sort_key`).
- [ ] `context_summary` is a one-line string: for low-confidence atoms, the first 80 chars of `atom.content`; for ambiguous routing, `"Unrouted: {filename}"`.
- [ ] Integration test: run two inbox_sweep cycles on the same low-confidence atom; verify only one triage item exists.

## Notes

The state-change proposal type (`item_type = state_change_proposal`) is populated by the W5 inference pipeline (#023–#025), not by this issue. This issue handles `low_confidence_atom` and `ambiguous_routing` only.

Schema: `triage_items` (lines ~489–507 in `loom-schema-v1.sql`). `related_entity_type` is polymorphic: `atom` for low-confidence, `event` for ambiguous routing, `hypothesis` for state proposals.

The idempotency check: query `triage_items WHERE related_entity_type = ? AND related_entity_id = ? AND item_type = ? AND resolved_at IS NULL`. If row exists, skip insert.
