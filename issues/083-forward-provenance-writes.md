# 083 — Forward provenance writes (atom_contributions)

**Workstream:** W16
**Tag:** AFK
**Blocked by:** #076
**User stories:** US-25 (provenance), US-15 (state inference accountability)

## Behaviour

Every consumer of atoms — brief composition, state inference, draft composition, sent actions, derived atom production — records a row in `atom_contributions` linking the atom(s) used to the consumer entity. The existing `state_change_evidence` table is backward provenance (state-change → atoms). `atom_contributions` is the forward index (atom → things this atom shaped).

Forward provenance is the "atom of accountability." Without it, retraction (#084) cannot cascade — there is no way to ask "what did this atom contribute to?" The hook is a single function, `record_contribution(atom_ids, consumer_type, consumer_id)`, called by every consumer at write time. It is idempotent (INSERT OR IGNORE on the composite PK).

## Acceptance criteria

- [ ] `loom_core/services/atoms.py` is created (the file does not exist yet) with `record_contribution(session, atom_ids, consumer_type, consumer_id)` as the public function.
- [ ] `record_contribution` writes one row per atom_id to `atom_contributions` with INSERT OR IGNORE semantics; calling twice with the same args is a no-op (idempotent).
- [ ] Consumer types accepted: `brief_run`, `state_change`, `draft`, `sent_action`, `derived_atom` (matches the CHECK constraint from #076).
- [ ] Brief composition (#035, #036 amendments) calls `record_contribution` for every atom that fed the brief, immediately after `persist_brief`.
- [ ] State inference engines (#023, #024, #025 amendments) call `record_contribution` for every atom that contributed to a state-change proposal.
- [ ] Atom attachment (#017 amendment) does NOT call `record_contribution` — attaching is not consumption. Contribution is recorded only when the attachment leads to a downstream consumer using the atom.
- [ ] When draft composition lands (later workstream), it calls `record_contribution` per atom included in the draft.
- [ ] Unit tests cover: idempotency (INSERT OR IGNORE works); composite PK prevents duplicate rows; consumer_type enum is enforced.
- [ ] An integration test seeds a brief composition flow and verifies that `atom_contributions` rows exist for every atom in the brief.
- [ ] All four CI gates pass.

## Notes

Reference: `loom-meta/docs/loom-v08-alignment.md` §4.1.

The existing `state_change_evidence` table is preserved as-is — it serves a different purpose (the named relation between a single state change and its triggering atoms). `atom_contributions` is the inverted index that lets us walk from atom forward to all consumers transitively.

The `derived_atom` consumer type is for a future phase: when an atom is synthesised from other atoms (e.g., a "summary" atom that consolidates several status_update atoms), the derived atom records its source atoms as contributors. Retraction then cascades transitively.

Performance note: at scale, `atom_contributions` could grow large (thousands of rows per active engagement). The composite PK plus `idx_ac_consumer` index handles the access patterns: lookup-by-atom for retraction cascade, and lookup-by-consumer for "what atoms shaped this brief?" provenance UI.

After this lands, retraction (#084) has the index it needs to cascade. The existing v0.8 addendums in #017, #024, #025, #035, #036 reference this issue as a dependency.
