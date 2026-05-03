# 085 — Resource entities and time/people inference

**Workstream:** W17 (Phase C — v0.8 alignment)
**Tag:** AFK
**Blocked by:** #076, #080
**User stories:** new (refactor plan §5.1, blueprint §4 Resources)

## Behaviour

The `resources` table (added in #076) becomes useful: an inference engine populates time and people resource rows from existing signal where available. Time resources are inferred from msgvault-comms calendar density: each day's calendar is classified into deep-work blocks, meeting blocks, and travel blocks, then aggregated into typed Resource rows with `quantity` (hours), `quantity_unit = 'hours'`, and `quality_dimensions` (continuity, focus_score). People resources are inferred from mailbox traffic + meeting load: per-stakeholder time spent (proxy via meeting attendee count × duration + email thread depth). Manual entry is the fallback, not the default — `inferred_from` records the signal source. Financial, attention, credibility, knowledge_asset, and tooling_asset resources are scaffolded but inference for them is deferred to v2.

## Acceptance criteria

- [ ] `loom_core/llm/stages/leverage_inference.py` defines `infer_time_resources(session, *, window_start, window_end)` and `infer_people_resources(session, *, window_start, window_end)`.
- [ ] Time inference reads calendar from msgvault-comms (HTTP call; stub-returns empty list if msgvault HTTP isn't available — caller logs a "calendar source unavailable" warning).
- [ ] Each calendar block is classified into one of `deep_work | meeting | travel | other` based on duration + attendee count + location heuristics (initial heuristics in code; tunable).
- [ ] Per-day aggregates produce one or more Resource rows with `category = 'time'`, `quantity` in hours, `quality_dimensions = {'continuity': float, 'focus_score': float}`, `window_start`/`window_end` set to the inference window, `inferred_from = 'calendar_density'`.
- [ ] People inference produces one Resource per active stakeholder per window, with `category = 'people'`, `quantity` in hours (estimated time the stakeholder spends on this user's domain), `quality_dimensions = {'response_rate': float, 'meeting_acceptance_rate': float}`, `inferred_from = 'mailbox_traffic'`.
- [ ] Resource rows include `visibility_scope` set per blueprint §6.4: time defaults to `private` (calendar density is sensitive), people defaults to `engagement_scoped` (visible to anyone in the engagement).
- [ ] An APScheduler job runs the inference weekly (Sunday 04:00, before the Sunday brief at 06:00) and writes Resource rows.
- [ ] Service tests with fixture calendar/mailbox data assert correct classification + aggregation.
- [ ] Categories `financial`, `attention`, `credibility`, `knowledge_asset`, `tooling_asset` are documented as deferred-to-v2 in the module docstring; manual API endpoints to seed them exist but inference does not.

## Notes

Reference inference patterns in refactor plan §5.1.

**Why calendar density rather than self-report for time**: self-report decays. Calendar density is observable, automatically synced via msgvault-comms, and reflects actual time allocation. The classification heuristics will be wrong sometimes (a "meeting" titled "deep work" is still a meeting), but the signal-to-noise is much better than asking "where did your time go this week".

**Why inferred-first discipline**: per blueprint §4 Resources, manual entry of resources creates two failure modes — staleness (data ages without anyone updating it) and bias (you over-attribute to high-status efforts). Inferring from existing signal sidesteps both. Where inference isn't reliable yet (financial, credibility), the system is honest about the gap: `inferred_from = 'manual'` is allowed but flagged in audits.

**Privacy gate interaction**: time and people resources are visibility-tagged at creation. The brief leverage section (#086) honours these tags: an external-audience brief shows a redacted leverage view (just totals, not per-stakeholder breakdowns).

**Cron timing**: weekly Sunday 04:00 because the data sources (calendar, mailbox) are settled by then for the week prior. The brief generation cron at 06:00 on Sunday picks up the fresh resource state.

**msgvault-comms dependency**: time inference needs the calendar HTTP endpoint exposed by msgvault. If that surface isn't ready when this issue ships, the time inference stage degrades to a manual API endpoint and a banner in the UI ("calendar source not connected").
