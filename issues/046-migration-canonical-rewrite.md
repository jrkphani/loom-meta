# 046 — Migration: Claude canonical rewrite

**Workstream:** W9
**Tag:** AFK
**Blocked by:** #045
**User stories:** US-5

## Behaviour

The canonical rewrite stage uses Claude to transform each cleaned note into Loom's structured format: it produces a list of typed atoms (decisions, commitments, asks, risks, status_updates) and a body summary. The output is richer than the extraction in W3 (#010) because migration content may be multi-event summaries from older notes. Claude is asked to infer dates and context where they are missing.

## Acceptance criteria

- [ ] `POST /v1/migration/process?stage=canonical_rewrite` processes the next batch of pre-passed files through Claude rewrite.
- [ ] Claude receives: the cleaned note text + a system prompt describing Loom's atom types + instruction to produce structured JSON with atoms + body_summary + inferred `occurred_at`.
- [ ] The Claude response is parsed into atoms and stored in `atoms` (or a staging area pending confidence scoring).
- [ ] A `confidence_score` (0–1) is extracted from Claude's response (Claude is asked to rate its own confidence).
- [ ] `migration_records.llm_used` is updated to include `claude`.
- [ ] Unit tests mock Claude; snapshot test asserts atom types and confidence_score are populated from fixture response.

## Notes

The rewrite prompt is more complex than the W3 extraction prompt because migration notes may contain weeks of content mixed together. Instruct Claude to split into multiple atoms if the note covers multiple events.

Claude's confidence score is a heuristic: "How confident are you that these atoms accurately represent the original note?" (0 = guessing, 1 = certain). Use this to set `migration_records.confidence_score`.

The atoms produced at this stage are stored in `atoms` with `event_id` pointing to a migration-created event (type `research` or `inbox_derived`). A `migration_records` row links via `canonical_event_id`.
