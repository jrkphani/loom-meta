# Loom v0.8 alignment workstream

**Author:** Phani · **Date:** May 2026 · **Status:** Active workstream
**Scope:** loom-core structural alignment with Personal OS / Life OS blueprint v0.8

---

## What this is

A four-phase refactor that brings loom-core into structural alignment with the broader Personal OS / Life OS framing — without rewriting the foundation. Loom-core's existing 21 tables, 11 completed issues, and disciplined verification gates (ruff + mypy --strict + pytest) are sound; the v0.8 plan is materially additive.

The Personal OS / Life OS framing (refactor plan §0) demands eight capabilities that v0.7 didn't fully address: visibility-scoped facts, retention tiers, projection-at-creation context, model-version metadata on inference-derived entities, time-bounded stakeholder roles, audience profiles, forward-provenance with retraction cascade, and resource/leverage entities. All of these are additive — no destructive refactor of the existing schema.

This document is the workstream-level companion to the issue files in `loom-meta/issues/076-092*.md`. It explains what the work is, why each phase exists, and how it sequences. The detailed acceptance criteria live in the individual issues. For the code-level implementation design — migration DDL, module layouts, service patterns, and code examples — see `loom-meta/docs/loom-v08-refactor-plan.md`.

---

## Why we did this now

Loom was originally scoped as a single-domain (work) tool with the v1 PRD treating finance / content / code / health as v2+ deferrals. The Life OS repositioning brings these projections forward as architectural concerns, not just future-domain placeholders. v0.8 is the schema and capability layer that makes multi-projection coherent: every fact is visibility-scoped, every entity records the projection it was created under, every inference carries model-version metadata so the audit trail survives projection swaps.

This workstream is also the de facto output of issue #075 (architecture review RFC). Rather than wait for the W4 trigger to run `/improve-codebase-architecture`, the structural review was done deliberately as the v0.8 alignment plan, decomposed into 17 new issues plus 14 amendments to existing ones.

---

## Four phases

The work sequences through four phases. Each phase leaves the codebase shippable.

### Phase A — Schema and visibility (W15 · ~2.5 weeks)

**Issues:** #076 (schema migration), #077 (visibility filter library), #078 (read-path retrofit), #079 (visibility regression tests).

