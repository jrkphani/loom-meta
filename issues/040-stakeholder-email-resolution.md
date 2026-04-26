# 040 — Stakeholder resolution: email exact match

**Workstream:** W8
**Tag:** AFK
**Blocked by:** #039
**User stories:** US-27

## Behaviour

When the atom extractor identifies a person mention in a transcript or note, the stakeholder resolution pipeline tries to match them to an existing stakeholder. The first tier uses exact email match: if the mention includes a recognisable email address (e.g., `madhavan.r@customer.com` or `@amazon.com` domain), it is matched directly against `stakeholders.primary_email`. A `@1cloudhub.com` mention resolves to internal team members. Matched atoms get `owner_stakeholder_id` populated.

## Acceptance criteria

- [ ] `resolve_stakeholder(mention: str, domain: str) -> Stakeholder | None` returns the stakeholder if the mention exactly matches `primary_email` or is in `aliases` JSON array.
- [ ] `@amazon.com` emails resolve to any stakeholder with `primary_email LIKE '%@amazon.com'` — returns the best match or `None` if ambiguous.
- [ ] `@1cloudhub.com` emails resolve to known internal team members.
- [ ] When resolution returns `None`, the atom's `owner_stakeholder_id` remains NULL and a `triage_items` row is created with `item_type = stakeholder_resolution`.
- [ ] Unit tests: exact email match, alias match, Amazon domain match, ambiguous (multiple @amazon.com stakeholders → None), unresolvable (→ triage item created).

## Notes

The resolution function lives in `loom-core/src/loom_core/services/stakeholder_resolution.py`.

The aliases field is a JSON array of strings (e.g., `["Madhav", "Madhavan R"]`). Use SQLite JSON1 `json_each` or load into Python for matching.

The triage item created for unresolved mentions has `related_entity_type = 'stakeholder'` and `related_entity_id` pointing to a temporary placeholder or the atom that contained the mention. Design this carefully — the resolution queue (#043) needs to present both the mention and candidate stakeholders.
