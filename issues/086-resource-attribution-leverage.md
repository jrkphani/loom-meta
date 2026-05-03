# 086 — Resource attribution and brief leverage section

**Workstream:** W17 (Phase C — v0.8 alignment)
**Tag:** AFK
**Blocked by:** #085, #035, #036
**User stories:** US-18, US-19, US-22; refactor plan §5.1, §5.2

## Behaviour

Resources get attributed to hypotheses, engagements, drafts, and sent actions via `resource_attributions`. Attribution runs alongside hypothesis state inference (§3.5): when state inference processes a hypothesis, it computes which calendar blocks were tagged to it (via attendee match + subject heuristics), which mailbox threads concerned it, and which recent state changes touched it. These contributions become `resource_attributions` rows. Brief composition (engagement + arena) then renders a **leverage section** showing where time, people, attention, and credibility are flowing — a reader can see at a glance whether the hypothesis is actually getting the resources its progress demands.

## Acceptance criteria

- [ ] `loom_core/llm/stages/leverage_inference.py` defines `attribute_to_hypothesis(session, *, hypothesis_id, resources)` returning the new `ResourceAttribution` rows written.
- [ ] Attribution runs as a stage in the daily `state_inference` cron (#026), after state-change proposals are generated for a hypothesis.
- [ ] Time attribution uses calendar block tag-match (block subject contains hypothesis title keywords or arena name) plus attendee overlap with stakeholders linked to the hypothesis.
- [ ] People attribution uses stakeholder roles scoped to the hypothesis/engagement/arena (#088) — current sponsors/blockers/advocates get attributed time proportional to their meeting + mailbox load.
- [ ] `resource_attributions.released_at` is set to NULL when first written; an `end_attribution(attribution_id, released_at)` service method allows ending an attribution (e.g., when a stakeholder rolls off).
- [ ] Brief composition (#035 engagement, #036 arena) calls `get_leverage_picture(session, scope_id, audience)` which returns the attributed resources filtered by audience.
- [ ] The brief context dict gains a `leverage` key with: total time attributed (hours), top 3 stakeholders by time, attention budget remaining (placeholder; full attention inference is v2), credibility signals (placeholder).
- [ ] The brief template renders a "## Leverage" section that surfaces this data; for stakeholder-set-private resources, the section shows aggregates only (no per-stakeholder breakdown).
- [ ] Decision aids in the brief (e.g., "this hypothesis is at 'amber' confidence but received 0 hours of sponsor time this week") are computed from the leverage data.
- [ ] Service tests verify: attribution writes correct rows; brief renders leverage section with correct totals; private resources are aggregated for non-self audiences.

## Notes

Reference patterns in refactor plan §5.2.

**Why attribute at state-inference time rather than continuously**: state inference already touches every hypothesis daily and reads its atom set. Attribution piggybacks on that read, avoiding a second per-hypothesis pass. Plus the cadence aligns: attribution and state inference both reflect the past 24 hours.

**Why brief surface rather than a separate dashboard**: the brief is where the human consumes the synthesis. Leverage data without a decision aid is wallpaper; embedded in a brief alongside hypothesis state and recent atoms, it becomes actionable.

**Audience-filtered leverage**: per blueprint §6.4, an external-audience brief (e.g., a brief shared with an AWS partner) shows aggregate leverage but not per-stakeholder breakdowns. The `get_leverage_picture` function takes an audience parameter and aggregates accordingly.

**Decision-aid logic**: starts simple — flag mismatches (high-priority hypothesis, low resource attribution) and surface them in the brief. Sophistication can grow later. Don't over-engineer the v1 decision aids.

**Hypothesis is the canonical attribution target in v1.** Engagement/arena attributions are aggregated from their hypotheses. Drafts and sent_actions get attribution hooks (matching §83's forward provenance hooks) but those surfaces don't ship in v1.
