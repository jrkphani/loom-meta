# 086 — Resource attribution and brief leverage section

**Workstream:** W17
**Tag:** AFK
**Blocked by:** #076, #085, #035
**User stories:** US-20, US-22 (briefs include leverage picture)

## Behaviour

Resources are *attributed* to consumers (hypotheses, engagements, drafts, sent actions): a row in `resource_attributions` links a quantity of a resource to the entity it's spent on, over a time window. Attribution runs alongside hypothesis state inference (#026 amendment) — the same daily pass that updates state also computes "what time/people/budget moved this hypothesis this week."

Brief composition (#035, #036 amendments) adds a **leverage section**: a structured view of the resource picture for the engagement or arena. The leverage section answers "is this hypothesis well-resourced or starving?" — the sister question to "is this hypothesis green or amber?"

## Acceptance criteria

- [ ] `loom_core/services/resource_attributions.py` is created with `attribute_to_hypothesis(session, hypothesis_id, resources)` as the public function.
- [ ] Attribution writes one `resource_attributions` row per `(resource_id, consumer_type='hypothesis', consumer_id=hypothesis_id, window_start, window_end, quantity)` tuple.
- [ ] Attribution uses signal: calendar blocks tagged to an engagement → time resource attributed to the engagement's hypotheses; mailbox threads about an engagement → people resource attributed; recent state changes → attention attributed.
- [ ] Released attributions (when a window ends) get `released_at = now()` rather than being deleted (preserves history).
- [ ] `GET /v1/hypotheses/:id/leverage` returns the resource picture for the hypothesis: list of active resources attributed, with quantity, quality dimensions, and saturation note.
- [ ] `GET /v1/engagements/:id/leverage` aggregates across the engagement's hypotheses.
- [ ] Brief composition (#035 amendment) calls `get_leverage_picture(session, engagement_id, audience)` and includes the result in the brief context dict.
- [ ] The brief template renders a leverage section with: time spent this week (deep-work hours, meeting hours), people involved (with response-rate quality dimension), recent attention (state-change density), and any expiring resources flagged.
- [ ] Unit tests cover: attribution from calendar block to hypothesis works; aggregation across hypotheses produces correct totals; leverage section renders even when no resources are attributed (empty state).
- [ ] An integration test composes an engagement brief and asserts the leverage section contains the expected resource categories.
- [ ] All four CI gates pass.

## Notes

Reference: `loom-meta/docs/loom-v08-alignment.md` §5.1–§5.2.

Attribution is *interpretive* in the same way that confidence is: we estimate that a calendar block was spent on a particular hypothesis based on tag, attendee, and topic signal. This is a hunch, not a fact. The brief should display attributions as "estimated," not "logged."

The leverage section's job is to answer questions like: "Wave 2 confidence is amber, but is that because the work is hard or because nobody has time to focus on it?" If the leverage picture shows 2 deep-work hours/week on a hypothesis, that's an explanation — and a different intervention than "the work is hard."

Knowledge-asset and tooling-asset saturation tracking via the `asset_uses` table is deferred to a later phase (when sufficient case studies exist that "the same case study has been used 14 times this quarter" becomes actionable).

After this lands, briefs at engagement and arena level carry the leverage picture by default. The audience filter applies — a brief composed for an external stakeholder excludes resources marked private (e.g., financial budget envelopes).
