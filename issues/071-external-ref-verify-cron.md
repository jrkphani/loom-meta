# 071 — External reference verification cron

**Workstream:** W13
**Tag:** AFK
**Blocked by:** #014
**User stories:** US-4

## Behaviour

At 04:00 every Monday, the `external_ref_verify` cron probes all URL-type external references for reachability. If a URL returns a 4xx or 5xx or times out, `external_references.unreachable` is set to true and `last_verified_at` is updated. `email_msgid` and `git_commit` refs are not probed (they don't have a URL to check). Unreachable refs are surfaced in `loom doctor` and in the atom provenance view.

## Acceptance criteria

- [ ] APScheduler registers `external_ref_verify` at 04:00 every Monday (CronTrigger with `day_of_week = mon`).
- [ ] Only `ref_type = 'url'` rows are probed; others are skipped.
- [ ] Each URL is fetched with a 5-second timeout using `httpx.AsyncClient`; non-200 or timeout sets `unreachable = true`, `last_verified_at = now()`.
- [ ] Successful responses set `unreachable = false`, `last_verified_at = now()`.
- [ ] URLs that were previously unreachable but now return 200 are flipped back to `unreachable = false` (resurrection detection).
- [ ] `processor_runs` row written with `pipeline` — note: `external_ref_verify` is not in the schema enum. Use `'inbox_sweep'` as a workaround or add a migration to extend the enum.
- [ ] Integration test: create 3 URL refs; mock httpx to return 200 for 2 and 404 for 1; verify `unreachable` flags are set correctly.

## Notes

The `pipeline` CHECK constraint in `processor_runs` only allows `inbox_sweep`, `migration_batch`, `state_inference`, `kg_render`, `brief_generation`. If `external_ref_verify` needs its own entry, a migration is required to extend the CHECK constraint. Alternatively, log via structlog only (no `processor_runs` row). Decide based on whether `loom doctor` needs to surface the last verify time.

Cron schedule from PRD §6.4: `external_ref_verify` weekly Monday 04:00.

Be a good HTTP citizen: add a `User-Agent: Loom/1.0` header and respect robots.txt if the URL is a web page.
