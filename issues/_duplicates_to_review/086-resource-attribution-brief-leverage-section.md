# 086 — Resource attribution + brief leverage section

**Workstream:** W17
**Tag:** AFK
**Blocked by:** #085, #035
**User stories:** US-18, US-22 (extends brief content)

## Behaviour

Resources attribute to hypotheses, engagements, drafts, and sent actions via the `resource_attributions` table. Attribution runs alongside hypothesis state inference (#024–#025) — when state inference touches a hypothesis, the leverage attribution is computed and persisted. Engagement and arena briefs gain a leverage section that summarises the resource picture for the audience: time spent, people involvement, asset saturation. Audience-filtered: stakeholder-set-private resources do not surface in briefs for audiences outside the set.

## Acceptance criteria

- [ ] `loom_core/services/resource_attribution.py::attribute_to_hypothesis(hypothesis_id, resources)` computes attribution based on calendar blocks tagged to the hypothesis, mailbox threads about it, recent state changes; writes `resource_attributions` rows.
- [ ] Attribution runs from the state-inference cron (#026) in the same transaction as state-change proposals.
- [ ] `loom_core/services/resource_attribution.py::get_leverage_picture(engagement_id, audience)` returns a structured leverage summary for a brief: time totals by category, people involvement by stakeholder, asset saturation if relevant.
- [ ] `get_leverage_picture()` filters by audience: stakeholder-set-private resources visible only to the stakeholder-set members.
- [ ] Brief composition (post-#035 amendment) calls `get_leverage_picture()` and includes a `leverage_section` in the brief output.
- [ ] Brief template (W6) renders the leverage section: time spent (deep-work hours, meeting hours, travel hours), people involved (top 5 stakeholders by attention share), asset saturation (case studies cited > 3 times flagged).
- [ ] Attribution release: when a hypothesis closes, `released_at` is populated on its `resource_attributions` rows so the resource is freed.
- [ ] Unit tests: attribution computation from fixture data; audience filtering on get_leverage_picture; release semantics on hypothesis close.
- [ ] Integration test: compose a brief that includes a leverage section; assert audience filtering works.
- [ ] All four CI gates pass.

## Notes

Per blueprint §3.5, leverage attribution runs **alongside** hypothesis state inference — the two are conceptual peers (state is "where is this hypothesis going?", leverage is "what is it costing?"). The attribution computation reuses the same atom set the state inference reads.

The leverage section answers a question CRO briefs typically miss: "is this engagement disproportionately consuming my time, my team's attention, or my credibility budget with stakeholders?" — without a structured answer, this is folk wisdom.

Audience filtering on the leverage section matters because resource attribution can reveal sensitive information (e.g., that you spent 12 hours preparing for a stakeholder meeting). Stakeholder-set-private resources stay private to the set.

Asset saturation is the early-warning signal for "your best case study is overplayed." When the same case study is cited in 4+ briefs across different audiences in a 90-day window, the brief flags it for the user to consider whether a fresh asset is needed.

Refactor plan reference: §5.1 and §5.2 of `loom-meta/docs/v08-alignment-refactor-plan.md`. Blueprint reference: §3.5 and §5.7.

Lives in `loom-core/src/loom_core/services/resource_attribution.py`. Brief integration touches `loom-core/src/loom_core/services/briefs.py` (post-#035 amendment).
