# 005 — Hypothesis state: current state, history, and proposals

**Workstream:** W2
**Tag:** AFK
**Blocked by:** #004
**User stories:** US-15, US-21

## Behaviour

Phani can read the full three-dimensional state of a hypothesis (progress, confidence, momentum) along with its audit trail and any pending state-change proposals. The history shows who changed each dimension, when, with what reasoning, and whether the change was cron-inferred or human-confirmed. Inferred-but-unreviewed state is visually distinguished in the API response via the `confidence_inferred` and `momentum_inferred` flags.

## Acceptance criteria

- [ ] `GET /v1/hypotheses/:id/state` returns the current three-dimensional state with last-changed timestamps and the `confidence_inferred` / `momentum_inferred` flags.
- [ ] `GET /v1/hypotheses/:id/state/history` returns `hypothesis_state_changes` rows ordered by `changed_at DESC`; each row includes dimension, old_value, new_value, changed_by, reasoning, override_reason.
- [ ] `GET /v1/hypotheses/:id/state/proposals` returns pending triage items of type `state_change_proposal` for this hypothesis.
- [ ] History endpoint supports `?dimension=progress` filter.
- [ ] An inferred (not yet confirmed) confidence or momentum dimension is marked `inferred: true` in the state response.
- [ ] Service tests verify that history rows appear in correct order and filters work.

## Notes

Schema: `hypothesis_state_changes` (lines ~114–125), `state_change_evidence` (lines ~129–133) in `loom-schema-v1.sql`.

The `changed_by` values are `cron_inferred`, `human_confirmed`, `human_overridden`. The proposals endpoint queries `triage_items` where `item_type = 'state_change_proposal'` and `related_entity_id = hypothesis_id` and `resolved_at IS NULL`.

Triage items won't have data until W4+W5 are running, but the endpoint must return an empty list correctly. This issue makes the read surface; writes happen in #006 (human confirm/override) and W5 (inference).

Route: `GET /v1/hypotheses/:id/state`, `GET /v1/hypotheses/:id/state/history`, `GET /v1/hypotheses/:id/state/proposals`.
