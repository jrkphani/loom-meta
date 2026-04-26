# 034 — KG reconcile nightly cron

**Workstream:** W6
**Tag:** AFK
**Blocked by:** #028, #029, #030, #031, #032
**User stories:** US-32

## Behaviour

At 02:00 daily, the `kg_reconcile` pipeline re-renders every vault page whose template version has been bumped since the page was last rendered. This ensures that when a Jinja2 template is updated (style change, new section added), all existing pages automatically get the new format overnight — Phani does not need to manually re-trigger renders.

## Acceptance criteria

- [ ] APScheduler registers `kg_reconcile` at daily 02:00 (CronTrigger).
- [ ] The job queries `entity_pages` for rows where `render_version < CURRENT_TEMPLATE_VERSION[entity_type]`.
- [ ] `CURRENT_TEMPLATE_VERSION` is a dict keyed by `entity_type`; bumping a template's version constant triggers all pages of that type to re-render on the next run.
- [ ] The job re-renders each stale page using the dispatcher (#027) and updates `entity_pages.render_version` and `last_rendered_at`.
- [ ] Failures on individual pages are logged and skipped (the job continues to the next page).
- [ ] A `processor_runs` row is written with `pipeline = 'kg_render'` at the end of each run.
- [ ] Integration test: create 3 entities, bump the template version for one type, run the cron, assert only those pages were re-rendered (check `last_rendered_at` timestamps).

## Notes

`entity_pages.render_version` (schema line ~358) stores the template version at last render. The template version is a Python constant, not stored in DB.

The reconcile job should not re-render ALL pages every night — only stale ones. This keeps the job cheap even at scale.

Cron schedule from PRD §6.4: `kg_reconcile` at 02:00 daily.
