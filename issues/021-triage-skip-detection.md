# 021 — Triage skip detection: backlog warnings and three-strikes degradation

**Workstream:** W4
**Tag:** AFK
**Blocked by:** #020
**User stories:** US-16, US-17

## Behaviour

If an engagement's triage queue is not processed for an extended period, Loom flags the backlog and eventually stops generating new state-change proposals for that engagement. The backlog warning appears in the triage GET response as a metadata field. After three consecutive missed weekly cycles, the inference pipeline for that engagement is suspended (a flag on the engagement service, not a DB column) until the user completes a triage session.

## Acceptance criteria

- [ ] `GET /v1/triage?engagement_id=:id` includes a `backlog` field in the response: `{weeks_since_last_triage: N, item_count: M, degraded: bool}`.
- [ ] `weeks_since_last_triage` is computed from the latest `resolved_at` timestamp among triage items for that engagement's hypotheses' atoms; or from the engagement's `created_at` if no items have ever been resolved.
- [ ] `degraded: true` when `weeks_since_last_triage >= 3`.
- [ ] When degraded, the W5 state inference pipeline skips that engagement (checked at inference time via the triage service).
- [ ] Completing any triage resolution for the engagement (POST /v1/triage/items/:id/resolve) resets the degraded state.
- [ ] Unit tests: simulate 0, 1, 2, 3 missed weeks and assert degraded = false/false/false/true.

## Notes

"Three consecutive skipped triage cycles" means 3 × 7 days = 21 days with no triage resolution for any item linked to the engagement. The degradation is checked at inference time (W5 #023), not stored as a column.

The `weeks_since_last_triage` calculation uses the `processor_runs` table (last `state_inference` run) plus the `triage_items.resolved_at` timestamps. Do not add new columns to existing tables.

This feature intentionally degrades gracefully: it doesn't delete data, doesn't stop capture. It only stops generating new proposals until the user resumes.
