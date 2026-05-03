# 011 — Atom extractor: Apple AI tier

**Workstream:** W3
**Tag:** AFK
**Blocked by:** #010, #068
**User stories:** US-1, US-2, US-36

## Behaviour

High-volume, quality-tolerant extraction tasks (tagging, summarisation, domain classification) are routed to the Apple AI sidecar rather than the Claude API. The Loom Core Apple AI client calls the sidecar endpoints for summarise and extract-tags. If the sidecar is unavailable, the client falls back to the Claude API for the same task. This tier does not perform primary atom extraction (that stays on Claude); it handles the supplementary tasks that produce `source_metadata` enrichments and atom confidence scores.

## Acceptance criteria

- [ ] After Claude extraction runs, the Apple AI tier calls `POST /v1/summarize` on the sidecar to produce `body_summary` for the event if not already set.
- [ ] The Apple AI tier calls `POST /v1/extract-tags` to produce tag suggestions for the event (stored as entity_tags once #026 exists; for now, logged and discarded).
- [ ] When the Apple AI sidecar returns a non-200 response or times out, the Loom Core client falls back to Claude for the same task without crashing.
- [ ] The fallback is logged at WARNING level with the failure reason.
- [ ] Service tests mock both the sidecar HTTP client and the Claude fallback client; test both the happy path and the fallback path.

## Notes

Depends on #068 (Loom Core Apple AI HTTP client) from W12. If W12 is not yet done, stub the client with a `NotImplementedError` or a config flag `apple_ai.enabled = false`. The extractor must degrade gracefully when the sidecar is absent.

The Apple AI client lives in `loom-core/src/loom_core/llm/apple_ai.py` (created in #068). This issue wires it into the extraction pipeline.

LLM routing principle (PRD §6.1): "Anything user-visible at quality → Claude; high-volume / quality-tolerant → Apple AI."

Pipeline location: `loom-core/src/loom_core/pipelines/extractor_apple_ai.py`.

---

## v0.8 Alignment Addendum

**Depends on:** #076 (schema), #080 (cognition router), #081 (adversarial input)

The Apple AI tier under v0.8 routes through `CognitionRouter` rather than calling the `apple_ai` HTTP client directly. The privacy gate ensures `private` and `stakeholder_set` scopes can stay on Apple FM (the local provider) while `engagement_scoped` and `domain_wide` may use either Apple FM or a cloud fallback per matrix.

### Additional acceptance criteria

- [ ] Calls go through `CognitionRouter.call_stage(stage='atom_extraction_structured' | 'identity_match_fuzzy' | 'tone_shift_detection', ...)` rather than direct apple_ai HTTP client calls.
- [ ] Source content for tag/summary stages is wrapped via `wrap_untrusted` (#081).
- [ ] When the cognition router downshifts a Tier-3 stage to claude_api due to Apple FM unavailability, the privacy gate blocks the downshift if `visibility_scope in {'private', 'stakeholder_set'}` and surfaces an explicit failure rather than silently leaking.
- [ ] When Apple FM HTTP is unavailable AND privacy gate blocks fallback, the stage returns a typed `LocalOnlyUnavailableError`; the caller logs at WARNING and queues for retry rather than crashing.
- [ ] Atom rows produced via Apple FM populate `extractor_provider = 'apple_fm'` plus the model_version / skill_version / confidence fields.

