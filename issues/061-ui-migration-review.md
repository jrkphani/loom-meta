# 061 — loom-ui: migration review view

**Workstream:** W11
**Tag:** AFK
**Blocked by:** #060, #048
**User stories:** US-6, US-40

## Behaviour

The Migration section shows the low-confidence migration queue. Each item shows side-by-side: the original note text (left pane) and the extracted atoms (right pane) with a confidence score badge. Phani can accept (atoms go to vault), reject (atoms discarded, original stays archived), or mark for re-run (queues for Claude rewrite with review notes as additional context). Navigation through the queue is sequential — next/previous buttons.

## Acceptance criteria

- [ ] `MigrationReviewView` fetches `GET /v1/migration/queue` and shows total pending count and current position (e.g., "Item 3 of 17").
- [ ] Split pane: left shows original text (fetched from `GET /v1/migration/records/:id/preview`), right shows extracted atoms formatted as a list.
- [ ] Confidence score badge: green ≥ 0.75, yellow 0.5–0.74, red < 0.5.
- [ ] Accept button calls `POST /v1/migration/records/:id/review` with `{decision: "accepted"}`; advances to next item.
- [ ] Reject button calls with `{decision: "rejected"}`; advances to next item.
- [ ] Re-run button shows a text field for review notes, then calls with `{decision: "rerun_pending", review_notes: ...}`.
- [ ] When queue is empty, shows "Migration review complete" message.
- [ ] ViewModel unit test: queue navigation, accept/reject/rerun state transitions with mocked client.

## Notes

The split pane can use `HSplitView` on macOS. The original text is shown in a read-only `TextEditor` or `ScrollView + Text`. Atoms are shown as a `List`.

Navigation is sequential (next/previous), not random-access — this matches the Friday triage rhythm where Phani works through the queue in order.

The review_notes text field for re-run is pre-populated with the confidence score and a template: "Re-run with additional context: [reason]."
