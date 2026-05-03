# 091 — Quarterly routing-matrix audit job

**Workstream:** W18
**Tag:** AFK
**Blocked by:** #080, #084, #089
**User stories:** US-15 (state inference quality), US-22 (brief quality)

## Behaviour

Every quarter, an automated audit reads the operations log and the cognition cost meter, compares the current `RoutingPolicy.matrix` against the original (committed-to-git) baseline, and reports drift: stages that have been changed without an RFC, stages with retraction rates above threshold, stages where Apple FM downshifts happen too frequently. The audit produces a markdown report appended to `loom-meta/docs/cognition-audits/YYYY-Q.md` and creates a triage item `routing_audit_review` for Phani.

The audit is the structural feedback loop on cognition routing decisions: choices made today are reviewed in context six and twelve months later.

## Acceptance criteria

- [ ] `loom_core/observability/routing_audit.py` is created with `run_quarterly_audit(quarter: str) -> AuditReport` as the public function.
- [ ] APScheduler registers `routing_audit` to run on the first day of each quarter at 04:00 (Jan 1, Apr 1, Jul 1, Oct 1).
- [ ] The audit reads:
  - The current `skills/routing-policy.yaml` matrix.
  - The git-committed baseline (the matrix from the start of the quarter, accessed via subprocess `git show <commit>:skills/routing-policy.yaml`).
  - The operations log (#089) for the quarter.
  - The cognition cost meter snapshot.
  - The retraction signals log (#084) for the quarter.
- [ ] The audit produces an `AuditReport` with sections:
  - **Matrix drift.** Stages whose provider differs from the baseline; for each, the change date and any associated RFC commit.
  - **Retraction hotspots.** Stages with retraction rate > 5% over the quarter; flagged for prompt or threshold review.
  - **Privacy-gate downshifts.** Stages where the privacy gate downshifted to apple_fm > 20% of the time; suggests reconsidering the matrix entry.
  - **Cost summary.** Per-stage call count + estimated cost (claude_api dollar cost; apple_fm calls counted but not priced).
- [ ] The report is written to `loom-meta/docs/cognition-audits/{year}-Q{n}.md`.
- [ ] A triage item with `item_type='routing_audit_review'` is created so the audit surfaces in Phani's queue.
- [ ] Unit tests cover: drift detection works with synthetic baseline + current matrices; retraction-hotspot threshold triggers correctly; report renders to markdown without errors.
- [ ] All four CI gates pass.

## Notes

Reference: `loom-meta/docs/loom-refactor-v08-plan.md` §3.2 (routing policy quarterly audit per §13.4 of the blueprint).

The audit doesn't change behaviour — it only reports. Matrix changes are still RFC-driven via human review of the audit report.

Retraction-rate threshold (5%) is a starting heuristic; tune based on actual data once a few quarters of operation accumulate. The threshold lives in config, not hardcoded.

Reading `skills/routing-policy.yaml` from git history is the only way to know the original baseline reliably — operational state can drift, but git history can't. This means the audit assumes loom-meta is a git repo, which it is; documented as a precondition.

After this lands, the v0.8 alignment workstream is fully complete. The system is shippable as a Personal OS v0.8-aligned loom-core.
