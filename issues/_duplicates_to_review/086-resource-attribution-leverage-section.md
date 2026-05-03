# 086 — Resource attribution + brief leverage section

**Workstream:** W17
**Tag:** AFK
**Blocked by:** #085, #035
**User stories:** US-18, US-19, US-20

## Behaviour

For each hypothesis, `attribute_to_hypothesis` computes which resources are committed (calendar blocks tagged to it, mailbox threads about it, recent state-change activity) and writes `resource_attributions` rows. The attribution is computed alongside hypothesis state inference (#026 amendment). Briefs gain a "leverage" section showing time committed this fortnight, people involved, financial envelope consumed, attention cap status — turning hypothesis state from a sentiment read into an actionable resource picture.

## Acceptance criteria

- [ ] `attribute_to_hypothesis(session, hypothesis_id, resources)` writes `resource_attributions` rows with `consumer_type='hypothesis'`, `consumer_id=hypothesis_id`, `quantity`, `window_start/end`.
- [ ] Attribution heuristics (v1, refinable):
  - time → calendar blocks where the engagement or hypothesis name appears in title/description
  - people → stakeholders whose mailbox traffic in window correlates with the hypothesis (subject/body match)
  - financial → manual attribution (operator says "this resource backs hypothesis X")
- [ ] State inference cron (#026 amendment) calls `attribute_to_hypothesis` after the three dimension engines run for a hypothesis.
- [ ] `compose_engagement_brief` and `compose_arena_brief` (#035, #036 amendments) assemble a `leverage` section: time committed, people on-load, financial consumed vs envelope, attention cap status.
- [ ] Leverage section honours audience visibility — resources with `visibility_scope='private'` (e.g., attention cap, personal financial) are filtered out for non-self audiences.
- [ ] `cognition.compose_leverage_section(leverage)` produces the prose narrative around the figures (e.g., "Wave 2 has consumed 42% of the AWS funding envelope; 18 hours of deep-work time committed this fortnight, mostly on Tuesdays and Thursdays").
- [ ] When resources for the scope are empty (e.g., new engagement, no calendar history), the leverage section renders a placeholder line; brief composition continues without error.
- [ ] `released_at` on `resource_attributions` is set when an attribution is no longer current (e.g., engagement closed, calendar block past); enables historical leverage queries.
- [ ] Service test: an engagement with seeded resources and attributions composes a brief whose leverage section reflects the figures.
- [ ] Integration test: closing an engagement releases all its resource attributions (sets `released_at`).

## Notes

The leverage layer is what makes hypothesis state actionable — a hypothesis that is "in_delivery, amber, slowing" with 0 resources committed is a different problem than the same state with 80% of time and 90% of attention committed. The brief surface differentiates them.

Aggregation rule for arena briefs: sum across engagements within the arena, grouped by category. Visibility filtering applies per-resource at aggregation time (a private resource never lands in an arena-brief audience that doesn't include self).

Reference: refactor plan §5.2, blueprint §3.5, §5.7.
