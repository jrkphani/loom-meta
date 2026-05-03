# 084 — Atom retraction endpoint and cascade walk

**Workstream:** W16 (Phase B — v0.8 alignment)
**Tag:** AFK
**Blocked by:** #083
**User stories:** US-25; refactor plan §4.2 (blueprint §11.10)

## Behaviour

A `POST /v1/atoms/{atom_id}/retract` endpoint lets a human (or, for safety, only a human) retract an atom that turned out to be a hallucination, a wrong extraction, derived from a stale source, or corrected on review. Retraction marks the atom (`retracted=1`, `retracted_at`, `retraction_reason`) and cascades through `atom_contributions` to find every consumer: affected briefs flag for regeneration; affected drafts surface in a review queue; affected sent actions surface in a "correction needed" surface; derived atoms transitively walk (cycle-safe via visited set). The retraction is logged in the operations log (#089) and emits a training signal so the cognition self-improvement loop can learn from the failure.

## Acceptance criteria

- [ ] `POST /v1/atoms/{atom_id}/retract` with body `{reason: 'hallucination' | 'wrong_extraction' | 'stale_source' | 'corrected_on_review'}` returns 200 with a `RetractionResultRead` body listing affected consumers.
- [ ] Atom is marked `retracted=1`, `retracted_at=now()`, `retraction_reason=body.reason`.
- [ ] Retracting an already-retracted atom returns 409 Conflict (`AtomAlreadyRetractedError`).
- [ ] Retracting a non-existent atom returns 404 (`AtomNotFoundError`).
- [ ] Cascade walk visits `atom_contributions` for the retracted atom and groups affected consumers by `consumer_type`.
- [ ] Affected briefs are flagged for regeneration: the next `brief_engagement` or `brief_arena` cron picks them up first.
- [ ] Affected drafts get a `review_required` flag (or equivalent — drafts surface lands later; for v1, hook is present and writes a triage row).
- [ ] Affected sent actions: a triage row is created with `item_type` extended to `'correction_needed'` (schema migration in #076 should have anticipated this; if not, an additional small migration adds the enum value).
- [ ] Derived atoms are walked transitively. Cycle protection via a `visited: set[str]` parameter passed through the recursive walk (no atom processed twice).
- [ ] The retraction is appended to the operations log (#089) with `op_type = 'retraction'`, the atom_id, reason, and full affected-set summary.
- [ ] If the retracted atom was inference-extracted (`extractor_provider IS NOT NULL`), a training signal row is emitted: `kind = 'extraction_retraction'`, `stage_provider = atom.extractor_provider`, `skill_version = atom.extractor_skill_version`, `reason = body.reason`. (Training-signal table is part of the cognition self-improvement loop; if the table doesn't exist yet, a stub log line writes to the operations log with a `training_signal_pending` marker.)
- [ ] Service tests cover: simple retraction with no consumers; retraction with one brief consumer (verify brief flagged); retraction with derived atom (verify transitive walk); cycle case (atom A → atom B → atom A) does not infinite-loop; already-retracted re-attempt returns 409.

## Notes

Reference implementation in refactor plan §4.2 — copy-paste-adapt the cascade walk.

**Why human-only retraction**: retraction is a sharp tool. Cascading regen of briefs and surfacing of sent actions is expensive and consequential. v1 does not auto-retract on the cognition's own confidence drop — that's a v2 hardening once we trust the inference loop more. The endpoint requires a human to call it (or a privileged internal pipeline; no MCP exposure to Claude Desktop).

**Why a reason enum**: the four reason values map to four different downstream behaviours in the self-improvement loop. `hallucination` is the highest-signal training input (the cognition produced something with no source backing). `corrected_on_review` is the lowest signal (the source was right, the human just changed their interpretation). The enum keeps this categorisation clean.

**Operations log hook (#089)**: this issue depends on the operations log infrastructure landing first. If #089 hasn't shipped yet, this issue uses a plain structlog `info` call as a stand-in; the integration with the structured operations log is a small follow-up.

**Cascade scope**: forward provenance (`atom_contributions`) finds direct consumers. The walk is transitive on `derived_atom` consumers only — a derived atom's consumers are walked recursively. Brief/draft/sent consumers are leaves (no further walk).

**This is the closing piece of Phase B's accountability layer.** With #082 (extraction discipline), #083 (forward provenance), and #084 (retraction), the system has end-to-end accountability for every atom: who produced it, with what confidence, what depends on it, and how to undo it cleanly.
