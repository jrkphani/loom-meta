# 028 — KG render: event page template with block anchors

**Workstream:** W6
**Tag:** AFK
**Blocked by:** #027, #007
**User stories:** US-30, US-31

## Behaviour

When an event is created and atoms are extracted, the KG dispatcher renders a markdown page at `outbox/work/events/{event_id}.md`. The page includes the event body summary, source metadata (attendees, date), and each atom as a Markdown section with a visible block anchor (`^d-001`, `^c-001`, etc.). Wikilinks from hypothesis pages can target these anchors directly. The page is styled per the Loom style guide.

## Acceptance criteria

- [ ] Creating an event and extracting atoms triggers the dispatcher, which writes `outbox/work/events/{event_id}.md`.
- [ ] Each atom in the page has a visible block anchor matching its `anchor_id` (e.g., `^d-001` for `anchor_id = d-001`).
- [ ] The page frontmatter includes: `id`, `type`, `domain`, `occurred_at`, `created_at`, and tags (if any).
- [ ] The page body includes: event `body_summary` at the top, then each atom grouped by type with atom content and anchor.
- [ ] The `entity_pages` row for this event is upserted with the correct `page_path` and `last_rendered_at`.
- [ ] A Jinja2 unit test renders the template with fixture event + atom data and asserts the block anchors are present and correctly formatted.

## Notes

Template: `loom-core/src/loom_core/vault/templates/event.md.j2`.

Block anchor format in Obsidian: a line ending with `^anchor_id` (e.g., `This is the decision text. ^d-001`). The anchor must be on the same line as the content, not a separate line.

Style guide reference: `docs/loom-style-guide.md` governs heading structure, tag format, frontmatter keys. Implement the style that document specifies, not an invented one.

The dispatcher should be called from the `inbox_sweep` pipeline after extraction completes, not as a background task. This ensures vault pages are available immediately after the sweep.
