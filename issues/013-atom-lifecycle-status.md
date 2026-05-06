# 013 — Atom lifecycle: commitment, ask, and risk status updates

**Workstream:** W3
**Tag:** AFK
**Blocked by:** #010
**User stories:** US-14

## Behaviour

Commitments, asks, and risks have a lifecycle tracked through status transitions. Phani (or a cron job) can update the status of a commitment (e.g., open → met), an ask (e.g., raised → granted), or a risk (e.g., unmitigated → mitigated). Each status transition writes an `atom_status_changes` row and updates the denormalized `current_status` column on the detail table. The transition history is queryable.

## Acceptance criteria

- [ ] `POST /v1/atoms/:id/status` with `{new_status, changed_by, reason?}` updates `current_status` on the appropriate detail table and writes an `atom_status_changes` row.
- [ ] Invalid status transitions (e.g., `met` → `open` for commitments, if the transition matrix disallows it) return 422. At minimum, transitioning a non-commitment atom via the commitment status endpoint returns 422.
- [ ] `GET /v1/atoms/:id/status/history` returns `atom_status_changes` rows ordered by `changed_at DESC`.
- [ ] `PATCH /v1/atoms/:id/commitment` updates `due_date` and `owner_stakeholder_id` on `atom_commitment_details`.
- [ ] `PATCH /v1/atoms/:id/risk` updates `severity` and `owner_stakeholder_id` on `atom_risk_details`.
- [ ] Service tests: update commitment from open → in_progress → met; update ask from raised → granted; update risk severity.
- [ ] The `current_status` field on `AtomCommitmentDetails` (lifecycle of commitment atoms specifically) is the lifecycle target for commitment-kind atoms in this issue. Rules-tier extractor (#012) creates the aux record with the schema's default; lifecycle transitions land here. Test fixtures may mirror the minimal-Stakeholder shape from `tests/pipelines/test_extractor_rules.py` (three fields inline: `id`, `canonical_name`, `primary_email`).

## Notes

Schema: `atom_status_changes` (lines ~259–268), `atom_commitment_details` (lines ~221–230), `atom_ask_details` (lines ~234–244), `atom_risk_details` (lines ~247–255) in `loom-schema-v1.sql`.

`changed_by` in `atom_status_changes` is a free text field (`'cron' or stakeholder_id`) — not an enum. The atom type determines which detail table is updated; fetching the wrong table for a given atom type should return 422 Not Applicable.

Route: `POST /v1/atoms/:id/status`, `GET /v1/atoms/:id/status/history`, `PATCH /v1/atoms/:id/commitment`, `PATCH /v1/atoms/:id/risk`.

## Implementation Notes (locked during execution)

### First atom HTTP surface

Issue #013 is the first issue to expose atom routes and services. PRE-FLIGHT surfaced that `src/loom_core/api/atoms.py` and `src/loom_core/services/atoms.py` did not exist; both were created in this issue. The visibility-scoped `get_atom(session, atom_id, *, audience)` helper in the new service module mirrors `services/events.py::get_event` and is reusable infrastructure for #016 (atom search + provenance API) — same shape, no rework expected there.

### Pin 1 lock: explicit kind dispatch with column-name asymmetry

Risk uses `mitigation_status`; commitment and ask use `current_status`. The dispatch is a single explicit mapping that names the column attribute per kind:

```python
_LIFECYCLE_DISPATCH: dict[str, tuple[_LifecycleDetailType, str, frozenset[str]]] = {
    "commitment": (AtomCommitmentDetails, "current_status", frozenset({...6 states...})),
    "ask":        (AtomAskDetails,        "current_status", frozenset({...5 states...})),
    "risk":       (AtomRiskDetails,       "mitigation_status", frozenset({...4 states...})),
}
```

The asymmetry is visible by design — no generic helper that hides it. The third tuple element is the per-kind valid status set, mirroring the SQL CHECK constraints. `getattr` / `setattr` on the named attribute keeps the dispatch loop generic at the call site without erasing the kind-specific column-name semantics.

### Open transition graph (no matrix)

Pin 2 settled this: any in-enum status → any in-enum status is allowed. No `met → open` rule, no terminal-state stickiness. The only invariants enforced at the service layer are (a) atom kind has a lifecycle detail table (else `AtomKindMismatchError` → 422), (b) `new_status` is in the kind's CHECK enum (else `AtomStatusInvalidError` → 422). Audit log is truth; the user can append corrective transitions.

### `changed_by` as request-body free text

Pin 3 settled this. Schema CHECK on `atom_status_changes.changed_by` is absent; the column is `Text`. Service accepts any non-empty string (`Field(min_length=1)` on the Pydantic request model). When an identity layer lands later, the field shape stays the same — service stops trusting blind input. No schema change needed.

### Retraction is read-side only

Pin 4 settled this. `atoms.retracted` and `atoms.retracted_at` columns landed in #076; #013 only needs to read them. POST status guards on `if atom.retracted: raise AtomRetractedError` → 409. GET history exposes `retracted_at` at the top of the response envelope per DC8. Tests seed retracted atoms by direct ORM assignment (`atom.retracted = True; atom.retracted_at = ...`). No #084 dependency at the read path.

### PATCH pattern — sentinel for partial updates

PATCH endpoints (`/commitment`, `/risk`) accept a body where every field is optional but at least one must be present. The Pydantic model uses `@model_validator(mode='after')` checking `model_fields_set` to enforce non-empty. The route handler then reads `body.model_fields_set` to build a `kwargs` dict containing only the explicitly-provided fields, and the service uses an `_UNSET` sentinel object to distinguish "field omitted" from "field set to None." Without the sentinel, a partial PATCH that only touches `due_date` would silently null out `owner_stakeholder_id`.

### Stale-read pattern in tests

`db_session` fixture (from `tests/conftest.py`) shares the engine with the route's session but maintains its own identity-map cache. After a route POSTs and commits, reads through `db_session` return cached values. Verification reads use a fresh session opened inline via `app.state.session_factory()`. Documented inline in tests so future patterns inherit the workaround consistently.

---

## v0.8 Alignment Addendum

**Depends on:** #084 (retraction)

Status transitions are independent of retraction. A retracted atom does NOT auto-cascade status changes — retraction marks the atom unreliable; status changes record what happened to the underlying commitment/ask/risk regardless. The two workflows are separate.

### Additional acceptance criteria

- [ ] When an atom is retracted via #084, status-history endpoints continue to return its history but include a `retracted_at` flag in the response so the UI can mark the atom unreliable in the timeline.
- [ ] Status transitions on a retracted atom return 409 with reason `atom_retracted` — the human must un-retract first if they want to record a status change post-retraction.

## Closure note

Landed via Claude Code, 2026-05-06.

- 10 behaviours executed (B1–B10). All GREEN.
- Test count: 225 → 248 (+23 collected, all passing). 1 skipped (the `external` Claude smoke test from #010, by design).
- All six gates green: `ruff check`, `ruff format --check`, `mypy --strict src/ tests/`, `pytest`, `pytest -m visibility` (12 tests, unchanged), `alembic check` (no new migration).
- No design ambiguity surfaced mid-session. Five PRE-FLIGHT divergences caught before B1 — atom routes/service modules did not exist (created from scratch), `tests/api/` did not exist (used top-level `tests/test_atoms_status.py` per repo convention), no centralized exception handler (used inline per-route try/except per existing convention), no `loom_core.ids` helper (used direct `from ulid import ULID; str(ULID())` per existing convention).

### Incidental landings

- **First atom HTTP surface.** `src/loom_core/api/atoms.py` and `src/loom_core/services/atoms.py` created. The visibility-scoped `get_atom(session, atom_id, *, audience)` helper is reusable for #016 (atom search + provenance API). No new infrastructure beyond what these four endpoints required.
- **Four new typed exceptions.** `AtomNotFoundError` (404), `AtomKindMismatchError` (422), `AtomStatusInvalidError` (422), `AtomRetractedError` (409). All in `services/atoms.py`. Inline route-handler catch + envelope conversion per existing repo convention (no central handler).
- **Stale-read pattern documented in tests.** `db_session` fixture caches identity-map state from seed phase; verification reads use a fresh inline session via `app.state.session_factory()`. First test file in the repo to use this pattern explicitly; documented for #016 and future HTTP-tier tests that need to verify DB state after a route mutation.

### Phase status

Phase A closed at #079. W3 atom extraction: #010 ✅, #012 ✅, #013 ✅, #014 ✅. Open: #016 (atom search + provenance API). #015 (outlook-mcp integration) is W3 but depends on real Microsoft 365 auth (HITL).

