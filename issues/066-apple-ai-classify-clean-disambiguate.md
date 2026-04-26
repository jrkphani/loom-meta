# 066 — Apple AI sidecar: classify-domain, clean-note, and disambiguate endpoints

**Workstream:** W12
**Tag:** AFK
**Blocked by:** #065
**User stories:** US-3, US-27, US-36

## Behaviour

Three additional Apple AI endpoints cover the remaining routing tasks: classifying content into a Loom domain, cleaning and normalising a note before migration processing, and resolving entity mentions when fuzzy matching is ambiguous. All three use `LanguageModelSession` with `@Generable` output types.

## Acceptance criteria

- [ ] `POST /v1/classify-domain` accepts `{text: String}` and returns `{domain: String, confidence: Float}` where `domain` is one of the configured domains (`work` in v1).
- [ ] `POST /v1/clean-note` accepts `{text: String}` and returns `{cleaned_text: String}` with normalised whitespace, date formats, and removed filler.
- [ ] `POST /v1/disambiguate` accepts `{mention: String, context: String, candidates: [String]}` and returns `{best_match: String?, reasoning: String}`.
- [ ] All three follow the same `@Generable` pattern as #065.
- [ ] Unit tests for response schema on all three endpoints (mocked LLM).
- [ ] `swift test` passes with zero errors.

## Notes

`/v1/classify-domain` in v1 will almost always return `work`. The endpoint exists to support future multi-domain classification. Prompt: "This note belongs to which Loom domain? Options: work."

`/v1/clean-note` should NOT re-interpret or summarise — it should normalise formatting, fix encoding artefacts, and standardise date formats (e.g., "17/04" → "2026-04-17"). It must NOT change the meaning.

`/v1/disambiguate` is the Apple AI equivalent of the Claude disambiguation call (#042). For low-confidence cases, the call goes to Claude instead (controlled by Loom Core's routing logic in #067).
