# 087 — Standards module, 1CloudHub brand seed, and sunset policy

**Workstream:** W18 (Phase C — v0.8 alignment)
**Tag:** AFK
**Blocked by:** #076
**User stories:** new (refactor plan §7, blueprint §5.5)

## Behaviour

Standards live as a module inside loom-core for v1 (deferred extraction to its own service per refactor plan §10). The module owns: a small CRUD surface for Standards and StandardRules; a hierarchy walker (`resolve_standards`) that walks universal → role → company tiers and applies later-tier overrides; pre-dispatch quality gates (`gates.py`) that run against drafts and sent actions before they leave the system; a 1CloudHub brand seed (orange `#FF7D02` etc.); and a sunset policy that auto-flags rules that haven't fired in N months for review. Sunset is the discipline that prevents "rule cruft" — a standards module that only adds rules, never prunes, becomes a tax on the system within months.

## Acceptance criteria

- [ ] Module layout per refactor plan §7.1:
  - `loom_core/standards/__init__.py`
  - `loom_core/standards/models.py` — `Standard`, `StandardRule` SQLAlchemy models (small migration adds the two tables)
  - `loom_core/standards/service.py` — CRUD + `resolve_standards(audience_schema, role, company, as_of)` lookup
  - `loom_core/standards/gates.py` — `run_gates(rules, draft)` returns pass/fail with rule-level diagnostics
  - `loom_core/standards/seed.py` — 1CloudHub seed: brand colours (`primary: #FF7D02`, etc.), tone notes, common email closings
- [ ] An Alembic migration adds `standards` and `standard_rules` tables (small; not part of #076).
- [ ] `resolve_standards` walks universal → role → company; later tiers override earlier on rule key conflicts; returns `ResolvedStandards(rules, origins)` so the origin tier of every rule is debuggable.
- [ ] `run_gates(rules, draft)` runs every active rule against a draft; returns a list of `(rule, status, details)` tuples. At least three gate types implemented: regex content match, banned phrases, required salutation.
- [ ] 1CloudHub seed in `seed.py` is loaded at first run (idempotent); covers brand colours, mandatory closing for partner emails, banned-phrases list (placeholder), tone notes per audience type.
- [ ] An APScheduler job runs monthly: `flag_stale_rules(months_inactive=6)` reads gate-firing logs and flags rules with no firings in 6 months for human review (writes to triage queue with `item_type = 'rule_review'`).
- [ ] Each gate firing logs to `gate_firings` (small new table or JSONL log) with `rule_id`, `fired_at`, `fired_against` (draft/sent/etc.), `status`. This is the data feeding the sunset job.
- [ ] Standards lookup is cached per `(audience_schema, role, company)` for the lifetime of a request to avoid redundant tier walks.
- [ ] Service tests cover: hierarchy walk + override; sunset flagging; gate firing; 1CH seed loaded.

## Notes

Reference patterns in refactor plan §7.

**Why a module rather than a service in v1**: per refactor plan §10, the rule volume isn't yet large enough to justify a separate service. Standards lookup happens in the same process as the brief composition that consumes it; an HTTP boundary would just add latency. Promote to a service in v2 if rule count crosses a threshold (rough trigger: >200 active rules across all tiers, or noticeable per-request latency from standards lookup).

**Why sunset matters**: standards systems either decay (rules accumulate, none retire, the system becomes a tax) or stay healthy (rules retire on signal). The sunset policy is the structural defence. 6 months is a default — adjustable per-rule via a `sunset_months` column.

**Pre-dispatch gates**: the gates run on every draft and sent_action just before they leave loom-core. A failing gate blocks dispatch and surfaces the failure in the triage queue with the specific rule and remediation guidance.

**Brand seed scope**: minimal in v1. Just enough to enforce 1CloudHub identity in outbound communications (correct orange in any rendered visual; correct closing on partner emails). Visual identity rules are mostly applied in templates (not as gates) — gates focus on text-level rules.

**No HITL flag for the seed**: the seed is text in `seed.py` reviewed at code review time. No runtime HITL needed.

**The standards module does not gate inbound content** — only outbound (drafts/sent_actions). Inbound goes through the cognition module's adversarial-input handling (#081).
