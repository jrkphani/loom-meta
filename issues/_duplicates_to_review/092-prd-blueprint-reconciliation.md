# 092 — PRD update and Personal OS blueprint reconciliation note

**Workstream:** W14
**Tag:** HITL
**Blocked by:** #076, #079, #084, #086, #087, #088, #090 (substantively complete)
**User stories:** none (planning hygiene); refactor plan §13

## Behaviour

After the v0.8 alignment work is substantively complete, the PRD and the Personal OS blueprint are reconciled with what shipped. The PRD gains a new section 7.x covering workstreams W15–W18 (the v0.8 alignment work). A new doc `loom-meta/docs/loom-v08-alignment.md` summarises what landed, what deferred, and which blueprint open questions are now resolved. The blueprint itself (in `loom-meta/docs/loom-blueprint.md`) gets a reconciliation note acknowledging that v1 ships as 3 polyglot services (Swift / Python / TS), not 4 — cognition, contacts, and standards live as modules inside loom-core for v1; extraction to separate services is deferred to v2 if rule volume / desk-load justifies.

## Acceptance criteria

- [ ] `loom-meta/issues/prd.md` gains a new sub-section under §7 (Workstreams) covering W15–W18 with the four-phase summary from refactor plan §11.
- [ ] PRD §6.2 (Architecture invariants) is updated to acknowledge: visibility filtering at SQL level on every read path; forward provenance maintained on every consumer; cognition routing through `CognitionRouter` with privacy gate.
- [ ] PRD §10.3 (Verification gates) lists the new visibility regression gate (#079).
- [ ] `loom-meta/docs/loom-v08-alignment.md` exists and covers:
  - One-paragraph summary of why the alignment was done and the Life OS framing.
  - Four-phase summary of what landed (one paragraph per phase).
  - Deferred items (sqlite-vec, separate cognition service, separate contacts service, separate standards service, multi-recipient composition, mobile capture syncbox).
  - Resolved blueprint open questions (Open Question #11 deferred to v2 — router prototype-then-port).
  - Pre-migration backup ritual and verification commands (for next time).
- [ ] `loom-meta/docs/loom-blueprint.md` gains a "Reconciliation: v1 service decomposition" note: v1 = 3 polyglot services + module-internal cognition/contacts/standards; deferred decomposition for v2.
- [ ] `loom-core/README.md` "Layout" section is updated to show the new directories (`llm/`, `standards/`, `observability/`).
- [ ] `loom-core/README.md` "Verification gates" lists all five gates: ruff, ruff format, mypy --strict, pytest, pytest -m visibility.
- [ ] A short blog-post-style summary at the top of `loom-v08-alignment.md` explains the alignment for future contributors who weren't around when it happened (~300 words).
- [ ] HITL review: Phani reads the alignment doc and the PRD update before merge.

## Notes

This is the "close the loop" issue. v0.8 alignment isn't done until the docs reflect what actually shipped. Otherwise the next contributor (or future-Phani) reads the PRD and assumes a 4-polyglot v1 still describes the system.

Reference: refactor plan §13 ("What to revise in the blueprint").

**Why HITL**: the doc updates require judgement — deciding which deferred items to flag prominently, which to bury in a footnote, what context tomorrow-Phani will need. Not Ralph-runnable.

**Why now rather than after every phase**: doc churn during active refactor is wasteful. One pass at the end captures the whole arc.

**This issue closes #075 (architecture review RFC).** The v0.8 alignment plan was the de facto output of that RFC, executed early because of the Life OS repositioning. #075 is amended to mark itself superseded by this body of work.

**Future companion**: when v2 starts (multi-domain, separate cognition service, etc.), the next round of doc reconciliation. Mark on the calendar.
