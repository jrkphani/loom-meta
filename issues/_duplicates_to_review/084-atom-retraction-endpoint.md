# 084 — Atom retraction endpoint + cascade walk

**Workstream:** W16
**Tag:** AFK
**Blocked by:** #083
**User stories:** US-25

## Behaviour

`POST /v1/atoms/{atom_id}/retract` marks an atom retracted with reason and walks the forward-provenance index to flag every consumer for review: briefs marked for regen, drafts surfaced for review, sent actions surfaced in correction surface, derived atoms walked transitively (cycle-safe). The retraction is logged to the operations log and emits a training signal to cognition self-improvement so the failure attribution lands at the right `extractor_provider` / `extractor_skill_version`.

## Acceptance criteria

- [ ] `POST /v1/atoms/{atom_id}/retract` with body `{reason}` returns a `RetractionResult` containing `affected_briefs`, `affected_drafts`, `affected_state_changes`, `affected_sent_actions`, `affected_derived_atoms` lists.
- [ ] Retracting an already-retracted atom returns 409 (`AtomAlreadyRetractedError`).
- [ ] `reason` must be one of `'hallucination'`, `'wrong_extraction'`, `'stale_source'`, `'corrected_on_review'`; other values return 422.
- [ ] Affected briefs are flagged for regeneration via a triage_items row of new type `brief_regen_needed` (added to the CHECK constraint via the same migration as #076 or a follow-up).
- [ ] Affected drafts are surfaced in a draft review queue (placeholder for v1; flag-only is acceptable until draft composition lands).
- [ ] Affected sent actions are surfaced in a correction surface (placeholder for v1; flag-only is acceptable).
- [ ] Derived atoms are walked transitively with a cycle-safe `visited` set (per Open Question 25).
- [ ] Retraction logged to operations log (#089) with `op_type='retraction'`, `details` containing atom_id, reason, triggered_by, affected lists.
- [ ] Training signal emitted for the cognition self-improvement loop, tagged with `extractor_provider` and `extractor_skill_version` from the retracted atom so the failure attribution reaches the right place.
- [ ] Atoms with `extractor_provider IS NULL` (manually-created atoms) skip the training signal step but still cascade.
- [ ] Integration test: retract an atom that fed a brief → brief surfaces in regen queue; retract an atom feeding two derived atoms → walk reaches both transitively.
- [ ] Cycle-safety test: artificially create a contributions cycle, retract the seed atom, walk completes without infinite recursion.

## Notes

Retraction and dismissal are distinct. Dismissal (#018) is "not relevant"; retraction is "wrong fact." Most user cleanup is dismissal; retraction is reserved for hallucinations and wrong extractions. The dismissal endpoint (#018) auto-triggers retraction when the dismissal reason is `'hallucination'` or `'wrong_extraction'`.

The cascade is single-pass per atom — retracting atom A walks all consumers in one transaction. If a consumer (e.g., a brief) flags for regen, the regenerated brief is a new operation that runs separately; no recursive regen loop.

Reference: refactor plan §4.2, blueprint §11.10.
