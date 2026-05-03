# 088 — PRD and blueprint reconciliation note (v0.8 alignment)

**Workstream:** W14 (architecture review)
**Tag:** HITL
**Blocked by:** —
**User stories:** none (documentation)

## Behaviour

The Personal OS blueprint v0.8 envisions cognition, contacts, and standards as separate Rust services in a polyglot deployment. The v0.8 alignment refactor consciously deviates from that decomposition for v1: cognition, contacts/stakeholders, and standards live as modules inside loom-core, and the Rust router service is deferred. This document captures the deviation, records the rationale, and updates the blueprint open-questions list to mark Question #11 (router prototype-then-port) as **resolved: deferred to v2**.

The reconciliation note lives at `loom-meta/docs/loom-blueprint-v1-reconciliation.md`. It is read alongside the blueprint, not as a replacement.

## Acceptance criteria

- [ ] `loom-meta/docs/loom-blueprint-v1-reconciliation.md` is created with at minimum these sections:
  - **What v1 actually ships.** Polyglot count: 3 (Swift for msgvault + Loom UI; Python for loom-core + loom-mcp; TypeScript for web-clipper). Not 4. Cognition / contacts / standards are modules inside loom-core. Router service deferred.
  - **Deviation list.** Three named deviations from blueprint §service-decomposition: (1) cognition as module not service; (2) contacts as module — stakeholders stay in loom-core's `stakeholders` table; (3) standards as module not service.
  - **Why these deviations are safe.** For each deviation, the structural reason it's reversible: cognition has its own subpackage with adapter pattern, contacts schema is already aligned with future extraction, standards is a small rule set today. Extraction to separate services in v2 is mechanical, not architectural.
  - **What v0.8 is honoured.** Schema changes (visibility, retention, projection-at-creation, model-version metadata, role periods, audience profile, forward provenance, resources) all land. Operational disciplines (visibility regression tests, idempotency, operations log) all land. The deviation is purely about deployment topology.
  - **Open Question #11 (router prototype-then-port) → resolved.** Marked resolved: deferred to v2. Trigger condition for revisit: when desktop-app, mobile-capture, web-clipper, and a second consumer service all need to call into loom-core simultaneously and rate-limiting / fanout justify a router.
  - **What this means for the blueprint.** No edits to the blueprint document itself; the reconciliation note is the deviations register. If the deviations look durable after 6 months of operation, the blueprint gets a v0.9 update that reflects them.
- [ ] The note links back to the v0.8 alignment refactor plan (`loom-refactor-v08-plan.md`) and to the architecture-review RFC (#075, marked superseded).
- [ ] PRD (`issues/prd.md`) §6 Implementation Decisions section gets an explicit pointer to this reconciliation note.

## Notes

Why HITL: this is a documentation deliverable, not implementation. It needs human judgment on tone and on which deviations are durable vs which are temporary expediencies. Phani reads, edits, approves.

The reconciliation note is the artifact that keeps the constitution coherent. If anyone reading the blueprint says "wait, I thought cognition was a separate service?", this note is where they go to learn it isn't (yet) and why.

After this lands, the architecture-review-rfc issue (#075) gets a "superseded by v0.8 alignment" addendum referencing this note.
