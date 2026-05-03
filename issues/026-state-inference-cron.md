# 026 — state_inference cron job and inferred-flag enforcement

**Workstream:** W5
**Tag:** AFK
**Blocked by:** #024, #025
**User stories:** US-15, US-21

## Behaviour

At 06:30 daily, the `state_inference` pipeline runs all three dimension engines (progress, confidence, momentum) for every active, non-degraded hypothesis. It records the run in `processor_runs`. On API read surfaces (GET /v1/hypotheses/:id and brief renders), the `confidence_inferred` and `momentum_inferred` flags are explicitly present so the UI and MCP can distinguish machine inference from human confirmation.

## Acceptance criteria

- [ ] APScheduler registers `state_inference` at daily 06:30 (CronTrigger).
- [ ] The cron job processes all hypotheses where `closed_at IS NULL`, skipping engagements flagged as degraded (#021).
- [ ] Each run writes a `processor_runs` row with `pipeline = 'state_inference'`, start/end times, and item counts.
- [ ] `GET /v1/hypotheses/:id` response includes `confidence_inferred: bool` and `momentum_inferred: bool` fields.
- [ ] `GET /v1/hypotheses/:id/state` likewise includes the inferred flags per dimension.
- [ ] An integration test runs the full inference pipeline on a fixture hypothesis with attached atoms; asserts that at least one proposal is created.

## Notes

The inference pipeline processes hypotheses one at a time (not batched) to avoid long-running transactions. Each hypothesis's three engine calls (progress, confidence, momentum) run in separate transactions.

`hypothesis_state_changes` proposals created during the run are `changed_by = 'cron_inferred'`. They remain in the triage queue until Phani confirms or overrides.

For cost control: only run confidence and momentum inference on hypotheses that have new atoms since the last inference run. Track `last_inferred_at` using the latest `hypothesis_state_changes.changed_at` where `changed_by = 'cron_inferred'`. Progress inference always runs (it's rules-based and cheap).

Cron schedule from PRD §6.4: `state_inference` at 06:30 daily.

---

## v0.8 Alignment Addendum

**Depends on:** #076 (schema), #086 (resource attribution), #089 (operations log), #090 (idempotency)

The state_inference cron now also drives leverage attribution (#086) per hypothesis. The cron run is the single daily pass over every hypothesis: state inference + leverage attribution happen together, atomically per hypothesis.

### Additional acceptance criteria

- [ ] After progress/confidence/momentum inference completes for a hypothesis, `attribute_to_hypothesis(session, hypothesis_id, resources)` runs (#086) and writes `resource_attributions` rows.
- [ ] Each `state_inference.run` op writes to the operations log (#089) with `op_type = 'state_inference.run'`, `op_id = ULID`, `inputs_hash` over the hypothesis_id list, status `started` then `completed` or `failed`.
- [ ] The cron run uses an Idempotency-Key (#090) of `state_inference:YYYY-MM-DD` so a launchd-restart doesn't double-run on the same day.
- [ ] On replay (#089), incomplete state_inference ops resume from where they left off (per-hypothesis idempotency keys).

