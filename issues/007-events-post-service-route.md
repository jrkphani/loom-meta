# 007 — Events: POST service and route

**Workstream:** W3
**Tag:** AFK
**Blocked by:** none
**User stories:** US-1, US-2, US-3, US-4

## Behaviour

Loom Core can receive a new event via `POST /v1/events`. Events are immutable once written — no PATCH or DELETE. The service validates the event type and domain, generates a ULID, stores the row, and returns 201. Events form the backbone of the capture pipeline; they are the substrate from which atoms are extracted.

## Acceptance criteria

- [ ] `POST /v1/events` with valid `domain`, `type`, `occurred_at`, and optional `source_path`, `source_metadata`, `body_summary` returns 201 with the created event including its generated `id`.
- [ ] Invalid `type` values (not in the enum) return 422.
- [ ] `GET /v1/events?domain=work` returns events ordered by `occurred_at DESC`; supports `?type=process` filter.
- [ ] `GET /v1/events/:id` returns a single event by ID; 404 if not found.
- [ ] `PATCH /v1/events/:id` returns 405 Method Not Allowed (events are immutable).
- [ ] `DELETE /v1/events/:id` returns 405 Method Not Allowed.
- [ ] Service tests cover: create all six event types, duplicate ID, immutability rejection.

## Notes

Schema: `events` table (lines ~153–169 in `loom-schema-v1.sql`). Type enum: `process`, `inbox_derived`, `state_change`, `research`, `publication`, `external_reference`.

The `source_metadata` field is JSON (dict). The `occurred_at` field is when the event happened in the world (not the ingestion time). The `created_at` is the DB insertion time.

Route: `loom-core/src/loom_core/api/events.py`. Service: `…/services/events.py`.

This issue does NOT include atom extraction — atoms are extracted in #010 (Claude tier). This issue only creates the event record. The inbox sniffer (#008) calls this service after detecting a file.
