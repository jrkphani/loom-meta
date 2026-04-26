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
