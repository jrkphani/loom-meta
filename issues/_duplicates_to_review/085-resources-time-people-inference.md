# 085 — Resources entities: time + people inference (financial deferred)

**Workstream:** W17
**Tag:** AFK
**Blocked by:** #076
**User stories:** none (foundational — unblocks brief leverage section in #086)

## Behaviour

The Leverage layer (blueprint §5.7) lands as inference-first. Time resources are inferred from calendar density (read via msgvault-comms calendar archive). People resources are inferred from mailbox traffic plus meeting load. Financial, attention, credibility, knowledge_asset, and tooling_asset resources are deferred or seeded manually. Each inferred resource gets a row in the `resources` table with `inferred_from` populated for traceability.

## Acceptance criteria

- [ ] `loom_core/services/resources.py` exposes CRUD for the `resources` table (already created in #076).
- [ ] `loom_core/llm/stages/leverage_inference.py::infer_time_resources(window_start, window_end)` reads calendar blocks from the msgvault-comms calendar endpoint, classifies each by length / attendee count / location into time-resource buckets (deep-work, meeting, travel), and returns Resource candidates per day per category.
- [ ] `infer_time_resources()` populates `inferred_from = 'calendar_density'`.
- [ ] `infer_people_resources(window_start, window_end)` reads mailbox traffic counts and meeting load per stakeholder, returns Resource candidates with `category = 'people'` and `inferred_from = 'mailbox_traffic'` or `'response_patterns'`.
- [ ] Inference runs as a scheduled job (daily 04:00, sized after `kg_reconcile`); job named `leverage_inference` in `processor_runs`.
- [ ] Manual entry endpoint: `POST /v1/resources` allows manual creation for categories not yet inferred (financial, attention, knowledge_asset, tooling_asset); `inferred_from = 'manual'`.
- [ ] `GET /v1/resources?category=time&domain=work&window_start=...` lists resources scoped to a window.
- [ ] Resources respect visibility: default `private` until attached to an engagement (then upgrade to `engagement_scoped`).
- [ ] Unit tests: time inference from calendar fixture; people inference from mailbox fixture; manual entry round-trip.
- [ ] All four CI gates pass.

## Notes

Per blueprint §5.7, resources are **inferred from existing signal where possible**. Manual entry is the fallback, not the default. The discipline matters: a CRO who has to maintain a resource ledger by hand will stop maintaining it.

Time inference reads the calendar archive that msgvault-comms maintains. The dependency on msgvault-comms means this issue can stretch (Apple FM HTTP API stability is a Phase B risk per refactor plan §14); if msgvault-comms is not yet exposing calendar over HTTP, fall back to manual seed for time resources too.

Financial resources (expense reports + budget envelopes) are deferred to Phase 5 measurement. Attention resources are explicitly manual — Phani sets the cap. Credibility resources (response rates, meeting acceptance per stakeholder) are deferred to Phase 5.

Knowledge_asset and tooling_asset resources track saturation (which case study cited where, which template instantiated where). The `asset_uses` table from #076 supports this; populated as briefs and drafts cite assets in W16/W17 cycles.

Window semantics: time and people resources have explicit `window_start` / `window_end` (the period the resource was available). Financial resources have `expiry_at`. Knowledge/tooling assets are open-ended (no window).

Refactor plan reference: §1.8 (schema) and §5.1 (inference) of `loom-meta/docs/v08-alignment-refactor-plan.md`. Blueprint reference: §5.7.

Lives in `loom-core/src/loom_core/services/resources.py`, `loom-core/src/loom_core/llm/stages/leverage_inference.py`, `loom-core/src/loom_core/pipelines/leverage_inference_cron.py`.
