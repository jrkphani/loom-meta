# 045 — Migration: domain classification and Apple AI pre-pass

**Workstream:** W9
**Tag:** AFK
**Blocked by:** #044, #067
**User stories:** US-5

## Behaviour

The first processing pass runs two Apple AI calls per file: (1) classify which Loom domain the file belongs to (`work` in v1, but classification is explicit to avoid noise), and (2) a pre-pass cleanup that fixes formatting issues, normalises dates, and removes personal identifiers that don't belong in structured atoms. Files classified as non-`work` domain are skipped with a note. The pre-pass output is the clean input for the canonical rewrite stage.

## Acceptance criteria

- [ ] `POST /v1/migration/process?stage=classify_prepass` processes the next batch of pending `migration_records` through domain classification + pre-pass cleanup.
- [ ] The Apple AI `classify-domain` endpoint is called; responses not matching `work` result in `migration_records` row skipped (confidence_tier updated to explain skip).
- [ ] The Apple AI `clean-note` endpoint is called on `work`-classified files; output is stored in a temp path for the next stage.
- [ ] Both Apple AI calls fall back to Claude if the sidecar is unavailable; `llm_used = 'both'` is recorded in `migration_records`.
- [ ] `migration_records.llm_used` is set to `apple_ai`, `claude`, or `both` depending on which tier was used.
- [ ] Unit tests mock both Apple AI endpoints; test: work classification → proceeds; non-work → skipped; Apple AI fallback → Claude used and recorded.

## Notes

Depends on #067 (Apple AI classify-domain + clean-note endpoints from W12). If W12 is not done, implement with a stub that returns `domain = 'work'` and passes through the text unchanged.

The cleaned text is written to `archive/work/originals/_{filename}_clean.md` (temp file). Only the original is archived permanently — the clean version is ephemeral.

`llm_used` enum: `claude`, `apple_ai`, `both`.
