# 023 — State inference: progress dimension (rules-based)

**Workstream:** W5
**Tag:** AFK
**Blocked by:** #017
**User stories:** US-15, US-21

## Behaviour

A rules-based engine reads the atoms attached to a hypothesis and infers whether the `current_progress` dimension should change. Progress is evidence-sovereign: it advances based on observable facts (decisions made, commitments met, defined terminal signals) rather than sentiment. The engine creates a `hypothesis_state_changes` proposal row and a `triage_items` row of type `state_change_proposal` for Phani to confirm or override.

## Acceptance criteria

- [ ] The progress inference engine reads all non-dismissed atoms attached to a hypothesis via `atom_attachments`.
- [ ] A hypothesis with at least one `decision` atom and no terminal signals infers `in_delivery` if currently `proposed`; returns a proposal, not a direct state change.
- [ ] Terminal progress signals (`realised`, `confirmed`, `dead`) are detected by keywords in atom content or explicit atom type patterns (configurable, not hardcoded).
- [ ] The engine skips engagements flagged as degraded (>3 weeks since last triage, per #021).
- [ ] A proposal row is written to `hypothesis_state_changes` with `changed_by = cron_inferred` and `reasoning` populated.
- [ ] A `triage_items` row is created with `item_type = state_change_proposal` for each proposal.
- [ ] `state_change_evidence` rows are written linking the proposal to the atoms that triggered it.
- [ ] Unit tests with fixture atoms assert the correct proposal for at least 3 progress state transitions.

## Notes

Progress is the only dimension that is "evidence-sovereign" (PRD §5.4, US-15). Unlike confidence and momentum (which are interpretive), progress should only advance when there is concrete evidence.

The rules engine lives in `loom-core/src/loom_core/pipelines/inference/progress.py`.

`state_change_evidence` (lines ~129–133 in `loom-schema-v1.sql`) links the proposal change ID to atom IDs. Write these after the `hypothesis_state_changes` row is committed.

Do not directly update `hypotheses.current_progress` — that is done by the human confirm/override (#006). The proposal is pending until Phani acts.
