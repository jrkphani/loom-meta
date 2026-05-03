# 078 — Read-path retrofit: audience-aware reads across services

**Workstream:** W15
**Tag:** AFK
**Blocked by:** #077
**User stories:** none (foundational refactor)

## Behaviour

Every read path in `loom_core/services/*.py` that returns facts gains a required `audience: Audience` keyword parameter and applies `visibility_predicate()` at the SQL level. Callers cannot bypass by passing `audience=None` — the parameter is required (positional or keyword). Existing API routes pass `Audience.for_self()` until per-stakeholder audience selection lands in #088 (audience profile). Retracted entities are also excluded from default reads via `.where(retracted.is_(False))`.

## Acceptance criteria

- [ ] `loom_core/services/events.py::list_events()` takes required `audience: Audience` and applies `visibility_predicate()` plus `Event.retracted.is_(False)` (assuming retraction column added in #076 to events as well — out of scope if not).
- [ ] `loom_core/services/arenas.py` read functions take `audience: Audience` (arenas are `domain_wide` by default; `is_self` audience always matches).
- [ ] `loom_core/services/engagements.py` read functions take `audience: Audience`.
- [ ] `loom_core/services/hypotheses.py::list_hypotheses()`, `list_state_history()`, `list_state_proposals()` take `audience: Audience`.
- [ ] `loom_core/services/external_references.py` read functions take `audience: Audience`.
- [ ] `loom_core/services/processor_runs.py` read functions take `audience: Audience` (operational data — `is_self` only by convention).
- [ ] `loom_core/services/triage.py` read functions take `audience: Audience` and filter triage items so that the related entity is visible to the audience.
- [ ] All API routes in `loom_core/api/*.py` updated to pass `Audience.for_self()` (per-stakeholder selection comes in #088).
- [ ] Existing tests updated to pass `audience=Audience.for_self()`; behaviour unchanged from current state for `is_self` callers.
- [ ] `mypy --strict` passes; no `audience: Audience | None` signatures remain anywhere in services or API.
- [ ] All four CI gates pass.

## Notes

The discipline this issue enforces: **the parameter is required, not optional.** A future contributor cannot accidentally write a leaky read path because the function signature won't compile without an audience.

Existing service signatures need surgical changes only — add the parameter, add the `.where(visibility_predicate(...))` clause, add the `.where(retracted.is_(False))` clause (where applicable). No other behaviour changes.

Per blueprint §6.5, this is structural enforcement: when audience-filtered summarisation lands in W16 (briefs), the contract is that filtered atoms reach cognition, not the other way around. This issue closes the door on the wrong pattern before cognition lands.

Operational data (processor_runs, brief_runs as a query target) is conventionally `is_self`-only. The audience parameter is still required for signature consistency, but in practice these are called by the daemon itself with `Audience.for_self()`.

The 7 service files affected: `arenas.py`, `engagements.py`, `events.py`, `external_references.py`, `hypotheses.py`, `processor_runs.py`, `triage.py`.

Refactor plan reference: §2.2 of `loom-meta/docs/v08-alignment-refactor-plan.md`.
