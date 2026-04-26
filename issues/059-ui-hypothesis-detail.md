# 059 — loom-ui: hypothesis detail view

**Workstream:** W11
**Tag:** AFK
**Blocked by:** #058, #005
**User stories:** US-10, US-11, US-15, US-21

## Behaviour

Tapping a hypothesis in the engagement detail view opens the hypothesis detail: the three-dimensional state with last-reviewed timestamps, attached atoms grouped by type, a state change history timeline, and pending proposals. Inferred-but-unreviewed dimensions are shown with a distinct visual treatment (e.g., dashed border or `(inferred)` label). Phani can navigate to any atom's source event from this view.

## Acceptance criteria

- [ ] `HypothesisDetailView` fetches `GET /v1/hypotheses/:id/state` and displays progress/confidence/momentum with their timestamps.
- [ ] Inferred dimensions (`confidence_inferred = true`, `momentum_inferred = true`) show a visual marker (e.g., clock icon or `(inferred)` suffix).
- [ ] `GET /v1/hypotheses/:id/attachments` fetched; atoms listed grouped by type (decisions, commitments, asks, risks, status_updates).
- [ ] `GET /v1/hypotheses/:id/state/history` shown in a timeline: dimension, old_value → new_value, changed_by, changed_at.
- [ ] Tapping an atom shows its atom content and a "View Source" link that opens the vault event page in Obsidian (using `obsidian://open?vault=Loom&file=outbox/work/events/{id}`).
- [ ] A ViewModel unit test with mocked responses asserts the inferred flag logic.

## Notes

The `obsidian://open?` deep link is the standard Obsidian URL scheme for opening a specific file. It opens Obsidian and navigates to the file. This is the read-only source view in lieu of a built-in source viewer.

This view is read-only. Confirm/override actions are in the triage view (#060).

The state history timeline can use a simple `List` with a custom row — no third-party chart library.
