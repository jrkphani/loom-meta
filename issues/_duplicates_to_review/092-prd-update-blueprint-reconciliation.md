# 092 — PRD update + blueprint reconciliation note

**Workstream:** W14
**Tag:** HITL
**Blocked by:** #076 through #091 (track scope, not gating — can be drafted in parallel and finalised at end of refactor)
**User stories:** none

## Behaviour

Update the PRD and add a reconciliation note to the constitution to reflect what v1 is actually shipping after the v0.8 alignment refactor. The blueprint's polyglot service decomposition (4 services) is consciously deviated from in v1 (3 polyglot surfaces; cognition/contacts/standards as modules in loom-core). This deviation needs to be visible in the corpus or future readers will think the blueprint is current.

## Acceptance criteria

- [ ] `loom-meta/issues/prd.md` updated:
  - new workstreams W15 (v0.8 schema + visibility), W16 (cognition + provenance + retraction), W17 (resources + leverage), W18 (standards + audience).
  - W4 (triage) and W5 (state inference) cross-reference the cognition module.
  - `Non-goals` section adds: "Separate Rust router/contacts/standards services" as deferred to v2; "DuckDB analytics sidecar" as deferred; "sqlite-vec adoption" as deferred.
  - `Implementation decisions` section adds the new visibility/retention/projection columns as locked-in choices, plus the operations log discipline.
  - Goals (G1–G8) re-checked — no changes expected, but G6 (Claude integration) gets clarification: brief composition is now via cognition router, not direct Anthropic SDK.
  - The Loom-as-Life-OS framing is acknowledged: loom-core is the structural store underlying both Loom (work CRO projection) and the broader Life OS; v1 still ships only the work projection.
- [ ] `loom-meta/docs/loom-blueprint-reconciliation-v0.8.md` created with a 1–2 page reconciliation note:
  - v1 ships 3 polyglot surfaces (Swift, Python, TS), not 4.
  - Cognition / contacts / standards are modules in loom-core for v1.
  - Router service deferred. Surfaces call loom-core directly.
  - Open Question #11 (router prototype-then-port) marked "resolved: deferred to v2."
  - Reference back to the v0.8 alignment refactor plan and the relevant issues (#076 through #091).
- [ ] `loom-meta/issues/075-architecture-review-rfc.md` amended (in #075 separately): marked superseded by the v0.8 alignment plan (this body of issues IS the RFC output).
- [ ] No code changes — pure documentation.

## Notes

HITL because the constitution is human-curated; phrasing and emphasis matter. The blueprint itself stays unchanged for v1 — the reconciliation note is the bridge that records what v1 deviates and why, so future readers understand the corpus is canonical-with-an-asterisk for the v1 release.

The 1CloudHub orange (#FF7D02), the SAP/VMware/AWS context, and the Singapore / SEA market positioning don't change — they're projection-level concerns. The v0.8 alignment is the substrate beneath them.

Reference: refactor plan §13.
