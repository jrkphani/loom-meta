# 078 — Read-path visibility retrofit across service files

**Workstream:** W15
**Tag:** AFK
**Blocked by:** #077
**User stories:** none directly (foundational)

## Behaviour

Every fact-returning read in `loom_core/services/` takes a required `audience: Audience` parameter and applies `visibility_predicate(...)` at the SQL level. Excludes retracted entities. The 7 affected service files: `arenas.py`, `engagements.py`, `events.py`, `external_references.py`, `hypotheses.py`, `processor_runs.py`, `triage.py`. API route handlers resolve the audience from a request header or default to `Audience.for_self()`.

## Acceptance criteria

- [ ] Every list/get/search function in the 7 service files has `audience: Audience` as a required keyword-only parameter.
- [ ] Every function applies `visibility_predicate(...)` to its select statement.
- [ ] Every function adds a `WHERE retracted IS FALSE` clause where the entity has the column (atoms, events).
- [ ] API route handlers in `loom_core/api/` resolve the audience: default to `Audience.for_self()` for endpoints called without an explicit audience header; honour `X-Audience-Stakeholder-Ids` header (comma-separated ULIDs) for delegated reads.
- [ ] No service function defaults `audience=None` — calling without audience is a type error caught by `mypy --strict`.
- [ ] All existing tests pass after the retrofit (with `Audience.for_self()` being the implicit migration path for old tests).
- [ ] The retrofit is mechanical-not-creative: the diff for each function is essentially "add audience parameter, add WHERE clause"; if a service needs structural change, that is a separate issue.
- [ ] `mypy --strict`, `ruff check`, `ruff format --check`, `pytest` all clean.

## Notes

The migration discipline: services accept the parameter; existing callers that simply pass `Audience.for_self()` preserve current behaviour. Brief composition (#035 amendment) and any audience-aware caller pass real audiences. Cron jobs run as `Audience.for_self()`.

Implementing this without #079 (visibility regression tests) would let regressions through silently — pair this issue's merge with #079 in the same change set.

Engagement_scoped resolution is deferred to caller-side JOINs against engagement membership tables; #077 explicitly excludes it from the unified predicate to keep query plans simple.

Reference: refactor plan §2.2.
