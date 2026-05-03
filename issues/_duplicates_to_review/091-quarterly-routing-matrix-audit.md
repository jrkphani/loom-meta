# 091 — Quarterly routing-matrix audit job

**Workstream:** W18
**Tag:** AFK
**Blocked by:** #080, #089
**User stories:** none (foundational governance)

## Behaviour

Per blueprint §13.4, the cognition routing matrix is config-as-code (in `skills/routing-policy.yaml`) and quarterly drift is monitored. A scheduled job (quarterly, first Monday of Q1/Q2/Q3/Q4) compares the current matrix against a snapshot of the original, identifies drift (stages whose provider has changed), and emits a triage item with the diff for the user to review and either accept (update the snapshot) or revert.

## Acceptance criteria

- [ ] `loom_core/pipelines/routing_matrix_audit.py::run_audit()` reads current `skills/routing-policy.yaml` and the snapshot at `skills/routing-policy.snapshot.yaml`.
- [ ] Diff computation: any stage whose mapped provider differs between current and snapshot is captured with `(stage, snapshot_provider, current_provider, last_modified_at)`.
- [ ] When drift is detected, a `triage_items` row of new type `routing_audit_drift` is created with `context_summary` listing the drift entries.
- [ ] Audit run is logged to operations log (#089) with op_type='routing_matrix_audit', details including drift count.
- [ ] APScheduler registers `routing_matrix_audit` quarterly (first Monday of Jan/Apr/Jul/Oct at 04:00).
- [ ] On-demand trigger: `POST /v1/admin/routing-audit` runs the audit immediately; admin-only (no other endpoint behind admin yet — flag for #075-style RFC if more land).
- [ ] User accepts drift: `POST /v1/admin/routing-audit/accept` rewrites the snapshot to match current; logs to operations log.
- [ ] User reverts drift: `POST /v1/admin/routing-audit/revert` rewrites current to match snapshot; logs to operations log; restarts the cognition router to reload policy.
- [ ] Unit tests: drift detection with fixture YAMLs; accept and revert round-trips.
- [ ] All four CI gates pass.

## Notes

Per blueprint §13.4, the routing matrix is the single most consequential piece of cognition configuration. Silent drift is a serious risk: a stage that was supposed to use Apple FM (private-safe) gets routed to Claude API (cloud) because someone "fixed" the YAML; the privacy guarantee silently degrades.

The quarterly cadence is intentional — too frequent and it becomes noise; too rare and drift accumulates. First-Monday-of-quarter aligns with the existing arena-brief cadence and gives the user a known review point.

The triage item with the diff is the human review surface. The accept/revert pattern mirrors the state-change confirm/override pattern from #006: structural review with explicit user choice.

Snapshot rewriting on accept is the only way the snapshot changes — there is no "auto-promote current to snapshot" because that would defeat the audit. The user must explicitly accept.

Admin endpoints: this is the first instance of an admin-only API surface in loom-core. v1 uses a simple "is the request from localhost AND the user is logged in" check (since loom-core binds 127.0.0.1 only, the second clause is implicit). Promote to a proper admin auth pattern when more admin endpoints land.

Refactor plan reference: §3.2 (routing policy) and §12 (verification gates) of `loom-meta/docs/v08-alignment-refactor-plan.md`. Blueprint reference: §13.4.

Lives in `loom-core/src/loom_core/pipelines/routing_matrix_audit.py`, `loom-core/src/loom_core/api/admin.py`. Tests in `loom-core/tests/pipelines/test_routing_matrix_audit.py`.
