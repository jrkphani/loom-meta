# 029 — KG render: hypothesis page template

**Workstream:** W6
**Tag:** AFK
**Blocked by:** #027, #004
**User stories:** US-30, US-31

## Behaviour

Each hypothesis has a dedicated vault page at `outbox/work/hypotheses/{hypothesis_id}.md`. The page shows the three-dimensional current state (progress / confidence / momentum), marks inferred-but-unreviewed dimensions visually, lists attached atoms as wikilinks to their parent event pages with anchor IDs, and includes the state change history. The page is the primary read surface when Phani does a desk pre-read before a meeting.

## Acceptance criteria

- [ ] Creating or updating a hypothesis triggers the dispatcher, which writes `outbox/work/hypotheses/{hypothesis_id}.md`.
- [ ] The page shows `current_progress`, `current_confidence`, `current_momentum` with their last-reviewed timestamps.
- [ ] Dimensions with `confidence_inferred = true` or `momentum_inferred = true` are marked with a visual indicator (e.g., `(inferred)` suffix) per the style guide.
- [ ] Attached atoms appear as wikilinks: `[[events/{event_id}#^{anchor_id}|{atom content first 60 chars}]]`.
- [ ] The most recent 5 state changes are listed in a ## State History section.
- [ ] A Jinja2 unit test with fixture hypothesis data asserts: inferred markers, wikilink format, state history section.

## Notes

Template: `loom-core/src/loom_core/vault/templates/hypothesis.md.j2`.

The dispatcher is called:
1. After `POST /v1/hypotheses` (creation).
2. After `POST /v1/hypotheses/:id/state/confirm` or `/override` (state change).
3. After `POST /v1/atom-attachments` (new atom attached).

Wikilink format uses Obsidian's `[[path#anchor|display text]]` syntax. The path is relative to the vault root.

Do not include dismissed atoms in the page. Only active attachments (`dismissed = false`) appear.
