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

## Implementation Notes (locked during execution)

### Reused #013 patterns without bending

Three patterns inherited from #013 generalised cleanly to the read-side:

- **Visibility-scoped getter as foundation.** `get_atom(session, atom_id, *, audience)` from #013 is the visibility chokepoint. `get_atom_with_details` and `get_atom_provenance` both call it first; if it returns `None`, they raise `AtomNotFoundError`. Source (event/artifact) and external refs are loaded **without** secondary visibility filtering (DC6) — atom visibility is the gate, the rest follows.
- **Inline exception handling per #013 DC11.** No new typed exceptions introduced. All paths reuse `AtomNotFoundError` from #013, caught inline at each route handler.
- **Explicit kind dispatch.** `_DETAIL_DISPATCH` mirrors `_LIFECYCLE_DISPATCH` shape from #013 — explicit dict mapping kind → detail-table model class. Decision and status_update yield `None` (no detail row); response carries `details: null` (DC7).

### Pin 1 lock (column-name asymmetry) holds at read-side

The risk detail block uses `mitigation_status`, NOT `current_status` — same column-name asymmetry as #013's lifecycle dispatch. `RiskDetailBlock` Pydantic model declares `mitigation_status: str` explicitly. B6 asserts the response key is `mitigation_status` and that `current_status` is absent. The asymmetry is visible at the response shape; do not generalise it away.

### Source envelope dispatched inline

The `_build_source(event, artifact)` route helper is deliberately small (≤20 lines, two branches) rather than a registered dispatch dict. Two source kinds, both well-scoped, building from differently-shaped models — a dispatch map would obscure the `occurred_at`/no-`occurred_at` divergence. Same anti-generalisation reasoning as Pin 1.

### Bridge column name

`atom_external_refs.external_ref_id` (NOT `external_reference_id`). PRE-FLIGHT explicitly verified this; the JOIN uses the actual column name. Documented here so #018 (atom dismissal) and any future provenance work doesn't re-discover.

### Visibility predicate handles only `domain_wide` and `stakeholder_set`

Per the visibility refactor plan §2.1, the SQL predicate handles `domain_wide` and `stakeholder_set` (with audience-subset matching); `engagement_scoped` is resolved at audience construction (caller pre-resolves engagement membership into the stakeholder set), and `private` is excluded except for `is_self`. B4's stakeholder-audience test confirms the predicate excludes `private` atoms; B8 confirms direct ID lookup also 404s for invisible atoms.

## Closure note

Landed via Claude Code, 2026-05-07.

- 10 behaviours executed (B1–B10). All GREEN.
- Test count: 248 → 261 (+13 collected, +12 passed + 1 skipped). 1 skipped is the existing external Claude smoke test from #010, unchanged.
- Visibility regression suite: 12 → 14 (B4 and B8 join with `@pytest.mark.visibility`).
- All 8 gates green: ruff check, ruff format --check, mypy --strict src/ tests/, mypy --strict alembic, mypy --strict tests/, pytest, pytest -m visibility, alembic check.
- No design ambiguity surfaced mid-session. PRE-FLIGHT corrected one minor naming hedge (`atom_external_refs.external_ref_id`, not `external_reference_id`); locked in code and Implementation Notes.

### Incidental landings

- **Two new visibility regression tests.** B4 (`test_list_atoms_excludes_atoms_outside_audience_scope`) and B8 (`test_get_atom_returns_404_for_atom_outside_audience_scope`) join the visibility marker suite. Audience-override pattern via `app.dependency_overrides[get_audience]` mirrors `tests/test_visibility_invariants.py:test_route_get_events_filters_for_stakeholder_audience`.
- **`get_atom_with_details` and `get_atom_provenance` reusable for downstream issues.** #017 (atom attachment endpoints) and #084 (retraction cascade) both consume the atom + source shape; the visibility-scoped getter pattern is now established for any future atom read API.

### Phase status

Phase A closed at #079. W3 atom extraction: #010 ✅, #012 ✅, #013 ✅, #014 ✅, #016 ✅. Open in W3: #015 (outlook-mcp integration, HITL), #017 (atom attachment endpoints), #018 (atom dismissal endpoints).
