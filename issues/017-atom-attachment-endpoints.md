# 017 — Atom attachments: attach, detach, and ambiguity flag

**Workstream:** W4
**Tag:** AFK
**Blocked by:** #016
**User stories:** US-13, US-14

## Behaviour

Phani can attach an atom to a hypothesis (triage decision: "this fact is relevant to this bet"), detach it (change of mind before dismissal), or flag it as ambiguous (relevant to multiple hypotheses, needs further thought). The attachment records whether it was system-suggested or human-confirmed. The `UNIQUE (atom_id, hypothesis_id)` constraint prevents duplicate attachments.

## Acceptance criteria

- [ ] `POST /v1/atom-attachments` with `{atom_id, hypothesis_id, attached_by, ambiguity_flag?}` creates the attachment; returns 201.
- [ ] Attaching the same `(atom_id, hypothesis_id)` pair twice returns 409 Conflict.
- [ ] `DELETE /v1/atom-attachments/:id` removes the attachment row entirely (hard delete — the atom is still in the `atoms` table).
- [ ] `PATCH /v1/atom-attachments/:id` with `{ambiguity_flag: true}` sets the flag; returns 200.
- [ ] `GET /v1/hypotheses/:id/attachments` returns all non-dismissed attachments for a hypothesis, ordered by `attached_at DESC`.
- [ ] `attached_by` must be one of `cron_suggested` or `human_confirmed`; other values return 422.
- [ ] Service tests: attach, double-attach (409), detach, flag as ambiguous, list by hypothesis.

## Notes

Schema: `atom_attachments` table (lines ~274–288 in `loom-schema-v1.sql`). Key columns: `atom_id`, `hypothesis_id`, `attached_by`, `ambiguity_flag`, `dismissed`, `dismissed_at`, `dismissal_reason`.

Do NOT confuse `DELETE /v1/atom-attachments/:id` (hard delete of the attachment row) with dismissal (which is a soft operation in #018 that sets `dismissed = true` and records a reason).

Route: `POST /v1/atom-attachments`, `DELETE /v1/atom-attachments/:id`, `PATCH /v1/atom-attachments/:id`, `GET /v1/hypotheses/:id/attachments`.
