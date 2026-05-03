# 079 — Visibility regression test suite and CI gate

**Workstream:** W15
**Tag:** AFK
**Blocked by:** #076, #077, #078
**User stories:** none directly (gates everything in W16/W17)

## Behaviour

A dedicated test module `tests/test_visibility_invariants.py` codifies the visibility invariants from blueprint §6.4 as integration tests. Each test sets up a fact with a specific visibility scope, then verifies the fact cannot leak through any read path with an audience that shouldn't see it. The tests are marked `@pytest.mark.visibility` (registered in `pyproject.toml [tool.pytest.ini_options]`) and are documented in `README.md` as a required verification gate: `uv run pytest -m visibility`. No justfile or Makefile is used — gates are manual per Phani's pre-commit ritual.

Two complementary checks are also added: an `alembic check` gate (ORM models match latest migration head) and an operations-log shape check (every JSONL line conforms to schema; deferred to #089 but the gate scaffold goes here).

## Acceptance criteria

- [ ] `tests/test_visibility_invariants.py` is created with at minimum these tests:
  - `test_private_event_does_not_leak_to_engagement_audience` — private event never appears in non-self audience query.
  - `test_stakeholder_set_requires_full_subset` — stakeholder_set entity visible only when audience ⊆ members.
  - `test_derived_atom_inherits_intersection` — `derived_visibility(['private', 'engagement_scoped'])` returns `private`.
  - `test_audience_filtered_summary_uses_filtered_atoms` — atoms passed to brief composition are pre-filtered (asserts the contract structurally).
  - `test_retracted_entity_excluded` — retracted atoms/events excluded from default reads (depends on #084).
- [x] Tests use real SQLite (in-memory or temp file), seeded fixture data covering all four visibility scopes.
- [x] `pytest.ini` (or `pyproject.toml [tool.pytest.ini_options]`) registers a `visibility` marker.
- [x] `README.md` "Verification gates" section is updated to list visibility regression tests (`uv run pytest -m visibility`) and `alembic check` as required gates.
- [x] All visibility-marked tests pass; full suite count is 209.

## Notes

The visibility invariants are defined in `loom-meta/docs/loom-v08-alignment.md` §2.3. This issue is the "ship the test suite + make it required" ticket.

The `audience-filtered summarisation contract` test (§2.4 of the refactor plan) is structural: the test asserts that when `compose_brief` is called for a non-self audience, no atoms with restrictive scopes appear in the atoms list passed to the cognition layer. This is verified by injecting a recording stub for the cognition call and asserting on its inputs.

Why this is a separate gate rather than ordinary pytest: a regression in visibility is a privacy bug, not a correctness bug. Marking it explicitly lets us reason about it independently and (later) ship visibility-related changes through a stricter review gate.

After this lands, the v0.8 alignment workstream can proceed into Phase B with a structural backstop against visibility regressions. Any new read path added in #080–#091 must have a visibility test before it ships.

## Deferred to dependent issues

Two visibility-invariant tests originally scoped to this issue are deferred to the issues that introduce their dependencies:

- `test_audience_filtered_summary_uses_filtered_atoms` — depends on the cognition module's summary read path. Lands in #080.
- `test_retracted_entity_excluded` — depends on the atom retraction endpoint and `Atom.retracted` filter behaviour at the read path. Lands in #084.

Both tests will be authored with `pytestmark = pytest.mark.visibility` in `tests/test_visibility_invariants.py` (extending this file rather than splitting), preserving the marker-only run as a complete invariant suite.

## Closure note

Landed via Claude Code, 2026-05-04.

- 7 behaviours executed (B1–B6 tests + B7 README edit). 12 new tests across the 6 test functions (B2 parametrized 5 cases, B3 parametrized 3 cases).
- Test count: 197 → 209 (+12). Visibility marker run: 12 passed, 197 deselected.
- All gates green: `ruff check`, `ruff format --check`, `mypy --strict`, `pytest`, `pytest -m visibility`, `alembic check`.
- No test went RED on first run. All visibility invariants confirmed.
- B6 (`test_route_get_events_filters_for_stakeholder_audience`) includes both negative (private filtered out) and positive (domain_wide event present) controls. The domain_wide event was inserted directly via the session factory since POST `/v1/events` doesn't yet accept a `visibility_scope` field — deferred to the Pydantic v0.8 surface work.
- Incidental ruff cleanup landed alongside: import ordering in `loom_core/api/arenas.py` and `loom_core/api/engagements.py` (pre-existing drift), and removal of stranded `update_hypothesis` import in `tests/services/test_hypotheses_service.py` (residue from the pre-flight `TriageItem` kwarg fix).
- Phase A closed with this issue. W3 atom extraction sequence resumes with #012 (rules-based atom extractor).
