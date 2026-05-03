# 039 — Stakeholders: CRUD, time-bounded role periods, audience profile

**Workstream:** W17
**Tag:** AFK
**Blocked by:** #001, #076
**User stories:** US-27, US-29

> **NOTE — replaces the original #039 specification.** The original used a `work_stakeholder_roles` table with `effective_from/effective_to`. The v0.8 alignment refactor (`loom-meta/docs/loom-refactor-v08-plan.md` §1.5–§1.6) uses a domain-agnostic `stakeholder_roles` table with `started_at/ended_at` and a broader `scope_type` (arena | engagement | domain), plus an audience-profile extension on `stakeholders`. This issue specifies the v0.8 shape.

## Behaviour

Phani can create and manage stakeholders (global entities with canonical name, primary email, aliases, organisation) and attach **time-bounded roles** to them. A role is scoped to an arena, engagement, or domain, with a `started_at` date and a nullable `ended_at`. Roles are not deleted when they end — `ended_at` is set, preserving history. "Who was sponsor of Panasonic Wave 1?" remains queryable indefinitely.

Stakeholders also carry an **audience profile**: nullable fields capturing how briefs and drafts addressed to them should be shaped — `audience_schema` (executive | technical | aws_partner | customer_sponsor | visual), `preferred_depth`, `preferred_channel`, `tone_notes`. Brief composition (#038 amendment) reads these to pick the right cognition stage and depth.

The role enum is broader and projection-agnostic: `sponsor`, `beneficiary`, `blocker`, `champion`, `gatekeeper`, `collaborator`, `aws_partner_am`, `customer_exec`, `internal_team`. The CRO-projection role labels (advocate, validator, doer, advisor, etc.) from the original #039 are folded into these or expressed via `tone_notes` / `audience_schema`.

## Acceptance criteria

### Stakeholder CRUD
- [ ] `POST /v1/stakeholders` creates a stakeholder; returns 201.
- [ ] `GET /v1/stakeholders` returns all stakeholders; supports `?name_contains=Madhavan` (case-insensitive via `idx_stakeholders_name COLLATE NOCASE`).
- [ ] `GET /v1/stakeholders/:id` returns full stakeholder including aliases (JSON) and audience-profile fields.
- [ ] `PATCH /v1/stakeholders/:id` updates `canonical_name`, `primary_email`, `organization`, `aliases`.
- [ ] `PATCH /v1/stakeholders/:id/audience-profile` updates `audience_schema`, `preferred_depth`, `preferred_channel`, `tone_notes`. None means no change.
- [ ] `audience_schema` values validated against CHECK; invalid values return 422.

### Role periods
- [ ] `POST /v1/stakeholders/:id/roles` with `{domain, scope_type, scope_id, role, started_at}` creates a `stakeholder_roles` row; returns 201.
- [ ] `scope_type` ∈ `{arena, engagement, domain}`; invalid returns 422.
- [ ] `role` ∈ `{sponsor, beneficiary, blocker, validator, advocate, doer, influencer, advisor, decision_maker, informed_party}`; invalid returns 422.
- [ ] `POST /v1/stakeholder-roles/:id/end` with `{ended_at}` sets the end date on an active role; idempotent (ending an already-ended role returns 409).
- [ ] `GET /v1/stakeholders/:id/roles` returns active roles (`ended_at IS NULL`) by default; `?as_of=YYYY-MM-DD` returns roles active on that date.
- [ ] `GET /v1/stakeholders/:id/roles?include_history=true` returns full role history including ended roles, ordered by `started_at DESC`.
- [ ] Querying "current sponsor of engagement X": `GET /v1/engagements/:id/stakeholders?role=sponsor` resolves via `stakeholder_roles` where `scope_id = :id AND role = 'sponsor' AND ended_at IS NULL`.

### Tests
- [ ] Service tests cover: create stakeholder, attach role, end role, query as-of, query history, audience-profile update.
- [ ] An integration test seeds a stakeholder with three sequential sponsor-of-Wave1 → sponsor-of-Wave2 transitions and asserts that "as-of" queries return the right stakeholder for each historical date.
- [ ] All four CI gates pass.

## Notes

Schema lands in #076 (consolidated v0.8 migration); this issue delivers the service + API on top of that schema.

Why time-bounded roles and not just `effective_from/effective_to`: the role-period semantic is broader. The original `work_stakeholder_roles` was scoped to the work projection and treated roles as projection-specific. The v0.8 model treats stakeholder roles as universal — Phani's relationship to a person can shift across multiple projections (sponsor in work, advisor in finance) and the schema should support that uniformly.

The role enum compression from the original #039 (~11 roles) to the v0.8 (~9 roles) consolidates overlapping labels:
- `validator`, `advocate`, `internal_advocate` → `champion` or `aws_partner_am` depending on context
- `doer`, `influencer` → `collaborator`
- `decision_maker` → `sponsor` or `customer_exec`
- `informed_party`, `advisor` → captured via `tone_notes` and audience_schema rather than as explicit roles

This is intentional: the role enum names *the relationship*, not *the personality*. Tonal characteristics live in the audience profile.

The `aws_partner_am` role recognises the AWS Partner Account Manager as a first-class relationship category — important for 1CloudHub's partner-led motion. The `customer_exec` and `internal_team` roles are similarly first-class.

Resolution work from #040–#043 is unchanged in shape — the resolution engines write to `stakeholders` (canonical_name + primary_email + aliases) and emit role-attachment proposals via the triage queue.

Route: `loom-core/src/loom_core/api/stakeholders.py` and `…/api/stakeholder_roles.py` (new sibling for the role-period endpoints). Service: `…/services/stakeholders.py` and `…/services/stakeholder_roles.py`.
