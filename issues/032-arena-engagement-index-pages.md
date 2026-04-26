# 032 — KG render: arena and engagement index pages

**Workstream:** W6
**Tag:** AFK
**Blocked by:** #027, #003
**User stories:** US-8, US-9, US-30

## Behaviour

Each arena (account) and engagement has an index vault page that aggregates all their hypotheses, recent events, and account metadata. The arena page is the account-level view; the engagement page is the wave/project-level view. These pages are the top of the wikilink hierarchy in Obsidian — clicking from a hypothesis back-link leads to its engagement, then arena.

## Acceptance criteria

- [ ] Creating or updating an arena writes `outbox/work/arenas/{arena_id}.md` with: name, domain, account metadata (industry, region, AWS segment, customer type), list of active engagements (wikilinks), list of arena-level hypotheses (wikilinks).
- [ ] Creating or updating an engagement writes `outbox/work/engagements/{engagement_id}.md` with: name, type_tag, SOW value, AWS program, swim-lane, list of hypotheses for that engagement (wikilinks), recent atoms (last 5, wikilinks to event pages).
- [ ] Closing an arena or engagement triggers a re-render with `closed_at` visible in the frontmatter.
- [ ] Wikilinks to hypotheses use `[[hypotheses/{hypothesis_id}|{title}]]` format.
- [ ] Jinja2 unit tests for both templates with fixture data.

## Notes

Templates: `loom-core/src/loom_core/vault/templates/arena.md.j2`, `…/engagement.md.j2`.

The dispatcher is called from: `arenas_service.create()`, `arenas_service.close()`, `engagements_service.create()`, `engagements_service.close()`, `hypotheses_service.create()` (to re-render the parent engagement index).

These are "living documents" — they change frequently as hypotheses are added, atoms are attached, state changes. Keep renders cheap: a render takes < 100ms per page (SQLite is fast; the template is simple).
