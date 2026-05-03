# 036 — Arena brief: render service and Sunday cron

**Workstream:** W7
**Tag:** AFK
**Blocked by:** #035
**User stories:** US-19, US-22, US-23

## Behaviour

At 06:00 every Sunday, arena-level briefs are generated for all active arenas. An arena brief summarises the account's engagement portfolio: hypothesis state per engagement, open cross-engagement commitments and asks, account-level hypothesis state. This is the weekly strategic view, distinct from the daily tactical engagement brief.

## Acceptance criteria

- [ ] APScheduler registers `brief_arena` at 06:00 Sundays (CronTrigger with `day_of_week = sun`).
- [ ] For each active arena, the service assembles: all active engagements with their hypothesis summary, arena-level hypotheses with state, open items across all engagements, brief counts (total atoms this week, total triage resolved this week).
- [ ] The brief is written to `outbox/work/briefs/arenas/{arena_id}/{YYYY-MM-DD}.md` and `brief_runs` row created.
- [ ] `POST /v1/briefs/arenas/:id/generate` triggers on-demand generation.
- [ ] `GET /v1/briefs/arenas/:id/latest` returns path and `ran_at`.
- [ ] Template fallback works the same as engagement brief (#035) — no error when no narrative.

## Notes

Arena briefs use `arena_brief.md.j2` (defined in #033).

The `brief_arena` cron runs at 06:00 Sunday, before `state_inference` at 06:30 (so the brief reflects Friday's confirmed state, not Sunday's new inferences).

`scope_type = 'arena'` in `brief_runs`.

---

## v0.8 Alignment Addendum

**Depends on:** #035 (amended) plus the same v0.8 deps

Arena brief inherits the same v0.8 disciplines as the engagement brief amendment (#035): required audience parameter, audience-filtered atoms before LLM, leverage section, forward provenance, idempotency.

### Additional acceptance criteria

- [ ] All criteria from the #035 v0.8 addendum apply equivalently to arena briefs (substituting `scope_type='arena'`, `scope_id=arena_id`).
- [ ] Idempotency key is `brief_arena:{arena_id}:{YYYY-MM-DD}`.
- [ ] Leverage section aggregates across all engagements in the arena.
- [ ] Visibility regression test for the arena brief: a private atom in one engagement of the arena does not appear in an arena brief composed for an audience not entitled to that engagement's private content.

