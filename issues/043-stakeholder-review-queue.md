# 043 — Stakeholder resolution: review queue and confirm endpoints

**Workstream:** W8
**Tag:** AFK
**Blocked by:** #042, #019
**User stories:** US-28

## Behaviour

Phani reviews the stakeholder resolution queue via the triage UI. Each item shows the mention, the source context, and candidate stakeholders. Phani can confirm the suggested match, select a different stakeholder, create a new stakeholder for the mention, or split an existing stakeholder into two. The decision is recorded and the atom's `owner_stakeholder_id` is updated.

## Acceptance criteria

- [ ] `GET /v1/triage?item_type=stakeholder_resolution` returns pending stakeholder resolution items with their candidate suggestions.
- [ ] `POST /v1/triage/items/:id/resolve-stakeholder` with `{action: confirm | replace | new | split, stakeholder_id?: str, new_stakeholder?: {canonical_name, primary_email}}` resolves the triage item and updates the atom's `owner_stakeholder_id`.
- [ ] `action = new` creates a new stakeholder and links it.
- [ ] `action = split` creates a new stakeholder and adds the original's aliases to both; intended for cases where two people share a mention.
- [ ] The resolution is recorded: `triage_items.resolution = confirmed` (or `overridden`) and `resolved_at = now()`.
- [ ] Service tests: confirm match, replace with different stakeholder, create new, verify atom FK updated.

## Notes

The resolution endpoint updates the atom's FK if the atom is a commitment/ask/risk (`atom_commitment_details.owner_stakeholder_id`, etc.).

"Split" is a rare operation and can be implemented as a simple combination of "create new" + "update aliases" — no complex graph operation needed.

The candidate list in the triage item's `context_summary` stores the top-3 candidate names as JSON. The resolve endpoint accepts any `stakeholder_id`, not just the pre-suggested candidates.
