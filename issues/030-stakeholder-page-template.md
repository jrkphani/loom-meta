# 030 — KG render: stakeholder page template

**Workstream:** W6
**Tag:** AFK
**Blocked by:** #027, #088
**User stories:** US-29, US-30

## Behaviour

Each resolved stakeholder gets a vault page at `outbox/work/stakeholders/{stakeholder_id}.md`. The page shows the stakeholder's canonical name, organisation, aliases, and their roles scoped to active engagements and arenas. Atoms where this stakeholder is the owner (commitment owner, ask owner, risk owner) appear as a summary. The stakeholder page is the reference for "who is this person and what are they responsible for?"

## Acceptance criteria

- [ ] Creating or updating a stakeholder triggers the dispatcher to write `outbox/work/stakeholders/{stakeholder_id}.md`.
- [ ] The page frontmatter includes `canonical_name`, `organization`, `primary_email` (if set), `aliases`.
- [ ] The page body includes a ## Roles section listing stakeholder_roles rows where `ended_at IS NULL`: scope_type, scope (name), role, started_at.
- [ ] The page includes a ## Open Commitments section listing atoms of type `commitment` where `owner_stakeholder_id = stakeholder_id` and `current_status NOT IN ('met', 'cancelled')`.
- [ ] A Jinja2 unit test with fixture stakeholder + roles + atoms asserts: roles section, open commitments section.

## Notes

Template: `loom-core/src/loom_core/vault/templates/stakeholder.md.j2`.

The stakeholder page depends on W8 (#039) for the stakeholder CRUD service to exist. Blocked by #039.

`stakeholder_roles` is added in the v0.8 consolidated migration (#076).

The `primary_email` field is sensitive — it should appear in the vault page (this is a personal, private vault), but note that the vault is iCloud-synced to iOS. The user has accepted this trade-off (PRD §6.1 footnote on FileVault).
