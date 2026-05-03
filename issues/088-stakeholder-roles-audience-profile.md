# 088 — Stakeholder roles (time-bounded) + audience profile

**Workstream:** W17
**Tag:** AFK
**Blocked by:** #076, #086
**User stories:** US-27, US-29 (originally addressed by #039 — now superseded)

> **Supersedes:** #039 (stakeholder CRUD with `work_stakeholder_roles` and `effective_from/effective_to`). The v0.8 model uses `stakeholder_roles` (no `work_` prefix, projection-agnostic), `started_at/ended_at`, broader scope_type, and a different role enum aligned with the Personal OS blueprint v0.8.

## Behaviour

Stakeholders gain time-bounded roles via the `stakeholder_roles` table (added in #076). A role attaches a stakeholder to a scope (arena, engagement, or domain) with a role label and a started_at; ended_at is NULL while the role is active. Stakeholders also gain audience-profile fields (`audience_schema`, `preferred_depth`, `preferred_channel`, `tone_notes`) so brief composition can tailor per-stakeholder. CRUD endpoints support attaching, ending, listing-as-of-date, and updating audience profile.

## Acceptance criteria

- [ ] `POST /v1/stakeholders` creates a stakeholder; returns 201 (unchanged from #039).
- [ ] `GET /v1/stakeholders` returns all stakeholders; supports `?name_contains=` search (case-insensitive via `idx_stakeholders_name COLLATE NOCASE`).
- [ ] `GET /v1/stakeholders/{id}` returns full stakeholder including aliases, audience_schema, preferred_depth, preferred_channel, tone_notes.
- [ ] `PATCH /v1/stakeholders/{id}` updates canonical_name, primary_email, organization, aliases, audience_schema, preferred_depth, preferred_channel, tone_notes (sentinel-aware: None means no change).
- [ ] `POST /v1/stakeholders/{id}/roles` with `{scope_type, scope_id, role, started_at}` creates a `stakeholder_roles` row; returns 201.
- [ ] `PATCH /v1/stakeholders/roles/{role_id}` with `{ended_at}` ends an active role; preserves history (does not delete the row).
- [ ] `GET /v1/stakeholders/{id}/roles?as_of=YYYY-MM-DD` returns roles active on the given date (default today): `started_at <= cutoff AND (ended_at IS NULL OR ended_at >= cutoff)`.
- [ ] Role values: `sponsor`, `beneficiary`, `blocker`, `validator`, `advocate`, `doer`, `influencer`, `advisor`, `decision_maker`, `informed_party` (per #076 CHECK constraint and blueprint §4 Stakeholders).
- [ ] scope_type values: `arena`, `engagement`, `domain`. scope_id is a polymorphic ULID; loom-core validates existence at write time at the service layer.
- [ ] Audience-profile values: `audience_schema` ∈ `{executive, technical, aws_partner, customer_sponsor, visual}`; other fields free-text.
- [ ] Brief composition for a single stakeholder (`compose_brief_for_stakeholder` introduced in this issue) reads `audience_schema` and uses it as the schema parameter; falls back to `'executive'` if NULL.
- [ ] Unit tests: attach role; end role; list current roles as-of; audience profile round-trip; brief schema selection from audience_schema.
- [ ] All four CI gates pass.

## Notes

The shape change from #039 is real: `work_stakeholder_roles` (work-only, with `effective_from/effective_to` and a CRO-specific role enum) is dropped in #076 and replaced by `stakeholder_roles` (projection-agnostic, with `started_at/ended_at` and the universal 10-role enum from blueprint §4 Stakeholders). Affiliation (customer-side, AWS partner, 1CloudHub internal) is captured separately via `entity_tags` with the `aff/` namespace prefix — affiliation is a property of the person, not of the role period. This issue is the v1 implementation.

The audience profile is what makes per-stakeholder composition possible without per-stakeholder hand-tuning. A CRO writing to Madhavan (AWS partner, technical depth) should produce different content than the same CRO writing to Tatsuya (customer exec, executive depth) — even when the underlying state is the same. The audience profile encodes that.

`preferred_channel` (e.g., `email`, `teams`, `whatsapp`, `sms`) is a forward-looking field for the W11 surface that will dispatch drafts. Stored now so the data is ready when dispatch lands.

`tone_notes` is free-text for things that don't fit the structured fields ("prefers Japanese honorifics", "responds best to data-led arguments", "avoid jargon"). The brief composer can pass these to the Claude tier as part of the system prompt.

Per refactor plan §6, "current sponsor of Panasonic Wave 2" becomes a clean SQL query: `SELECT stakeholder_id FROM stakeholder_roles WHERE scope_id = ? AND role = 'sponsor' AND ended_at IS NULL`.

Refactor plan reference: §1.5, §1.6, §6.1, §6.2 of `loom-meta/docs/v08-alignment-refactor-plan.md`.

Lives in `loom-core/src/loom_core/services/stakeholders.py`, `loom-core/src/loom_core/api/stakeholders.py`. Tests in `loom-core/tests/services/test_stakeholders.py`.
