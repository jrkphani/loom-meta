# 090 — Idempotency-Key middleware + cache

**Workstream:** W18
**Tag:** AFK
**Blocked by:** #089
**User stories:** none (foundational hardening)

## Behaviour

Mutating API endpoints accept an `Idempotency-Key` header. When provided, the response is cached per key for 24 hours; replays of the same key return the cached response without re-executing the operation. The cache is in-process (LRU with TTL) for v1; promote to a SQLite-backed table if process restarts become a problem. This makes the inbox-sweep cron, atom-extraction pipeline, and any HTTP retry safely idempotent.

## Acceptance criteria

- [ ] `loom_core/api/_deps.py::get_idempotency_key()` dependency reads the `Idempotency-Key` header and returns it (or None).
- [ ] `loom_core/observability/idempotency_cache.py` exposes `get(key)`, `put(key, response)` async functions backed by an LRU cache with 24-hour TTL.
- [ ] Cache size cap: 10,000 entries (configurable); eviction is LRU.
- [ ] Mutating endpoints (POST, PUT, PATCH, DELETE) on resources where retry is plausible — events, atoms (attach/dismiss), hypotheses (state proposals), retractions, brief generation — accept the dependency and check/populate the cache.
- [ ] On cache hit: return the cached response with `X-Idempotency-Replay: true` header.
- [ ] On cache miss: execute, then `put()` before returning.
- [ ] Cache key is the `Idempotency-Key` header value; no namespacing by endpoint (the header is treated as globally unique per the standard pattern).
- [ ] Same idempotency key used with different request body content returns 422 (`UNPROCESSABLE_ENTITY`) with `INVALID_IDEMPOTENCY_KEY_REUSE`.
- [ ] Inbox-sweep cron generates idempotency keys per item (e.g., a hash of the source path + mtime) and passes them to event-creation calls.
- [ ] Atom-extraction pipeline generates idempotency keys per (event_id, extractor_provider, skill_version) tuple.
- [ ] Unit tests: cache round-trip; TTL expiry; LRU eviction; key reuse with different body returns 422.
- [ ] Integration test: POST event with idempotency key twice; assert second call returns cached response and DB has only one event row.
- [ ] All four CI gates pass.

## Notes

Per refactor plan §8.2 and blueprint §2 ("operations are idempotent and replayable"), this matters most for the inbox-sweep cron and atom-extraction pipeline — both can be retried after partial failure without producing duplicate atoms.

The standard pattern uses the `Idempotency-Key` header (Stripe, GitHub follow this). v1 uses an in-process LRU; if the daemon restarts mid-window, in-flight idempotency is lost — acceptable for v1 because the worst case is one duplicate operation, and the retraction surface (#084) catches anything bad downstream.

The "different body, same key" detection is a SHA-256 hash of canonicalised request body, stored alongside the cached response. This catches accidental key reuse across different operations.

Cron-generated idempotency keys are deterministic so retry produces the same key. Manual API callers (CLI, future surfaces) generate UUIDv7 or ULID per operation.

Refactor plan reference: §8.2 of `loom-meta/docs/v08-alignment-refactor-plan.md`.

Lives in `loom-core/src/loom_core/api/_deps.py`, `loom-core/src/loom_core/observability/idempotency_cache.py`. Tests in `loom-core/tests/observability/test_idempotency_cache.py`.
