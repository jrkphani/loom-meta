# 088 — Stakeholder role periods + audience profile (replaces #039)

**Workstream:** W8
**Tag:** AFK
**Blocked by:** #076
**User stories:** US-27, US-28, US-29

## Behaviour

**Replaces #039.** Stakeholder roles are time-bounded (`started_at`, `ended_at`) with `scope_type` ∈ `{arena, engagement, domain}` and a v0.8 role enum that is projection-agnostic (not work-only). Stakeholders gain an audience profile (`audience_schema`, `preferred_depth`, `preferred_channel`, `tone_notes`) that drives brief composition (#038 amendment). Role-period CRUD lets Phani attach, end, and query roles as-of any date — querying "who was sponsor of Panasonic Wave 2 last quarter" becomes a SQL question.

## Acceptance criteria

- [ ] `POST /v1/stakeholders` creates a stakeholder; returns 201. (Same shape as #039 was specifying.)
- [ ] `GET /v1/stakeholders` returns all stakeholders; supports `?name_contains=Madhavan` (case-insensitive, uses `idx_stakeholders_name COLLATE NOCASE`).
- [ ] `GET /v1/stakeholders/{id}` returns full stakeholder including aliases and audience profile.
- [ ] `PATCH /v1/stakeholders/{id}` updates `canonical_name`, `primary_email`, `organization`, `aliases`.
- [ ] `POST /v1/stakeholders/{id}/roles` with `{domain, scope_type, scope_id, role, started_at}` creates a `stakeholder_roles` row; returns 201.
- [ ] `PATCH /v1/stakeholder-roles/{id}/end` with `{ended_at}` ends an active role (sets `ended_at`; does NOT delete — preserves history). Returns 200.
- [ ] `GET /v1/stakeholders/{id}/roles?as_of=YYYY-MM-DD` returns roles active on the given date (default today): `started_at <= as_of AND (ended_at IS NULL OR ended_at >= as_of)`.
- [ ] `role` value validated against the v0.8 enum: `('sponsor', 'beneficiary', 'blocker', 'champion', 'gatekeeper', 'collaborator', 'aws_partner_am', 'customer_exec', 'internal_team')`. Invalid → 422.
- [ ] `scope_type` value validated against `('arena', 'engagement', 'domain')`. `scope_id` required when scope_type ≠ `'domain'`.
- [ ] `PATCH /v1/stakeholders/{id}/audience-profile` with `{audience_schema, preferred_depth, preferred_channel, tone_notes}` updates the profile fields. None means no change.
- [ ] `audience_schema` validated against `('executive', 'technical', 'aws_partner', 'customer_sponsor', 'visual')`. Invalid → 422.
- [ ] Brief composition (#038 amendment) reads `audience_schema` to pick the cognition stage and depth.
- [ ] `compose_brief_for_stakeholder(scope_type, scope_id, stakeholder_id)` helper composes a brief with `Audience.for_stakeholders([stakeholder_id])` and the schema from the profile.
- [ ] Service tests cover: create stakeholder, attach role, end role, list as-of past date, audience profile update, compose-brief-for-stakeholder.
- [ ] All four CI gates pass.

## Notes

**Supersedes #039** (the `work_stakeholder_roles` model with `effective_from/effective_to` and the older role enum: sponsor/beneficiary/blocker/validator/advocate/doer/influencer/advisor/decision_maker/informed_party/internal_advocate). The v0.8 model is broader (not work-projection-locked), uses `started_at/ended_at` for clarity, and uses a tighter projection-agnostic role enum. Mark #039 superseded.

The audience profile's existence makes briefs personalisable without per-recipient prompt engineering — the profile *is* the prompt configuration. Cognition stage selection (#038): `executive` schema → `executive_narrative` stage; `technical` → `tactical_brief`; `aws_partner` → partner-tailored stage.

The work projection's actor topology (`work_commitment_direction`, `work_ask_side` from W2 #003) is unaffected — that lives at the atom level, not the stakeholder level.

Reference: refactor plan §1.5, §1.6, §6, blueprint §5.7 / §6.5.
