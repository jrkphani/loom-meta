# 078 — Visibility-aware read-path retrofit (5 service files)

**Workstream:** W15 (Phase A — v0.8 alignment)
**Tag:** AFK
**Blocked by:** #077
**User stories:** foundational; refactor plan §2.2

## Behaviour

Read paths in `loom_core/services/` are retrofitted to take a required `audience: Audience` parameter. Three visibility-bearing services (events, hypotheses, external_references) filter at the SQL level via `visibility_predicate(...)` from #077. Two top-level scope services (arenas, engagements) take the parameter as a documentary contract for forward compatibility with #085/#086 (resource attribution will use audience-membership joins through arena/engagement scope) — no SQL predicate is applied today on these. Operational services (processor_runs, triage) are excluded entirely; processor_runs is operator-only (called from `/health/processor`) and triage currently has zero read functions.

The audience parameter is **required**, not optional — callers cannot bypass by passing `None`. Routes inject the audience via the `get_audience` FastAPI dependency in `loom_core/api/_deps.py`, which returns `Audience.for_self()` today. Future stakeholder-facing routes will derive narrower audiences from request context inside that single dependency hook.

## Acceptance criteria

- [ ] All `list_*` and `get_*` functions in the following service files take a required `audience: Audience` parameter:
  - `services/events.py`
  - `services/hypotheses.py`
  - `services/external_references.py`
  - `services/arenas.py` (documentary parameter only — no SQL predicate yet; reserved for future engagement-membership joins)
  - `services/engagements.py` (documentary parameter only — no SQL predicate yet; reserved for future engagement-membership joins)
- [ ] For visibility-bearing services (`events`, `hypotheses`, `external_references`), each service applies `visibility_predicate(...)` against the entity's `visibility_scope` column at the SQL level.
- [ ] For `get_*` reads on visibility-bearing entities, `session.get(Model, id)` is replaced with `select(Model).where(Model.id == id).where(visibility_predicate(...))` to enforce SQL-level filtering.
- [ ] For joined reads (e.g., `list_atom_external_refs`, `list_state_history`), visibility is gated at both ends: the parent entity must be visible AND the joined entity (if it possesses a `visibility_scope` column) must be visible.
- [ ] Each service filters out retracted rows by default (`Atom.retracted.is_(False)`, `Event.retracted.is_(False)` once Event gains a retracted column — for now atoms only).
- [ ] A FastAPI dependency `get_audience()` is introduced in `loom_core/api/_deps.py` that returns `Audience.for_self()`.
- [ ] All existing API route handlers in `loom_core/api/` for the above services are updated to inject the `audience` via `Depends(get_audience)` and pass it through (preserves current behaviour).
- [ ] All existing unit/service tests pass with the new required parameter (tests pass `Audience.for_self()`).
- [ ] mypy --strict passes — the required parameter is enforced at the type level.
- [ ] No service function accepts `audience: Audience | None`. The parameter is required.
- [ ] At least one new test per retrofitted visibility-bearing service verifies that the audience parameter is honoured (e.g., `list_events` with a stakeholder audience excludes a private event).

## Notes

This is the highest-discipline work in Phase A. Every read path that returns facts must apply visibility filtering at the SQL level (per blueprint §6.4). Post-processing is forbidden.

Reference patterns in refactor plan §2.2 — the Event service refactor is the canonical example.

**Migration order**: the route layer changes are mechanical; do them last. Service-layer changes drive the type contract. Update services first, run mypy, then chase down route-layer call sites until mypy is green.

**Backward compatibility**: external API route signatures don't change; routes inject `audience` via `Depends(get_audience)` which returns `Audience.for_self()`. External MCP and UI clients see no difference. This preserves shippability through Phase A.

**For future audience parameter exposure**: in Phase B (#080–#084) and beyond, brief generation and MCP tools will start passing narrower audiences. That's separate from this issue — this issue just establishes the required-parameter contract.

This issue does NOT add audience-filtered summarisation (#079 covers the regression test for that contract) or vector-search filtering (deferred — sqlite-vec adoption is post-v1).

---

**CLOSED.** Landed across two execution sessions in Gemini Antigravity (visibility-bearing services + dependency wiring; arenas/engagements documentary parameter + route wiring). 5 services touched, 12 route handlers updated, +5 audience-honoured service tests (190 → 195). All gates green: ruff, ruff format, mypy --strict (0 errors), pytest (195 passed), alembic check. Q1 (`session.get` → `select+where+predicate`), Q2 (parent-check defence in depth on `list_atom_external_refs` with bonus `Atom.retracted.is_(False)` filter), and Q3 (`get_audience` FastAPI dependency) all satisfied. Two parent-check leak tests for hypothesis joined reads (`list_state_history`, `list_state_proposals`) intentionally deferred to #079 (visibility regression suite).
