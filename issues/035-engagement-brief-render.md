# 035 — Engagement brief: render service and weekday cron

**Workstream:** W7
**Tag:** AFK
**Blocked by:** #033, #005, #017
**User stories:** US-18, US-20, US-22, US-23

## Behaviour

At 07:00 every weekday, engagement briefs are generated for all active engagements. The brief service assembles the context dict (hypothesis states, open commitments/asks/risks, recent atoms, triage counts) and renders it through the engagement brief template. The rendered brief is written to `outbox/work/briefs/engagements/{engagement_id}/{YYYY-MM-DD}.md` and logged in `brief_runs`. Phani can also trigger a brief generation on-demand via the API.

## Acceptance criteria

- [ ] APScheduler registers `brief_engagement` at 07:00 weekdays (CronTrigger with `day_of_week = mon-fri`).
- [ ] For each active engagement, the service assembles: all non-closed hypotheses with current state + inferred flags, open commitments/asks/risks grouped by hypothesis, last 5 attached atoms per hypothesis, pending triage item count.
- [ ] The brief is written to the vault at the correct path and the `brief_runs` row is created with success = true.
- [ ] `POST /v1/briefs/engagements/:id/generate` triggers on-demand generation; returns the brief path.
- [ ] `GET /v1/briefs/engagements/:id/latest` returns the path and `ran_at` of the most recent brief.
- [ ] When the LLM narrative is unavailable, the brief renders with template-only content and no error (template fallback, per US-23).
- [ ] A single-engagement service test uses a temp vault dir and asserts the file is written correctly.

## Notes

Schema: `brief_runs` (lines ~510–522 in `loom-schema-v1.sql`). `scope_type = 'engagement'`, `scope_id = engagement_id`.

The brief narrative (Claude-generated executive summary) is added by #038; this issue renders the template-only version. The two are additive: #038 adds the narrative section to the context dict.

Route: `POST /v1/briefs/engagements/:id/generate`, `GET /v1/briefs/engagements/:id/latest`.

---

## v0.8 Alignment Addendum

**Depends on:** #076 (schema), #077 (Audience), #078 (read-path retrofit), #079 (visibility regression), #083 (forward provenance), #086 (leverage section), #039 (audience profile)

The engagement brief render under v0.8 takes a required `audience: Audience` parameter and **filters atoms before they reach the LLM**. This is the structural defence against private content leaking into briefs composed for external audiences. Briefs also gain a leverage section (#086) and stakeholder-tailored composition via audience profile (#039).

### Additional acceptance criteria

- [ ] `compose_brief()` signature gains a required `audience: Audience` parameter; callers cannot pass None.
- [ ] Atoms loaded for the brief are filtered via `list_atoms_for_engagement(session, engagement_id, audience=audience)` — visibility filtering at SQL level. Cognition never sees content the audience shouldn't see.
- [ ] When the caller is `compose_brief_for_stakeholder` (#039), the audience profile (`audience_schema`, `preferred_depth`, `tone_notes`) drives template selection and the cognition prompt.
- [ ] Brief context dict gains a `leverage` key with attributed resources for the engagement (#086); rendered as a "## Leverage" section in the template.
- [ ] Every atom included in the brief context triggers `record_contribution(consumer_type='brief_run', consumer_id=brief.id)` (#083).
- [ ] `brief_runs` row populates `composer_skill_version` and `provider_chain` (the chain of cognition stages used).
- [ ] When the cron generates a brief and the brief already exists for today (idempotent), the existing brief is returned via the Idempotency-Key cache (#090) keyed on `brief_engagement:{engagement_id}:{YYYY-MM-DD}`.
- [ ] Visibility regression tests (#079) include a test asserting that a private atom never appears in a brief composed for an engagement audience that doesn't include the private-marked stakeholders.

