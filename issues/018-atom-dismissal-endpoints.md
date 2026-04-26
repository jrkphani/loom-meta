# 018 — Atom dismissal: global and attachment-scoped with reason capture

**Workstream:** W4
**Tag:** AFK
**Blocked by:** #017
**User stories:** US-14, US-16

## Behaviour

Phani can dismiss an atom globally (it shouldn't appear in any triage queue across all hypotheses) or dismiss a specific atom-to-hypothesis attachment (not relevant to this particular hypothesis, but may be relevant elsewhere). Both dismissal operations require a reason — the dismissal reason is a high-value training signal. Dismissed atoms and attachments are soft-deleted (data retained, excluded from default queries).

## Acceptance criteria

- [ ] `POST /v1/atoms/:id/dismiss` with `{dismissal_reason}` sets `atoms.dismissed = true`, `atoms.dismissed_at = now()`, `atoms.dismissal_reason = reason`; returns 200.
- [ ] `POST /v1/atom-attachments/:id/dismiss` with `{dismissal_reason}` sets `atom_attachments.dismissed = true`, `atom_attachments.dismissed_at = now()`, `atom_attachments.dismissal_reason = reason`; returns 200.
- [ ] Both endpoints require `dismissal_reason` — empty string or missing returns 422.
- [ ] Dismissing an already-dismissed atom/attachment returns 409 Conflict.
- [ ] `GET /v1/atoms?dismissed=false` excludes globally dismissed atoms (default behaviour established in #016).
- [ ] `GET /v1/hypotheses/:id/attachments` (from #017) excludes dismissed attachments by default; `?include_dismissed=true` includes them.
- [ ] Service tests: dismiss atom, dismiss attachment, verify exclusion from default queries, verify inclusion with flag.

## Notes

Schema: `atoms.dismissed`, `atoms.dismissed_at`, `atoms.dismissal_reason` (lines ~193–196 in `loom-schema-v1.sql`); `atom_attachments.dismissed`, `…dismissed_at`, `…dismissal_reason` (lines ~281–283).

"Global dismiss" (dismiss the atom itself) vs. "scoped dismiss" (dismiss the attachment) are distinct operations. A globally dismissed atom disappears from all hypotheses' triage views. A scoped dismiss removes it from one hypothesis's view only.

The PRD notes: "dismissed flag on atoms and atom_attachments is soft (training signal)." Never hard-delete dismissed rows.
