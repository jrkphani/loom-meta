# 039 — Stakeholders: CRUD, roles, and section 4 roles migration

**Workstream:** W8
**Tag:** AFK
**Blocked by:** #001
**User stories:** US-27, US-29

## Behaviour

Phani can create and manage stakeholders (global entities) and assign them roles scoped to a hypothesis, engagement, or arena. Stakeholders have a canonical name, primary email, aliases, and organisation. Roles are domain-specific (in v1, always `work`). The section 4 `work_stakeholder_roles` table is added in a new Alembic migration.

## Acceptance criteria

- [ ] `POST /v1/stakeholders` creates a stakeholder; returns 201.
- [ ] `GET /v1/stakeholders` returns all stakeholders; supports `?name_contains=Madhavan` search (case-insensitive, uses `idx_stakeholders_name COLLATE NOCASE`).
- [ ] `GET /v1/stakeholders/:id` returns full stakeholder including aliases (JSON).
- [ ] `PATCH /v1/stakeholders/:id` updates canonical_name, primary_email, organization, aliases.
- [ ] `POST /v1/stakeholders/:id/roles` with `{scope_type, scope_id, role, effective_from?}` creates a `work_stakeholder_roles` row.
- [ ] `GET /v1/stakeholders/:id/roles` returns active roles (`effective_to IS NULL`) for the stakeholder.
- [ ] An Alembic migration adds `work_stakeholder_roles`; applies cleanly.
- [ ] `role` values are validated against the CHECK constraint; invalid values return 422.

## Notes

Schema: `stakeholders` (lines ~139–147), `work_stakeholder_roles` (lines ~445–459) in `loom-schema-v1.sql`.

`scope_type` values: `hypothesis`, `engagement`, `arena`. `scope_id` is a polymorphic ULID — Loom Core validates existence at write time.

Role values: `sponsor`, `beneficiary`, `blocker`, `validator`, `advocate`, `doer`, `influencer`, `advisor`, `decision_maker`, `informed_party`, `internal_advocate`.

Route: `loom-core/src/loom_core/api/stakeholders.py`. Service: `…/services/stakeholders.py`.