The schema migration (#076) is the single big consolidated Alembic — it's authored once, applied carefully, and unblocks everything downstream. It adds visibility scope on every state-bearing entity, retention tier, projection-at-creation, model-version metadata on inference-derived entities, the new `stakeholder_roles` table, audience profile columns on `stakeholders`, the `atom_contributions` forward-provenance index, retraction columns on atoms, and the resource/leverage entity set.

The visibility filter library (#077) provides the canonical `Audience` type and the SQL-level WHERE-clause builder. Every read path is then retrofitted (#078) to take a required `audience` parameter. Visibility regression tests (#079) become a new CI gate.

**Shippable state at end of Phase A:** existing endpoints continue to work with `Audience.for_self()` as the default audience. The visibility model is in place, ready for cognition (Phase B) to honour.

### Phase B — Cognition and retraction (W16 · ~3 weeks)

**Issues:** #080 (cognition module skeleton), #081 (adversarial input boundary tags), #082 (extraction discipline), #083 (forward-provenance writes), #084 (retraction cascade).

The empty `loom_core/llm/` directory becomes a full cognition module: router, four-tier provider stack, per-stage matrix loaded from YAML, privacy gate that downshifts cloud→local for private/stakeholder_set scopes. Adversarial input boundary tags (#081) defend against prompt injection from external content. Extraction discipline (#082) — confidence scores + source-grounding via embedding similarity — is the structural defence against hallucination. Forward provenance writes (#083) maintain the index from atom to consumer. Retraction (#084) is the cascade walk that closes the accountability loop.

**Shippable state at end of Phase B:** atoms extract with provenance and confidence; cognition routing has explicit privacy enforcement; retraction works end-to-end. Briefs not yet composed (that's Phase C / W7 amendments).

### Phase C — Resources, standards, roles (W17 + W18 · ~1.5 weeks)

**Issues:** #085 (resource entities + inference), #086 (resource attribution + brief leverage section), #087 (standards module + 1CH brand seed), #088 (stakeholder roles + audience profile, replacing #039).

Resources (time inferred from calendar density, people inferred from mailbox + meeting load) get attributed to hypotheses alongside daily state inference. Briefs gain a leverage section. The standards module lands as an in-process module (deferred extraction to its own service per refactor plan §10) with a 1CloudHub brand seed and a sunset policy that auto-flags stale rules. Stakeholders gain time-bounded roles + audience profile (replacing #039 which used the older flat-roles model).

**Shippable state at end of Phase C:** briefs include leverage; standards gates run pre-dispatch; stakeholder roles queryable as-of any date; briefs composed for stakeholders honour their audience profile.

### Phase D — Operations log and idempotency (W13 · ~3 days)

**Issues:** #089 (operations log), #090 (idempotency), #091 (routing-matrix audit).

Append-only JSONL operations log enables replay-on-startup. Idempotency-Key header on mutating endpoints prevents duplicate side effects on retry. Quarterly routing-matrix audit job catches silent drift in cognition stage assignment.

**Shippable state at end of Phase D:** v0.8 alignment complete. Loom-core is ready for the desktop-app surface (PRD W11) and the Action layer (composition + dispatch, deferred per blueprint §10).

---

## What's deferred

Per refactor plan §10, these are intentionally NOT in v0.8 scope:

- Separate Rust router service. Desktop app and loom-mcp call loom-core directly for v1.
- Separate Rust contacts service. Stakeholders stay in loom-core.
- Separate Rust standards service. Module inside loom-core for v1.
- Separate cognition Python service. Module inside loom-core for v1.
- DuckDB analytics sidecar. Phase 5+ when improvement-service generates queries that justify it.
- sqlite-vec adoption. Phase 1c+ when atom dedup and fuzzy match volume justify; for now sentence-transformers + in-memory works.
- Multi-recipient composition. Deferred Phase 3+.
- Visual cross-cutting service as separate service. Render Mermaid in vault module for v1.
- Mobile capture syncbox. Phase 6.

---

## What changed in the blueprint

The v0.8 alignment makes a deliberate deviation from the blueprint's 4-polyglot service decomposition. v1 ships as **3 polyglot services** (Swift / Python / TS) plus module-internal cognition / contacts / standards inside loom-core. Issue #092 captures this reconciliation in the blueprint and the PRD.

Blueprint Open Question #11 (router prototype-then-port) is resolved as **deferred to v2**.

---

## Pre-migration backup ritual

Before applying #076's consolidated migration to the production loom-core database:

```bash
cd /Users/jrkphani/Library/Application Support/Loom
cp loom.db loom.db.pre-v08-$(date +%s)

# Run on the copy first
cd /Users/jrkphani/Projects/loom/loom-core
DATABASE_URL=sqlite+aiosqlite:////Users/jrkphani/Library/Application\ Support/Loom/loom.db.pre-v08-test \
  uv run alembic upgrade head

# Verify
uv run python -m loom_core.cli doctor
uv run alembic check
uv run pytest -m visibility
uv run pytest

# If all pass, apply to production
DATABASE_URL=sqlite+aiosqlite:////Users/jrkphani/Library/Application\ Support/Loom/loom.db \
  uv run alembic upgrade head

# Verify production
uv run python -m loom_core.cli doctor
```

The backup file is retained for at least 30 days. Forward-only migration is the production discipline; rollback is "restore from backup" not "alembic downgrade".

---

## Verification gates

The v0.8 alignment adds two new gates to the verify recipe:

```bash
# Existing
uv run ruff check
uv run ruff format --check
uv run mypy --strict
uv run pytest -m "not external"

# New
uv run alembic check                # ORM matches migration head
uv run pytest -m visibility         # visibility regression suite (#079)
```

All six gates must pass before merge of any v0.8 alignment PR.

---

## Sequencing notes

```
W1 done → W2 (in flight) → W15 Phase A → W16 Phase B →
  ↓                          ↓                ↓
W3/W5 amended           W17/W18 Phase C → W7/W8 amended → W13 Phase D → W11 (desktop app)
```

Practically: do not start W3 atom extraction (#010–#012) until Phase A schema migration (#076) lands, because every extracted atom needs the v0.8 metadata fields or you'll be backfilling.

---

## References

- `refactor-plan.md` (the source of truth for §1–§14 detail)
- `loom-meta/issues/076-092*.md` (individual issues)
- `loom-meta/docs/loom-blueprint.md` (Personal OS blueprint v0.8)
- `loom-meta/docs/loom-system-design-v1.md` (architecture, pinned versions)
- `loom-meta/issues/prd.md` (v1 PRD; updated in #092)

---

*End of v0.8 alignment workstream summary.*
