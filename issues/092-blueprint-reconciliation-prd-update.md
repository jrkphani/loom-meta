# 092 — Blueprint reconciliation note + PRD update

**Workstream:** W14
**Tag:** HITL
**Blocked by:** #076
**User stories:** none (documentation alignment)

## Behaviour

The v0.8 alignment refactor consciously deviates from the original Personal OS blueprint's service decomposition. v1 ships as **single Python service (loom-core) + msgvault Swift services + desktop/mobile Swift apps + web-clipper TS extension** — polyglot count of 3 (Swift, Python, TS), not 4. Cognition, contacts, and standards live as **modules inside loom-core** for v1; extracted to separate services in v2 if rule volume / extraction load justify it. This issue produces the reconciliation document so the constitution stays coherent with what we're building, and amends the PRD to reflect W15–W18.

## Acceptance criteria

- [ ] `loom-meta/docs/v08-alignment-refactor-plan.md` exists with the full text of the refactor plan (the document this work was scoped from).
- [ ] `loom-meta/docs/v08-blueprint-reconciliation.md` exists with: (a) the architectural deviations from the blueprint and rationale for each; (b) the explicit list of items deferred to v2 (separate Rust router, separate Rust contacts, separate Rust standards, separate cognition Python service, DuckDB analytics, sqlite-vec, multi-recipient composition, visual cross-cutting service, mobile capture syncbox); (c) the resolution of blueprint Open Question #11 (router prototype-then-port → resolved: deferred to v2).
- [ ] `loom-meta/issues/prd.md` amended: add §7 entries for W15 (v0.8 schema + visibility), W16 (cognition + accountability), W17 (resources + standards + roles), W18 (operations rigor).
- [ ] PRD §6.1 (Stack) amended to note: cognition, standards, and contacts are modules inside loom-core for v1, not separate services.
- [ ] PRD §10.3 (Verification gates) amended to add: visibility regression tests (`pytest -m visibility`), `alembic check`, operations log shape validation.
- [ ] PRD §12 (Risks) amended to add: R11 — cognition module growth pressure (if prompt iteration volume is high, the in-process module may slow API responses; mitigation is the v2 extraction path); R12 — Apple FM HTTP API stability dependency (W16 Tier 3 work depends on msgvault-comms exposing FM over HTTP).
- [ ] `loom-core/README.md` "Architecture invariants" section amended to reference the v0.8 alignment plan.
- [ ] Issue #075 (architecture review RFC) amended to mark as superseded by W15–W18 (the v0.8 alignment IS the architecture review, executed early).
- [ ] All linkable references in the new docs use relative paths so the constitution remains self-contained.

## Notes

HITL because the output is a reconciliation document and a PRD amendment — both require human read for tone, framing, and consistency with the constitution.

The reconciliation document should be short (1–2 pages). It exists to answer the question "why is this not what the blueprint says?" — and the answer is "because v1 is sized for one user on one machine, and the polyglot decomposition adds operational complexity that doesn't pay back at this scale."

The PRD update is the operative change for the issue queue: W15–W18 become first-class workstreams alongside W1–W14, with their own issue clusters, dependencies, and verification gates.

The reconciliation note is the right place to acknowledge that Loom is being repositioned under Life OS (Personal OS). The relationship: Life OS is the conceptual frame; loom-core is the structured-state substrate; msgvault is the comms substrate; future services (cognition extraction, standards extraction, contacts extraction) bind in as v2 lands.

Refactor plan reference: §13 of `loom-meta/docs/v08-alignment-refactor-plan.md` ("What to revise in the blueprint").

Lives in `loom-meta/docs/v08-alignment-refactor-plan.md`, `loom-meta/docs/v08-blueprint-reconciliation.md`, `loom-meta/issues/prd.md`, `loom-core/README.md`.
