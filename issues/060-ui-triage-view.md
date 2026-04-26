# 060 — loom-ui: triage queue view with actions and 30s polling

**Workstream:** W11
**Tag:** AFK
**Blocked by:** #059, #020
**User stories:** US-13, US-14, US-15, US-39

## Behaviour

The Triage section is the Friday workflow surface. It shows the prioritised queue, grouped by item type. For each item, Phani can: attach an atom to a hypothesis, dismiss an atom with a reason, confirm a state-change proposal (showing Claude's reasoning), or override it with their own value and a mandatory reason. The view polls every 30 seconds while open so the queue updates without manual refresh.

## Acceptance criteria

- [ ] `TriageQueueView` fetches `GET /v1/triage` and displays items grouped by `item_type` (state proposals first, then low-confidence atoms, then ambiguous routes).
- [ ] Each item row shows `context_summary`, `priority_score`, `surfaced_at`.
- [ ] State-change proposal rows show the proposed value, Claude's reasoning, and Confirm / Override buttons.
- [ ] Confirm calls `POST /v1/hypotheses/:id/state/confirm`; the item disappears from the queue.
- [ ] Override shows a sheet with a dimension selector, value selector, and mandatory reason text field; calls `POST /v1/hypotheses/:id/state/override`; returns 422 if reason is empty.
- [ ] Atom attachment rows show atom content, a hypothesis picker (dropdown of the engagement's hypotheses), and an Attach button.
- [ ] Dismiss shows a sheet with a mandatory reason text field; calls `POST /v1/atoms/:id/dismiss`.
- [ ] A 30-second `Timer.publish` triggers a queue refresh while the view is in focus (US-39).
- [ ] ViewModel unit tests: group-by logic, confirm/override flow with mocked client.

## Notes

The 30-second poll is a `Timer.publish` in SwiftUI, cancelled `onDisappear`. Use `@MainActor async` to refresh without blocking.

The hypothesis picker for atom attachment needs to fetch `GET /v1/hypotheses?engagement_id=:id` — scoped to the atom's engagement (inferred from the triage item's context). If multiple engagements are relevant, show all active engagements.

Override reason field: `UITextView` equivalent in SwiftUI with minimum 3-character validation before the button is enabled.
