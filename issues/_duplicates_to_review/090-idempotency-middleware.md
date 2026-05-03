# 090 — Idempotency-Key middleware and cache

**Workstream:** W18
**Tag:** AFK
**Blocked by:** #089
**User stories:** US-1 (capture retries don't duplicate atoms), US-3 (sniffer retries safe)

## Behaviour

Mutating API endpoints accept an optional `Idempotency-Key` HTTP header. When present, the endpoint checks a cache: if the same key has already produced a response within the retention window, the cached response is returned without re-executing the operation. When absent, the endpoint executes normally (idempotency is opt-in per request).

The pattern matters most for inbox-sweep cron retries and atom-extraction retries — both can be re-attempted after partial failure without producing duplicate atoms or duplicate triage items.

## Acceptance criteria

- [ ] `loom_core/api/_deps.py` adds `get_idempotency_key` dependency that reads the `Idempotency-Key` header (case-insensitive per HTTP spec) and returns `str | None`.
- [ ] `loom_core/api/_idempotency_cache.py` (or equivalent) implements an idempotency cache backed by SQLite: schema `(key TEXT PK, response_json TEXT, status_code INT, created_at TIMESTAMP)`. TTL: 24 hours. Eviction: lazy on read.
- [ ] All mutating endpoints (POST/PUT/PATCH/DELETE) accept the dependency and consult the cache: if hit, return cached response with original status code; if miss, execute, then store response before returning.
- [ ] Cache key includes both the user-supplied `Idempotency-Key` and the route path, so two different endpoints can use the same key without collision.
- [ ] Cron jobs that produce atoms or briefs use a deterministic key per run: `inbox_sweep:YYYY-MM-DD-HH-MM`, `brief_engagement:{engagement_id}:{YYYY-MM-DD}`, `state_inference:YYYY-MM-DD`, etc. (Existing #026, #035, #036 v0.8 addendums already reference this.)
- [ ] On retry of a cron run that completed successfully, the idempotency check short-circuits and no duplicate side effects are produced (no extra `atom_contributions` rows, no extra `brief_runs` rows, no extra triage items).
- [ ] An integration test posts the same event creation twice with the same `Idempotency-Key`; asserts only one event row exists and both responses are identical.
- [ ] An integration test simulates a brief-generation cron retry: first run completes and writes brief; second run with same key reads from cache and produces no new file write.
- [ ] All four CI gates pass.

## Notes

Reference: `loom-meta/docs/loom-refactor-v08-plan.md` §8.2.

Why SQLite for the cache rather than in-memory: a launchd-restart between the two retries would otherwise lose the cache, defeating the purpose. SQLite-backed survives restarts. The cost is one extra read+write per mutating request, which is negligible at v1 volumes (~50–100 mutating requests per day at the high end).

24-hour TTL is generous: the only legitimate use of an idempotency key beyond 24h would be a multi-day debugging scenario, in which case the duplicate cost is minor.

The `Idempotency-Key` header is opt-in per request: most clients (including the SwiftUI Loom UI in W11 and Claude Desktop via MCP) won't set it. Cron jobs and the inbox sweep set it because they are the paths most prone to retry-after-partial-failure.

After this lands, the cron jobs in W3, W5, W7 are safe to retry on launchd restart, and the operational stability promise (G8 in PRD §3) is structurally backed.
