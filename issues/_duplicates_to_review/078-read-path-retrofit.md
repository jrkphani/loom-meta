# 078 — Read-path retrofit: audience-aware reads across all service files

**Workstream:** W15
**Tag:** AFK
**Blocked by:** #076, #077
**User stories:** US-20, US-22 (audience-tailored briefs depend on this)

## Behaviour

Every service-layer read function that returns facts (events, hypotheses, atoms when added, artifacts, external references, triage items) takes a required `audience: Audience` parameter and applies the visibility predicate at the SQL level. The default of `Audience.for_self()` preserves current behaviour for existing callers (Phani sees everything in his own domain). Callers that produce content for someone else (briefs to stakeholders, drafts addressed to customers) must pass the right audience.

The retrofit preserves all existing query semantics — filters, ordering, pagination — and adds the visibility predicate as an additional `WHERE` clause. Visibility is a hard filter, not a sort: an entity that fails the visibility check is excluded entirely, not deprioritised.

## Acceptance criteria

- [ ] `loom_core/services/events.py` `list_events` takes `audience: Audience` as a required keyword argument and applies `visibility_predicate` plus a `Event.retracted.is_(False)` filter (the retracted column lands in #084).
- [ ] `loom_core/services/arenas.py` reads (`list_arenas`, `get_arena`) take audience and filter visibility.
- [ ] `loom_core/services/engagements.py` reads (`list_engagements`, `get_engagement`) take audience and filter visibility.
- [ ] `loom_core/services/hypotheses.py` reads (`list_hypotheses`, `get_hypothesis`, `list_state_history`, `list_state_proposals`) take audience and filter visibility.
- [ ] `loom_core/services/external_references.py` reads take audience and filter visibility.
- [ ] `loom_core/services/processor_runs.py` reads take audience (operational data is `domain_wide` by convention so the filter is permissive but uniform).
- [ ] `loom_core/services/triage.py` reads take audience and filter visibility on the underlying entities behind triage items (since triage items reference polymorphic entities).
- [ ] All API route handlers in `loom_core/api/*.py` that call these services pass `Audience.for_self()` by default — no behaviour change for existing endpoints; new audience-aware endpoints (briefs, drafts) pass the right audience explicitly.
- [ ] Existing tests pass without modification (because `Audience.for_self()` is permissive). New tests cover: passing a stakeholder audience filters correctly; private entities never leak.
- [ ] All four CI gates pass.

## Notes

The audience parameter is required (not optional) at the service layer to prevent silent visibility bypass. API routes that have no notion of "for whom" pass `Audience.for_self()` explicitly — that is documented intent, not a default.

The retrofit pattern, demonstrated for one read path, is in `loom-meta/docs/loom-v08-alignment.md` §2.2. Apply uniformly across the seven service files.

Order of operations:
1. Add `audience: Audience` keyword to each service function.
2. Add `.where(visibility_predicate(...))` to each statement before the order_by.
3. Update API routes to pass `Audience.for_self()` so existing tests pass.
4. Add new tests for non-self audiences.

This issue does NOT address engagement-scoped JOINs to engagement membership. Those compose at the service layer when the visibility model needs full implementation (later issue, when audience-filtered briefs ship in W16/W17). For Phase A, `Audience.for_self()` is the only audience used in production code paths, and the predicate handles it correctly.
