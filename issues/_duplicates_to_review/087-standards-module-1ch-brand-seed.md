# 087 — Standards module + 1CloudHub brand seed + sunset policy

**Workstream:** W18
**Tag:** AFK
**Blocked by:** #076
**User stories:** US-30 (KG render), US-22 (briefs)

## Behaviour

Standards live as a module inside loom-core for v1 (extracted to its own service in v2 if rule volume justifies). Layout: `models.py`, `service.py`, `gates.py`, `seed.py`. Standards lookup walks the inheritance hierarchy (universal → role → company); later tiers override earlier on conflict. The 1CloudHub brand seed loads orange `#FF7D02`, typography, voice rules. Sunset policy: rules that haven't fired in 6 months auto-flag for review.

## Acceptance criteria

- [ ] `loom_core/standards/` module created with `models.py`, `service.py`, `gates.py`, `seed.py`, `__init__.py`.
- [ ] `Standard` and `StandardRule` SQLAlchemy models added (in #076 or as a follow-up scope-bounded migration). `StandardRule` carries `tier ('universal'|'role'|'company')`, `scope` (e.g., role name, company name), `key`, `value` (JSON), `created_at`, `last_fired_at`.
- [ ] `resolve_standards(audience_schema, role, company, as_of)` walks the hierarchy and returns `ResolvedStandards(rules: dict, origins: dict)`. `origins` maps each rule key to the tier it came from for debugging.
- [ ] `gates.py` runs active quality gates pre-dispatch (when draft composition lands: compose_draft → gates → dispatch). For v1, gates surface as draft-review items, not auto-blocks. Stub the dispatch hook.
- [ ] `seed.py` loads a seed of 1CloudHub brand rules: primary color `#FF7D02`, secondary palette, typography stack, voice rules ("evidence-based, concise, no hyperbole"), content patterns. Seed is idempotent (`INSERT OR IGNORE`).
- [ ] CLI command `loom-core seed-standards` invokes the seed function.
- [ ] `flag_stale_rules(months_inactive=6)` reads gate-firing log and returns rules with no firings in window. Surfaces as triage_items rows of new type `standard_sunset_review`.
- [ ] `last_fired_at` is updated each time a gate evaluates against a rule (whether the rule passed or failed — firing is the signal).
- [ ] Service tests cover the resolution hierarchy with fixture rules at each tier (e.g., universal "no all-caps", role "executive briefs use prose not bullets", company "primary color is FF7D02"); assert correct override semantics.

## Notes

Standards are the second-most-deferred-but-still-v1 module behind cognition. Keep the surface lean for v1 — three rule types maximum:
1. Brand (color, typography, voice)
2. Data-handling (e.g., "AWS funding figures must cite source")
3. Gate-rules for pre-dispatch

Anything more goes to v2.

The sunset policy is a discipline-enforcement mechanism, not a UI feature: stale rules silently accumulate and pollute the inheritance graph. Six months without firing means either the rule is no longer relevant or the gates aren't checking it; either way, surface for review.

Reference: refactor plan §7, blueprint §5.5.
