# 058 — loom-ui: engagements list and detail views

**Workstream:** W11
**Tag:** AFK
**Blocked by:** #057, #003
**User stories:** US-9, US-38

## Behaviour

The Engagements section lists all active engagements grouped by arena. Selecting an engagement shows its detail view: name, type, SOW metadata, swim-lane, and a list of its hypotheses with their current three-dimensional state colour-coded. Creating a new engagement is not in v1 UI (use the API); the list is read-only except for the close action.

## Acceptance criteria

- [ ] `EngagementsListView` fetches `GET /v1/engagements?domain=work` and displays engagements grouped by `arena_id` (arena name shown as a section header via `GET /v1/arenas/:id`).
- [ ] Each engagement row shows: name, type_tag, hypotheses count, and a colour indicator (green/yellow/red) derived from the worst hypothesis progress state.
- [ ] Selecting an engagement shows `EngagementDetailView` with: name, type_tag, SOW value (if set), swim_lane (if set), and a list of hypothesis rows each showing current_progress / current_confidence / current_momentum.
- [ ] `POST /v1/engagements/:id/close` is accessible from the detail view via a "Close Engagement" button (with a confirmation alert).
- [ ] Data is fetched on appear and on explicit pull-to-refresh (macOS equivalent).
- [ ] A ViewModel unit test mocks `LoomClient` and asserts the grouping logic.

## Notes

No SwiftUI previews are required, but `@MainActor` isolation must be correct — `LoomClient` is an actor, ViewModel must `await` calls correctly.

The "worst hypothesis state" colour: red if any hypothesis is `proposed` with no recent activity, yellow if `in_delivery`, green if `realised` or `confirmed`. Implement as a pure function on the hypothesis array.

Hypothesis list rows in the detail view are navigable to #059 (hypothesis detail).
