# 033 — KG render: brief page templates (engagement and arena)

**Workstream:** W6
**Tag:** AFK
**Blocked by:** #027
**User stories:** US-18, US-19, US-22, US-23

## Behaviour

Brief pages are the pre-generated markdown artifacts that Phani opens in Obsidian when Claude is unavailable. The Jinja2 templates for engagement briefs and arena briefs are defined here — the brief generation service (W7) calls these templates. A brief page is structured in two layers: a 30-second top section (executive state for each hypothesis) and a 5–10 minute drill-down section (atoms, open items, narrative).

## Acceptance criteria

- [ ] `engagement_brief.md.j2` renders a Markdown file with: frontmatter (engagement name, generated_at, hypothesis count), a top section with one line per hypothesis showing progress/confidence/momentum, and a drill-down section per hypothesis with open commitments/asks/risks.
- [ ] `arena_brief.md.j2` renders: account name, active engagement count, arena-level hypothesis summary, open-items across all engagements.
- [ ] Both templates accept a context dict; Jinja2 unit tests render them with fixture data and assert all required sections are present.
- [ ] The top section and drill-down sections are clearly delimited (e.g., `---` separator or `## At a glance` / `## Detail` headers).
- [ ] Inferred-but-unreviewed confidence/momentum dimensions are marked `(inferred)` in the top section.
- [ ] The templates are self-contained (no DB calls inside Jinja2); all data is passed in the context dict.

## Notes

Templates: `loom-core/src/loom_core/vault/templates/engagement_brief.md.j2`, `…/arena_brief.md.j2`.

The brief generation service (#035 in W7) is responsible for gathering the context dict and calling these templates. The templates are pure rendering logic with no business logic.

Style: follow `docs/loom-style-guide.md` for header levels, date formats, and link formats.

Briefs are written to `outbox/work/briefs/{engagement|arena}/{id}/{YYYY-MM-DD}.md`.
