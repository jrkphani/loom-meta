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
