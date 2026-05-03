# 080 — Cognition module skeleton (router, providers, stages)

**Workstream:** W16
**Tag:** AFK
**Blocked by:** #076
**User stories:** US-1, US-2, US-15, US-20, US-25 (every LLM-touching surface)

## Behaviour

The currently-empty `src/loom_core/llm/` directory becomes the cognition module: a single Python package (not a separate service) that owns every LLM-bearing operation in loom-core. It exposes a router (`CognitionRouter`) that picks a provider per stage based on a config-as-code routing matrix (YAML), enforces the privacy gate (private/stakeholder_set never leaves device), and tracks cost via a meter. Providers (`python_rules`, `embeddings`, `apple_fm`, `claude_api`) implement a common `ProviderAdapter` Protocol. Stages (atom extraction, identity match, state inference, brief composition, draft composition, override pattern detection) are typed enums.

For v1 the module lives inside loom-core; the blueprint-suggested separate cognition service is deferred to v2. The module is structured so that future extraction is mechanical.

## Acceptance criteria

- [ ] `src/loom_core/llm/` is laid out per the spec:
  - `router.py` — `CognitionRouter`, `RoutingPolicy`, `Provider` and `Stage` enums.
  - `providers/base.py` — `ProviderAdapter` Protocol.
  - `providers/python_rules.py`, `providers/claude_api.py` (Tier 1 + Tier 4 implementations).
  - `providers/apple_fm.py`, `providers/embeddings.py` (stubs that raise `NotImplementedError`; full impls land in #067/#068 and a later embeddings issue).
  - `stages/` package with one module per stage cluster (atom_extraction, identity_match, state_inference, brief_compose, draft_compose, overrides).
  - `cost_meter.py` — minimal counter incremented per call (per-stage, per-provider).
- [ ] A YAML routing policy file lives at `skills/routing-policy.yaml` and is loaded via `RoutingPolicy.from_yaml(...)` at app startup.
- [ ] `RoutingPolicy.matrix` covers every `Stage` enum value with a default `Provider`.
- [ ] `RoutingPolicy.private_blocked_providers` defaults to `{Provider.CLAUDE_API}`.
- [ ] `CognitionRouter.call_stage(stage, payload, visibility_scope)` enforces the privacy gate: when `visibility_scope in {'private', 'stakeholder_set'}` and the matched provider is in `private_blocked_providers`, the router downshifts to `apple_fm` (or raises `LocalOnlyUnavailableError` if apple_fm is also unavailable — never silently downshifts to claude_api).
- [ ] `Provider.PYTHON_RULES` adapter is fully wired so atoms can be extracted today via the rules tier without depending on apple_fm.
- [ ] `Provider.CLAUDE_API` adapter wraps `anthropic.AsyncAnthropic` with the existing `ANTHROPIC_API_KEY` env var; mockable at the SDK boundary in tests.
- [ ] Unit tests in `tests/llm/test_router.py` cover: stage routes to configured provider; private-scope downshift to apple_fm; private-scope when apple_fm unavailable raises `LocalOnlyUnavailableError`; matrix loaded from YAML matches expectations.
- [ ] All four CI gates pass.

## Notes

Reference design: `loom-meta/docs/loom-v08-alignment.md` §3.1–§3.2. Treat that as the spec.

Stage enum (initial): `ATOM_EXTRACTION_STRUCTURED`, `ATOM_EXTRACTION_PROSE`, `ATOM_DEDUP`, `IDENTITY_MATCH_EXACT`, `IDENTITY_MATCH_FUZZY`, `DISAMBIGUATION_SIMPLE`, `DISAMBIGUATION_COMPLEX`, `HYPOTHESIS_PROGRESS`, `HYPOTHESIS_CONFIDENCE`, `HYPOTHESIS_MOMENTUM`, `TONE_SHIFT_DETECTION`, `HUNCH_NARRATION`, `TACTICAL_BRIEF`, `SECTION_SUMMARIES`, `EXECUTIVE_NARRATIVE`, `TACTICAL_DRAFT`, `STRATEGIC_DRAFT`, `OVERRIDE_PATTERN_DETECTION`, `SKILL_REVISION`.

Provider enum: `PYTHON_RULES`, `EMBEDDINGS`, `APPLE_FM`, `CLAUDE_API`.

Cost meter is intentionally minimal in v1: an in-memory counter per (stage, provider) tuple, exposed via `GET /v1/health/cognition`. Full budget tracking + drift alarms are §13.7 work and can ship later.

Privacy gate is the hard rule. `LocalOnlyUnavailableError` exists so the caller can fail loudly rather than silently leak. Existing tier-3 issues (#011, #024, #025) reference this behaviour in their amendments.

After this lands, every issue that previously called `loom_core.llm.claude` or `loom_core.llm.apple_ai` directly migrates to `CognitionRouter.call_stage(...)`. The migration is mostly mechanical because the existing addendum work has already noted the change.
