# 084 — Atom retraction endpoint and cascade walk

**Workstream:** W16
**Tag:** AFK
**Blocked by:** #076, #083, #089
**User stories:** US-15, US-25 (correctness in the face of bad inferences)

## Behaviour

When an atom is identified as wrong — hallucinated, mis-extracted, sourced from a stale fact, or corrected on review — it is **retracted**, not dismissed. Retraction is structurally distinct from dismissal: dismissal says "this atom isn't relevant to my workflow"; retraction says "this atom is wrong and anything downstream of it is now suspect." Retraction cascades through forward provenance: briefs flag for regeneration, drafts surface in review, sent actions surface in a correction surface, derived atoms walk transitively (cycle-safe).

The endpoint is `POST /v1/atoms/:id/retract` with `{reason}`. The retraction service marks the atom retracted, walks `atom_contributions`, takes the right downstream action per consumer type, logs the retraction to the operations log (#089), and emits a training signal for the cognition self-improvement loop.

## Acceptance criteria

- [ ] `POST /v1/atoms/:id/retract` with body `{"reason": "hallucination" | "wrong_extraction" | "stale_source" | "corrected_on_review"}` returns 200 with the cascade result; invalid reasons return 422.
- [ ] `loom_core/services/retraction.py` is created with `retract_atom(session, atom_id, reason, triggered_by)` as the public function returning a `RetractionResult` dataclass.
- [ ] `RetractionResult` includes lists of affected `briefs`, `drafts`, `state_changes`, `sent_actions`, `derived_atoms`.
- [ ] Already-retracted atoms return 409 `AtomAlreadyRetractedError`.
- [ ] On retraction: `atoms.retracted = True`, `atoms.retracted_at = now()`, `atoms.retraction_reason = <reason>` are set.
- [ ] The cascade walks `atom_contributions` transitively, cycle-safe via a `visited: set[str]` accumulator (Open Question 25).
- [ ] For each affected brief, the brief is flagged for regeneration (a `brief_runs` row with `success=false` and `error_message='retraction_pending_regen'` is written; the next cron pass regenerates).
- [ ] For each affected draft, a triage item with `item_type='draft_review_after_retraction'` is created.
- [ ] For each affected sent action, a triage item with `item_type='sent_correction_surface'` is created.
- [ ] The retraction is logged to the operations log (#089) with `op_type='retraction'`, `op_id=ULID`, full details (atom_id, reason, triggered_by, cascade summary).
- [ ] If the atom has a non-null `extractor_provider`, a training signal row is appended to a self-improvement log with `kind='extraction_retraction'`, the provider, the skill version, and the reason.
- [ ] An integration test seeds: an atom contributing to a brief and a state change; calls retract; asserts the brief is flagged for regen, the state-change atoms list is updated, and the operations log records the retraction.
- [ ] Unit tests cover: cycle-safety (an atom whose derived atom transitively retracts itself doesn't loop); already-retracted returns 409; cascade collects all consumer types correctly.
- [ ] All four CI gates pass.
- [ ] Visibility regression test `test_retracted_entity_excluded` lands in `loom-core/tests/test_visibility_invariants.py` with `@pytest.mark.visibility` (module-level marker already in place from #079). Test asserts that retracted atoms are excluded from read-path results regardless of audience, including for `Audience.for_self()`.

## Notes

Reference: `loom-meta/docs/loom-v08-alignment.md` §4.2.

Retraction is the inverse of dismissal in correctness terms: a dismissed atom is still good substrate (it just wasn't relevant); a retracted atom is bad substrate (anything built on it is suspect). The two workflows can co-occur: an atom can be both retracted and dismissed.

The dismissal endpoints in #018 amendment automatically trigger retraction when the dismissal reason is `'hallucination'` or `'wrong_extraction'`. That's the only path where dismissal and retraction couple; otherwise they're independent.

Sent actions: in v1, "sent action" is rare (briefs go to vault, not external; drafts are reviewed in UI before send). The sent_action consumer type is a forward-looking hook for when external action dispatching lands. For now, the cascade walks it but the surface for correction is just the triage queue.

Self-improvement signals: a separate "training signals" log is appended-to but not (yet) read by automated tooling. The quarterly routing-matrix audit (#091) will surface "stage X has a high retraction rate" patterns. For v1, the log exists; the analysis is human-driven.

After this lands, the retraction-aware behaviours in #013 amendment, #017 amendment, #018 amendment can be exercised end-to-end.
