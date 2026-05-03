# 077 — Visibility filter library and Audience type

**Workstream:** W15
**Tag:** AFK
**Blocked by:** #076
**User stories:** none directly (used by every read path)

## Behaviour

A canonical visibility-filter implementation lives at `loom_core/storage/visibility.py`. It exposes (1) an `Audience` value type representing who an output is for, (2) a `visibility_predicate` function that builds a SQL WHERE-clause expression for visibility-aware queries, and (3) a `derived_visibility` helper for inferring the right scope when a new entity is derived from multiple sources (the intersection rule per blueprint §6.4: most restrictive wins).

The library is the single source of truth for visibility logic. Service-layer reads, brief composition, and (later) vector search all import from it. No service is permitted to post-process visibility — filtering happens at the SQL level.

## Acceptance criteria

- [ ] `loom_core/storage/visibility.py` is created with three public exports: `Audience`, `visibility_predicate`, `derived_visibility`.
- [ ] `Audience` is a frozen dataclass with `stakeholder_ids: frozenset[str]` and `is_self: bool`. Class methods `Audience.for_self()` and `Audience.for_stakeholders(ids)` are available.
- [ ] `visibility_predicate(visibility_col, entity_type, entity_id_col, audience)` returns a SQLAlchemy `ColumnElement[bool]` suitable for `select().where(...)`.
- [ ] When `audience.is_self`, the predicate matches all four scopes (`domain_wide`, `engagement_scoped`, `stakeholder_set`, `private`).
- [ ] When `audience` is non-self, the predicate matches `domain_wide` always; matches `stakeholder_set` only when every audience member is in the entity's `entity_visibility_members` row; never matches `private`; `engagement_scoped` is documented as handled at the higher service layer via JOIN to engagement membership.
- [ ] `derived_visibility(source_visibilities)` returns the most restrictive scope from the input list (order: `domain_wide` < `engagement_scoped` < `stakeholder_set` < `private`).
- [ ] Unit tests in `tests/storage/test_visibility.py` cover: self audience matches all; private never leaks to non-self; stakeholder_set requires full subset match; derived intersection works for all combinations.
- [ ] All four CI gates pass.

## Notes

The visibility model is defined in `loom-meta/docs/loom-v08-alignment.md` §2.1. The implementation listed there is the reference; this issue is the "ship it and test it" ticket.

The `engagement_scoped` predicate is handled at the higher service layer because the engagement membership join requires a service-level lookup of who is in an engagement. The visibility library handles the three SQL-pure cases (`domain_wide`, `stakeholder_set`, `private`); engagement scoping is composed by callers via an additional WHERE clause that references the engagement-membership join.

Why a separate library rather than a service helper: every read path imports it, including paths that don't go through services (e.g., direct queries from cron jobs, repl debugging). A storage-layer module is the right home.

After this lands, #078 (read-path retrofit) consumes this library across all 7 service files.

## Closure Note

Shipped. `loom_core/storage/visibility.py` created with all three public exports.
23 tests in `tests/test_visibility.py`; full suite 190 passed.

**Design call recorded:** The §2.1 reference `stakeholder_set` predicate
computed `entity_members ⊆ audience` (reversed, leaks). The correct direction
is `audience ⊆ entity_members`, implemented as a count-match. The refactor
plan §2.1 code block has been annotated accordingly.

**Test path:** `loom-core/tests/test_visibility.py` (flat layout, no `storage/` subdir).
