# 083 — Forward provenance: atom_contributions writes on every consumer

**Workstream:** W16
**Tag:** AFK
**Blocked by:** #076
**User stories:** none (foundational — unblocks retraction in #084)

## Behaviour

Every consumer of atoms records a `atom_contributions` row at write time, building the forward-provenance index. The four consumers are: brief composition, state inference, draft composition (W11+ surface), and dispatch send (W11+ surface). The write is idempotent (composite PK with `INSERT OR IGNORE`). The forward index is the substrate for retraction cascade (#084) and for impact analysis ("what did this atom contribute to?").

## Acceptance criteria

- [ ] `loom_core/services/atoms.py` exists with `record_contribution(session, atom_ids, consumer_type, consumer_id)` async function.
- [ ] `record_contribution()` is idempotent via `INSERT OR IGNORE` on the composite PK `(atom_id, consumer_type, consumer_id)`.
- [ ] `record_contribution()` is a no-op when `atom_ids` is empty.
- [ ] Brief composition (post-#035, #036 amendment) calls `record_contribution()` with `consumer_type='brief_run'`, `consumer_id=brief.id`, and the list of atom IDs that fed the brief.
- [ ] State inference (post-#023, #024, #025 amendment) calls `record_contribution()` with `consumer_type='state_change'`, `consumer_id=state_change.id`, and the list of triggering atom IDs.
- [ ] Draft composition (W11 surface, future) declares its API to call `record_contribution()` with `consumer_type='draft'`.
- [ ] Dispatch send (W11 surface, future) declares its API to call `record_contribution()` with `consumer_type='sent_action'`.
- [ ] Derived atoms (atoms produced by extraction from another atom's content) call `record_contribution()` with `consumer_type='derived_atom'`.
- [ ] Unit tests: idempotency on duplicate writes; empty-list no-op; happy path for each consumer_type.
- [ ] Integration test: compose a fixture brief from 3 atoms, verify 3 `atom_contributions` rows exist with correct consumer_id.
- [ ] All four CI gates pass.

## Notes

The forward-provenance index is the inverse of `state_change_evidence` (which is backward provenance). Backward says "what atoms triggered this state change?"; forward says "what did this atom contribute to?" Both are needed for retraction cascade (#084).

Idempotency matters because the cron jobs that produce briefs and state changes can be retried after partial failure. Without `INSERT OR IGNORE`, retry would fail on duplicate PK.

The four consumer types map to the four immutable artefacts that carry atom-derived content: briefs, state changes, drafts, and sent actions. A fifth type (`derived_atom`) covers the case where one atom is extracted from another's content (rare but possible — e.g., a status_update atom mentions a commitment that becomes its own atom).

Per blueprint §11.10, retraction must walk forward provenance to flag affected consumers. This issue lays the rails; #084 walks them.

Refactor plan reference: §1.7 (schema) and §4.1 (writes) of `loom-meta/docs/v08-alignment-refactor-plan.md`.

Lives in `loom-core/src/loom_core/services/atoms.py`. Tests in `loom-core/tests/services/test_atoms.py`.
