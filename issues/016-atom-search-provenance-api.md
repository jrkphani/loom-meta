# 016 — Atom search and provenance read API

**Workstream:** W3
**Tag:** AFK
**Blocked by:** #010
**User stories:** US-25

## Behaviour

Phani (or Claude via MCP) can search atoms by type, domain, engagement, hypothesis, date range, and dismissed status. The provenance endpoint for a single atom returns its full chain: the atom, its parent event, the event's `source_path`, and any linked external references. This makes "show me where this came from" possible in both the triage UI and via Claude Desktop.

## Acceptance criteria

- [ ] `GET /v1/atoms?domain=work&type=commitment&dismissed=false` returns matching atoms ordered by `confidence_sort_key DESC, created_at DESC`.
- [ ] `GET /v1/atoms?hypothesis_id=:id` returns atoms attached to a hypothesis (via `atom_attachments`).
- [ ] `GET /v1/atoms?event_id=:id` returns atoms from a specific event.
- [ ] `GET /v1/atoms/:id` returns the atom with its detail (commitment/ask/risk fields if applicable) and the parent event's `type` and `occurred_at`.
- [ ] `GET /v1/atoms/:id/provenance` returns: atom content, anchor_id, parent event (id, type, occurred_at, source_path, body_summary), and linked external references.
- [ ] `?dismissed=true` includes dismissed atoms; `?dismissed=false` excludes them; default is `false`.
- [ ] Service tests: search by each filter, provenance for an atom with and without external refs.

## Notes

The provenance query joins: `atoms` → `events` → `external_references` (via `atom_external_refs`). The `source_path` is the filesystem path to the original source file — this is what makes "show me the transcript paragraph" possible.

Indexes to leverage: `idx_atoms_type`, `idx_atoms_event`, `idx_attach_hypothesis` (after W4 lands).

Route: `GET /v1/atoms`, `GET /v1/atoms/:id`, `GET /v1/atoms/:id/provenance`.
