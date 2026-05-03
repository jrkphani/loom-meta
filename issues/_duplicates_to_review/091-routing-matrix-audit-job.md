# 091 — Quarterly routing-matrix audit job

**Workstream:** W13
**Tag:** AFK
**Blocked by:** #080, #089
**User stories:** US-33

## Behaviour

Per blueprint §13.4, the per-stage routing matrix is config-as-code; quarterly audit compares the current matrix against the original and flags drift. The audit runs as a manual command (`loom-core audit-routing`) or a quarterly cron; it diffs `skills/routing-policy.yaml` HEAD vs. the v0.8 baseline (`skills/routing-policy.baseline.yaml`), surfaces changes as a triage_items row of type `routing_matrix_drift`, and writes the audit result to the operations log.

## Acceptance criteria

- [ ] `loom_core/cli.py audit-routing` command compares `skills/routing-policy.yaml` against `skills/routing-policy.baseline.yaml`.
- [ ] Drift is reported in three categories: stages added, stages removed, provider changes per stage.
- [ ] Each drift item creates a triage_items row of new type `routing_matrix_drift` (added to the CHECK constraint via the same migration as #076 or a follow-up). `context_summary` carries the diff.
- [ ] Audit result logged to operations log (#089) as `op_type='routing_audit'` with `details` containing the diff and stage counts.
- [ ] APScheduler registers `routing_audit` quarterly (every 91 days); cron-style "first day of jan/apr/jul/oct at 04:00 UTC".
- [ ] `loom-core audit-routing --accept-current` writes the current YAML to baseline and clears outstanding drift triage items (a deliberate action — updates require explicit acceptance).
- [ ] When no drift is found, audit completes with no triage items and logs `details: {drift: false}`.
- [ ] Integration test: change a stage's provider in the YAML → run audit → drift detected and triage row created with the diff.
- [ ] Audit run uses idempotency key `routing_audit:YYYY-MM-DD` so a launchd-restart doesn't double-run.

## Notes

This is the smallest-effort issue in Phase D but the one that keeps cognition routing intentional rather than drift-prone. Without it, the matrix degrades into "whatever the last engineer changed" with no governance.

The `--accept-current` flow is deliberate: drift is not assumed to be wrong; it might be a considered change. Audit surfaces drift; human acknowledges or reverts.

Reference: refactor plan §3.2 + §12, blueprint §13.4.
