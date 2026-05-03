# 084 — Atom retraction endpoint + cascade walk

**Workstream:** W16
**Tag:** AFK
**Blocked by:** #076, #083
**User stories:** US-15 (extends override-as-training-signal pattern with retraction-as-correction)

## Behaviour

`POST /v1/atoms/{atom_id}/retract` marks an atom as retracted and cascades through forward provenance. The cascade flags affected briefs for regeneration, surfaces affected drafts in a review queue, surfaces sent actions in a correction surface, and walks derived atoms transitively (cycle-safe via visited set). The retraction is logged to the operations log (#089) and emits a training signal to the self-improvement layer.

## Acceptance criteria

- [ ] `POST /v1/atoms/{atom_id}/retract` accepts `{reason: str}` body where reason ∈ `{hallucination, wrong_extraction, stale_source, corrected_on_review}`.
- [ ] Returns 200 with `RetractionResultRead` body listing affected briefs, drafts, state changes, sent actions, derived atoms.
- [ ] Returns 404 if atom does not exist.
- [ ] Returns 409 if atom is already retracted (idempotency: same-reason re-retraction is 409, not 200).
- [ ] `loom_core/services/retraction.py::retract_atom()` implements the seven-step cascade per refactor plan §4.2: mark retracted, walk contributions, flag briefs, surface drafts, surface sent actions, walk derived atoms transitively, log to operations log, emit training signal.
- [ ] Cycle safety: a derived-atom chain that loops back to the original atom does not infinite-recurse (visited set tracks atom IDs).
- [ ] Affected briefs gain a `pending_regen` flag (column added in #076 if not present, or via dedicated `brief_regen_queue` table — design decision in this issue).
- [ ] Affected drafts surface in the triage queue with a new `item_type = 'retraction_review'`.
- [ ] Sent actions surface in a correction surface (table `correction_surface` added if needed; otherwise re-use triage with new `item_type = 'sent_action_correction'`).
- [ ] Training signal: when atom has `extractor_provider` populated, an entry is emitted to a self-improvement signal store (`improvement_signals` table or JSON log — TBD in this issue).
- [ ] Unit tests cover: happy path retraction; cycle in derived atoms; already-retracted 409; non-existent 404.
- [ ] Integration test: retract an atom that contributed to 2 briefs and 1 state change; verify all three are flagged.
- [ ] All four CI gates pass.

## Notes

Per blueprint §11.10 and refactor plan §4, retraction is a first-class operation, not an admin action. The user discovers a hallucinated atom (via brief review or external feedback) and retracts it; the system honours the cascade.

The cascade is **structural**, not advisory. Affected briefs cannot be quietly read after a contributing atom is retracted; the `pending_regen` flag forces a regeneration before next read.

Sent actions are the most sensitive case: the system has already communicated something to a stakeholder based on the atom. The correction surface presents a draft correction message for the user to review and send (or dismiss as not worth correcting).

The training signal feeds the §11.11 self-improvement loop: if extractor X with skill version Y is producing retractions at a rate above threshold, the improvement-service flags the skill for review. This issue lays the rail; the improvement-service consumer is out of v1 scope but the signal must be emitted.

Design decision in this issue: dedicated `brief_regen_queue` and `correction_surface` tables vs reusing `triage_items` with new item_types. Recommend reusing triage_items for v1 (simpler, fewer tables); promote to dedicated tables in v2 if volume warrants. Document the decision in the issue PR.

Refactor plan reference: §4.2 of `loom-meta/docs/v08-alignment-refactor-plan.md`.

Lives in `loom-core/src/loom_core/services/retraction.py`, `loom-core/src/loom_core/api/atoms.py`. Tests in `loom-core/tests/services/test_retraction.py`.
