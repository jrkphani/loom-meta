# 002 — Arenas: full CRUD, close, and account metadata

**Workstream:** W2
**Tag:** AFK
**Blocked by:** #001
**User stories:** US-8, US-12

## Behaviour

Phani can retrieve, update, and close an arena through the API. A close operation soft-deletes by setting `closed_at`; a GET on a closed arena is still valid (history). Work-domain metadata (industry, region, AWS segment, customer type) is stored alongside the arena via `work_account_metadata`. A separate Alembic migration adds the section 4 `work_account_metadata` table.

## Acceptance criteria

- [ ] `GET /v1/arenas/:id` returns the arena including `work_account_metadata` fields if present.
- [ ] `PATCH /v1/arenas/:id` updates name, description, and/or account metadata fields; returns 200.
- [ ] `POST /v1/arenas/:id/close` sets `closed_at = now()`; returns 200 with the updated arena.
- [ ] Closing an already-closed arena returns 409 Conflict.
- [ ] `GET /v1/arenas?domain=work&include_closed=false` excludes arenas where `closed_at IS NOT NULL`.
- [ ] An Alembic migration adds `work_account_metadata` (section 4 of `loom-schema-v1.sql`); `uv run alembic upgrade head` applies cleanly on a fresh DB.
- [ ] Service tests exercise CRUD and close against an in-memory SQLite.

## Notes

Schema: `work_account_metadata` (lines ~423–429 in `loom-schema-v1.sql`). Columns: `arena_id` (PK, FK arenas.id), `industry`, `region`, `aws_segment`, `customer_type`.

Section 4 also includes `work_engagement_metadata`, `work_stakeholder_roles`, `work_commitment_direction`, `work_ask_side`. Only `work_account_metadata` lands in this issue's migration; the others land in #003 and #039.

Route: `loom-core/src/loom_core/api/arenas.py`. Service: `…/services/arenas.py`.

The close endpoint pattern is `POST /:id/close` (not PATCH or DELETE) — matches the action-oriented style used throughout `loom-api-v1.md`.
