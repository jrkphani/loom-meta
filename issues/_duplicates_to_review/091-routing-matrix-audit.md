# 091 — Quarterly routing-matrix audit job

**Workstream:** W13 (Phase D — v0.8 alignment)
**Tag:** AFK
**Blocked by:** #080, #089
**User stories:** new (refactor plan §13.4)

## Behaviour

Once per quarter, an audit job compares the live `skills/routing-policy.yaml` against the baseline committed at the start of the quarter (or at v0.8 alignment completion, whichever is later). The job produces a structured diff: which stages changed providers, when each change happened, and what the cost-meter delta has been since the change. The diff is logged to the operations log (#089) with `op_type = 'routing_audit'` and surfaced in `loom doctor`. Drift in routing without explicit human approval is a structural risk — a stage silently downgraded from claude_api to embeddings can quietly degrade brief quality.

## Acceptance criteria

- [ ] APScheduler job registered to run quarterly: 04:00 on the first day of January, April, July, October.
- [ ] At v0.8 alignment completion (end of W18), the current `routing-policy.yaml` is snapshotted to `loom_core/llm/skills/routing-policy.baseline.yaml` and committed.
- [ ] At each quarterly run, the job:
  - Reads the live policy and the baseline.
  - Produces a per-stage diff: `(stage, baseline_provider, current_provider, changed_at)`.
  - Reads cost-meter data (#080) for the past quarter; computes per-stage cost delta.
  - Writes a `routing_audit_report` to `outbox/operations/routing-audits/Q{n}-YYYY.md` (markdown summary).
  - Appends an entry to the operations log with op_type `routing_audit` and details summarising the diff.
- [ ] If the diff is non-empty, a triage row is created with `item_type = 'routing_review'` for human review.
- [ ] After a human reviews and approves the diff, an API endpoint `POST /v1/operations/routing-audits/:id/approve` updates the baseline to current and marks the triage row resolved.
- [ ] If the diff is empty, the report still writes (with "no drift" as the summary) — useful for confirming the audit ran.
- [ ] Tests: simulate diff generation with seed yaml files; verify report content; verify triage row creation when diff non-empty.

## Notes

Reference: refactor plan §13.4.

**Why quarterly rather than continuous**: routing changes are intentional (a stage's quality is improving, the budget is tightening, a provider has new pricing). A continuous diff would generate noise. Quarterly is rare enough to be a deliberate review event but frequent enough to catch drift before it compounds.

**Why human approval to update baseline**: the baseline is the "what we agreed routing should be" reference. Auto-updating it on every change defeats the purpose. The human reviews the diff, decides whether each change is intentional, and either approves (baseline updates) or pushes back (revert the routing to baseline).

**Cost-meter tie-in**: the report includes a per-stage cost delta vs. baseline so the reviewer can see the financial impact of any provider shifts. This is especially useful for stages that moved between local (free) and Claude API (paid).

**Operations log integration**: every audit run leaves a record. Useful for retrospective questions like "when did the brief composer move from claude_api to apple_fm?" — answerable in seconds via grep on the ops log.

**This is the structural defence against silent quality drift in cognition.** Without this audit, routing decisions would only get reviewed when something obviously breaks. With this audit, every quarter forces a deliberate look.
