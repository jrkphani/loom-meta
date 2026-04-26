# 004 — Hypotheses: CRUD, close, and layer constraint

**Workstream:** W2
**Tag:** AFK
**Blocked by:** #003
**User stories:** US-10, US-11, US-12

## Behaviour

Phani can create engagement-level and arena-level hypotheses, list them, fetch details, update title and description, and close a hypothesis that has reached a terminal progress state. The `layer` constraint is enforced: `arena` hypotheses must have `engagement_id = NULL`; `engagement` hypotheses must have `engagement_id` set. Closing a hypothesis sets `closed_at` and validates that `current_progress` is a terminal state (`realised`, `confirmed`, or `dead`).

## Acceptance criteria

- [ ] `POST /v1/hypotheses` creates a hypothesis; `layer = engagement` requires `engagement_id`; `layer = arena` forbids it — violating either returns 422.
- [ ] `GET /v1/hypotheses?engagement_id=:id` lists hypotheses for an engagement, ordered by created_at DESC.
- [ ] `GET /v1/hypotheses?arena_id=:id&layer=arena` lists arena-level hypotheses for an account.
- [ ] `GET /v1/hypotheses/:id` returns full hypothesis including current_progress, current_confidence, current_momentum and their last-review timestamps.
- [ ] `PATCH /v1/hypotheses/:id` updates title and description only (state is updated via state-change mechanism).
- [ ] `POST /v1/hypotheses/:id/close` succeeds only when `current_progress` is `realised`, `confirmed`, or `dead`; non-terminal state returns 422 with an explanatory error.
- [ ] Service tests cover the layer constraint, the 3 valid terminal states, and the 2 non-terminal rejection cases.

## Notes

Schema: `hypotheses` table (lines ~77–109 in `loom-schema-v1.sql`). Key columns: `layer`, `engagement_id`, `current_progress`, `closed_at`, and the composite CHECK constraint.

The three-dimensional state (`current_progress`, `current_confidence`, `current_momentum`) is read-only via GET at this stage; the state-change mechanism is issue #005 and #006.

Route: `loom-core/src/loom_core/api/hypotheses.py`. Service: `…/services/hypotheses.py`.

`default_factory` values from the schema: `current_progress='proposed'`, `current_confidence='medium'`, `current_momentum='steady'`, `confidence_inferred=True`, `momentum_inferred=True`.
