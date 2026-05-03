# 087 — Standards module, 1CloudHub brand seed, and sunset policy

**Workstream:** W17
**Tag:** AFK
**Blocked by:** #076
**User stories:** US-22 (briefs render with consistent style), US-26 (drafts respect brand)

## Behaviour

Standards are the rules-of-presentation that define how outputs should look and sound — colours, typography, voice, formatting conventions. Per blueprint §5.5, standards live in a three-tier inheritance hierarchy: **universal → role → company**. Lookups walk the hierarchy; later tiers override earlier on conflict. For v1, standards lives as a module inside loom-core (`loom_core/standards/`); extraction to its own service is deferred to v2.

The 1CloudHub brand is seeded at install time: orange `#FF7D02`, brand voice notes, AWS partner-program presentation conventions, and document templates. A sunset policy auto-flags rules that haven't fired in 6 months for review — improvement-service later proposes deletion or merge.

## Acceptance criteria

- [ ] `src/loom_core/standards/` module is created with: `models.py` (Standard, StandardRule SQLAlchemy classes), `service.py` (CRUD + `resolve_standards`), `gates.py` (active quality gates run pre-dispatch), `seed.py` (1CloudHub brand seed).
- [ ] An Alembic migration adds `standards` and `standard_rules` tables (schema is part of the v0.8 consolidated migration #076 — this issue verifies the tables work end-to-end).
- [ ] `resolve_standards(audience_schema, role, company, as_of)` returns a `ResolvedStandards` object with rules + tier-of-origin metadata for debugging.
- [ ] Hierarchy walk: universal → role → company. Each later tier overwrites earlier rules on the same key. Origins are recorded so debugging can answer "which tier supplied this rule?"
- [ ] `seed.py` populates: 1CloudHub brand colours (primary `#FF7D02`, neutrals), typography convention (Inter for body, sentence-case headings), voice notes ("evidence-led, plain English, no marketing prose"), AWS partner-deck presentation rules.
- [ ] A `loom_core/standards/gates.py` module runs pre-dispatch quality gates against generated content (drafts, briefs); each gate that fires logs to a gate-firing log.
- [ ] `flag_stale_rules(months_inactive=6)` returns rules that haven't fired in N months; runs as a monthly APScheduler job; flagged rules get a `flagged_for_review_at` timestamp.
- [ ] Brief composition (#035, #036, #038 amendments) calls `resolve_standards(...)` and passes the resolved standards into the cognition stage; the cognition prompt includes voice notes and formatting rules.
- [ ] Draft composition (when added in a later workstream) does the same.
- [ ] Unit tests cover: hierarchy walk overrides correctly; seed populates expected rules; stale-flag picks up rules with no firings.
- [ ] All four CI gates pass.

## Notes

Reference: `loom-meta/docs/loom-v08-alignment.md` §7.1–§7.3.

Three-tier hierarchy rationale: most standards are universal (don't write run-on sentences); some are role-specific (CRO outputs lead with the bet, not the activity); some are company-specific (1CloudHub uses orange, presents as an AWS Partner). Inheritance keeps the surface clean — you don't repeat universal rules per role.

Sunset policy is the antidote to rule rot: if a quality gate hasn't fired in 6 months, either the writing has improved past that gate or the gate was wrong. Either way, it's worth reviewing rather than letting it accumulate as cruft.

Why a module not a service: rule volume in v1 is small (~50 rules across the three tiers). Module is fine. Extract to its own service when rule volume + multi-consumer demand justifies the deployment overhead.

Brand seed lives in `seed.py` as Python literals, not in a YAML file, because the seed is part of the application identity — changes go through code review like any other behaviour change.
