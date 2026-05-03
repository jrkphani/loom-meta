# 079 — Visibility regression test suite and CI gate

**Workstream:** W15
**Tag:** AFK
**Blocked by:** #076, #077, #078
**User stories:** none directly (gates everything in W16/W17)

## Behaviour

A dedicated test module `tests/test_visibility_invariants.py` codifies the visibility invariants from blueprint §6.4 as integration tests. Each test sets up a fact with a specific visibility scope, then verifies the fact cannot leak through any read path with an audience that shouldn't see it. The tests are marked `@pytest.mark.visibility` and are added as a required gate in `justfile` and CI: no merge to main without these passing.

Two complementary checks are also added: an `alembic check` gate (ORM models match latest migration head) and an operations-log shape check (every JSONL line conforms to schema; deferred to #089 but the gate scaffold goes here).

## Acceptance criteria

- [ ] `tests/test_visibility_invariants.py` is created with at minimum these tests:
  - `test_private_event_does_not_leak_to_engagement_audience` — private event never appears in non-self audience query.
  - `test_stakeholder_set_requires_full_subset` — stakeholder_set entity visible only when audience ⊆ members.
  - `test_derived_atom_inherits_intersection` — `derived_visibility(['private', 'engagement_scoped'])` returns `private`.
  - `test_audience_filtered_summary_uses_filtered_atoms` — atoms passed to brief composition are pre-filtered (asserts the contract structurally).
  - `test_retracted_entity_excluded` — retracted atoms/events excluded from default reads (depends on #084).
- [ ] Tests use real SQLite (in-memory or temp file), seeded fixture data covering all four visibility scopes.
- [ ] `pytest.ini` (or `pyproject.toml [tool.pytest.ini_options]`) registers a `visibility` marker.
- [ ] `justfile` `verify` target adds `uv run pytest -m "not external"` (already there) PLUS an explicit `uv run pytest -m visibility` line so a missing-marker regression is loud.
- [ ] `justfile` `verify` target also runs `uv run alembic check` to confirm ORM models match migration head.
- [ ] `README.md` "Verification gates" section is updated to list visibility regression tests and `alembic check` as required gates.
- [ ] All four CI gates plus the new visibility gate pass.

## Notes

The visibility invariants are defined in `loom-meta/docs/loom-v08-alignment.md` §2.3. This issue is the "ship the test suite + make it required" ticket.

The `audience-filtered summarisation contract` test (§2.4 of the refactor plan) is structural: the test asserts that when `compose_brief` is called for a non-self audience, no atoms with restrictive scopes appear in the atoms list passed to the cognition layer. This is verified by injecting a recording stub for the cognition call and asserting on its inputs.

Why this is a separate gate rather than ordinary pytest: a regression in visibility is a privacy bug, not a correctness bug. Marking it explicitly lets us reason about it independently and (later) ship visibility-related changes through a stricter review gate.

After this lands, the v0.8 alignment workstream can proceed into Phase B with a structural backstop against visibility regressions. Any new read path added in #080–#091 must have a visibility test before it ships.
