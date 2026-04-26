# 075 — Architecture review RFC after W1–W4

**Workstream:** W14
**Tag:** HITL
**Blocked by:** #022
**User stories:** none

## Behaviour

After the spine (W2), capture (W3), and triage (W4) workstreams are complete, run an architecture review to surface shallow modules, tight coupling, and seams before the system grows further. The output is one or more RFC issue files written to `loom-meta/issues/` using the standard issue template. The architecture review is a human-driven judgment call — Ralph identifies candidates, Phani decides what to act on.

## Acceptance criteria

- [ ] `/improve-codebase-architecture` (or equivalent) is run against `loom-core/src/` after W1–W4 issues are complete and committed.
- [ ] The review output is written as one or more RFC issue files in `loom-meta/issues/` with `**Tag:** HITL` and `**Workstream:** W14`.
- [ ] The review identifies at minimum: shallow modules, tightly coupled clusters, and seams where integration risk lives (per workshop guide §10).
- [ ] Phani reads and approves each RFC before it is added to the active issue queue.
- [ ] At least one RFC issue is acted on before starting W5 (state inference).

## Notes

HITL because the output is a set of RFC issues that require human judgment — some findings may be deliberate design choices (e.g., the single-writer pattern), not bugs.

Trigger: when #022 (the last W4 issue) is marked complete. Do not run this review earlier — the W4 surface is the minimum viable system that reveals real coupling.

The architecture review is the W14 "workstream" — it is not a continuous workstream but a one-time milestone review at a specific trigger point.

Per workshop guide §10: "Run `/improve-codebase-architecture` periodically (or after the first few features land) to surface shallow modules." This is that periodic review for Loom v1.
