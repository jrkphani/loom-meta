# 013 — Atom lifecycle: commitment, ask, and risk status updates

**Workstream:** W3
**Tag:** AFK
**Blocked by:** #010
**User stories:** US-14

## Behaviour

Commitments, asks, and risks have a lifecycle tracked through status transitions. Phani (or a cron job) can update the status of a commitment (e.g., open → met), an ask (e.g., raised → granted), or a risk (e.g., unmitigated → mitigated). Each status transition writes an `atom_status_changes` row and updates the denormalized `current_status` column on the detail table. The transition history is queryable.

## Acceptance criteria

- [ ] `POST /v1/atoms/:id/status` with `{new_status, changed_by, reason?}` updates `current_status` on the appropriate detail table and writes an `atom_status_changes` row.
- [ ] Invalid status transitions (e.g., `met` → `open` for commitments, if the transition matrix disallows it) return 422. At minimum, transitioning a non-commitment atom via the commitment status endpoint returns 422.
- [ ] `GET /v1/atoms/:id/status/history` returns `atom_status_changes` rows ordered by `changed_at DESC`.
- [ ] `PATCH /v1/atoms/:id/commitment` updates `due_date` and `owner_stakeholder_id` on `atom_commitment_details`.
- [ ] `PATCH /v1/atoms/:id/risk` updates `severity` and `owner_stakeholder_id` on `atom_risk_details`.
- [ ] Service tests: update commitment from open → in_progress → met; update ask from raised → granted; update risk severity.
- [ ] The `current_status` field on `AtomCommitmentDetails` (lifecycle of commitment atoms specifically) is the lifecycle target for commitment-kind atoms in this issue. Rules-tier extractor (#012) creates the aux record with the schema's default; lifecycle transitions land here. Test fixtures may mirror the minimal-Stakeholder shape from `tests/pipelines/test_extractor_rules.py` (three fields inline: `id`, `canonical_name`, `primary_email`).

## Notes

Schema: `atom_status_changes` (lines ~259–268), `atom_commitment_details` (lines ~221–230), `atom_ask_details` (lines ~234–244), `atom_risk_details` (lines ~247–255) in `loom-schema-v1.sql`.

`changed_by` in `atom_status_changes` is a free text field (`'cron' or stakeholder_id`) — not an enum. The atom type determines which detail table is updated; fetching the wrong table for a given atom type should return 422 Not Applicable.

Route: `POST /v1/atoms/:id/status`, `GET /v1/atoms/:id/status/history`, `PATCH /v1/atoms/:id/commitment`, `PATCH /v1/atoms/:id/risk`.

---

## v0.8 Alignment Addendum

**Depends on:** #084 (retraction)

Status transitions are independent of retraction. A retracted atom does NOT auto-cascade status changes — retraction marks the atom unreliable; status changes record what happened to the underlying commitment/ask/risk regardless. The two workflows are separate.

### Additional acceptance criteria

- [ ] When an atom is retracted via #084, status-history endpoints continue to return its history but include a `retracted_at` flag in the response so the UI can mark the atom unreliable in the timeline.
- [ ] Status transitions on a retracted atom return 409 with reason `atom_retracted` — the human must un-retract first if they want to record a status change post-retraction.

