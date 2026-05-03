# 087 — Standards module + 1CloudHub brand seed + sunset policy

**Workstream:** W17
**Tag:** AFK
**Blocked by:** #076
**User stories:** none (foundational — supports brief composition quality gates)

## Behaviour

For v1, standards lives as a module inside loom-core (extracted to its own service in v2 if rule volume justifies it). The module supports the inheritance hierarchy (universal → role → company), runs active quality gates pre-dispatch, and seeds 1CloudHub brand standards (colours, voice, AWS partner alignment phrasing). A sunset policy flags rules that haven't fired in N months for review by the improvement-service.

## Acceptance criteria

- [ ] `loom_core/standards/` module structure created: `models.py` (Standard, StandardRule SQLAlchemy models — schema additions if needed land in #076 or in a follow-up migration in this issue), `service.py`, `gates.py`, `seed.py`.
- [ ] Standards models support tiers: `universal`, `role`, `company`; scope per-tier (universal scope is None; role scope is e.g. `cro`; company scope is e.g. `1cloudhub`).
- [ ] `resolve_standards(audience_schema, role, company, as_of=None)` walks inheritance hierarchy; later tiers override earlier; returns `ResolvedStandards` with rules dict and rule_origins dict (which tier each rule came from).
- [ ] `gates.py::run_pregate_checks(brief_or_draft, resolved_standards)` runs active gates; returns list of violations with rule key and message.
- [ ] `seed.py::seed_1cloudhub_standards()` populates the company-tier rules: brand orange `#FF7D02`, AWS partner alignment phrasing, voice guidelines from `loom-style-guide.md`, prohibited phrasing per CRO projection.
- [ ] `seed.py::seed_universal_standards()` populates universal rules (e.g., no first-person plural without antecedent; date format ISO 8601).
- [ ] `seed.py::seed_role_standards(role='cro')` populates CRO-tier rules (e.g., always cite SOW value when discussing engagement health; always distinguish progress from confidence).
- [ ] `flag_stale_rules(months_inactive=6)` queries gate-firing log; rules with no firings in window get flagged for review (returns list, does not auto-delete).
- [ ] Brief composition (post-#035 amendment) runs gates pre-dispatch; violations attach to brief metadata; user reviews in triage.
- [ ] Unit tests: inheritance hierarchy override semantics; gate firing on fixture content; seed idempotency.
- [ ] All four CI gates pass.

## Notes

Per blueprint §5.5 and refactor plan §7, standards are the **third leg** of the brief-quality stool (the other two being atom extraction quality and audience-tailored composition). Standards encode the things that don't fit cleanly into atoms or hypotheses — voice, brand, regulatory phrasing, role conventions.

The inheritance hierarchy means a CRO-at-1CloudHub gets: universal rules (always) + CRO rules (because role=cro) + 1CloudHub rules (because company=1cloudhub). When the same key appears in multiple tiers, the most specific wins. `rule_origins` makes this debuggable.

Sunset policy is the discipline against rule rot. A rule that hasn't fired in 6 months is either fixing a problem that no longer exists (delete) or covering a case that no longer occurs (merge into a broader rule). The improvement-service consumer is out of v1 scope but the flag must be raised.

The brand seed is intentional: 1CloudHub orange `#FF7D02`, AWS partner alignment phrasing ("co-built with AWS", "AWS Premier Tier Services Partner"), and prohibited phrasing per the CRO projection (no "we leverage", no "synergies", etc. — actual list lives in `seed.py`).

Refactor plan reference: §7.1 through §7.3 of `loom-meta/docs/v08-alignment-refactor-plan.md`. Blueprint reference: §5.5.

Lives in `loom-core/src/loom_core/standards/`. Schema additions (Standards, StandardRule tables) land in #076 if not already there; otherwise sub-migration in this issue.
