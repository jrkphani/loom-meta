# 027 — KG render dispatcher and entity_pages schema migration

**Workstream:** W6
**Tag:** AFK
**Blocked by:** #001
**User stories:** US-30, US-31, US-32

## Behaviour

Every time a Loom Core entity is created or updated, a corresponding vault page is rendered or re-rendered in `outbox/work/`. The KG render dispatcher is the central coordinator: given an entity type + ID, it looks up the right Jinja2 template, renders the page, writes it to the vault, and upserts the `entity_pages` row. A new Alembic migration adds the section 2 tables (`entity_pages`, `tags`, `entity_tags`).

## Acceptance criteria

- [ ] An Alembic migration adds `entity_pages`, `tags`, `entity_tags` (schema section 2); applies cleanly on a fresh DB.
- [ ] `render_entity_page(entity_type, entity_id, session)` looks up the entity, selects the correct template, renders it, writes to `outbox/work/{entity_type}s/{ulid}.md`, and upserts `entity_pages`.
- [ ] `entity_pages.last_rendered_at` is updated on every render.
- [ ] `entity_pages.render_version` is bumped when the template file's version string changes (enabling the nightly reconciliation cron #034 to detect stale pages).
- [ ] If the entity does not exist, the dispatcher raises a `NotFoundError` (not silently skips).
- [ ] Unit tests: dispatch for `arena`, `engagement`, `hypothesis` types with stub templates; assert vault file is written to the correct path.

## Notes

Schema section 2: `entity_pages` (lines ~351–361), `tags` (lines ~364–370), `entity_tags` (lines ~373–385) in `loom-schema-v1.sql`.

`entity_pages` has a polymorphic PK `(entity_type, entity_id)`. Valid `entity_type` values: `event`, `hypothesis`, `stakeholder`, `artifact`, `arena`, `engagement`.

Vault path pattern: `~/Documents/Loom/outbox/work/{entity_type}s/{ulid}.md`. The vault_path is stored as a relative path in `entity_pages.page_path`.

The dispatcher lives in `loom-core/src/loom_core/vault/dispatcher.py`. Templates live in `loom-core/src/loom_core/vault/templates/`.

Tags and entity_tags CRUD (the tag overlay) can be minimal stubs for now; full tag management is not required for the KG render pipeline to work.
