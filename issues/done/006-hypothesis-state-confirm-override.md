# 006 — Hypothesis state: confirm and override proposals

**Workstream:** W2
**Tag:** AFK
**Blocked by:** #005
**User stories:** US-15

## Behaviour

Phani can confirm or override a pending state-change proposal. A confirm accepts the cron-inferred new value as-is; an override replaces it with Phani's chosen value and records a mandatory `override_reason`. Both operations write a `hypothesis_state_changes` row with `changed_by = human_confirmed` or `human_overridden`, resolve the triage item, and update the denormalized state columns on `hypotheses`. The override reason is the highest-value training signal in the system and is never optional when overriding.

## Acceptance criteria

- [ ] `POST /v1/hypotheses/:id/state/confirm` with `{dimension, proposal_id}` resolves the proposal and writes a `hypothesis_state_changes` row with `changed_by = human_confirmed`.
- [ ] `POST /v1/hypotheses/:id/state/override` with `{dimension, new_value, override_reason, proposal_id}` writes a `hypothesis_state_changes` row with `changed_by = human_overridden`; `override_reason` is required — omitting it returns 422.
- [ ] Both operations update the relevant denormalized column on `hypotheses` (e.g., `current_confidence`, `confidence_last_reviewed_at`, `confidence_inferred = false`) in the same transaction.
- [ ] Both operations update the triage item's `resolved_at` and `resolution` in the same transaction.
- [ ] Attempting to confirm a non-existent or already-resolved proposal returns 404 or 409 respectively.
- [ ] Service tests cover: confirm (progress, confidence, momentum), override with reason, override without reason (422), double-confirm (409).

## Notes

The denormalized update and audit row must be in a single SQLAlchemy transaction to preserve the invariant described in `loom-schema-v1.sql` design note 4.

`state_change_evidence` (lines ~129–133) links a state change to the atoms that triggered it. At this stage (human confirm/override) there may be no new atoms; the evidence table is populated by the W5 inference pipeline. The confirm/override endpoints do NOT need to populate `state_change_evidence`.

Route: `POST /v1/hypotheses/:id/state/confirm`, `POST /v1/hypotheses/:id/state/override`.
